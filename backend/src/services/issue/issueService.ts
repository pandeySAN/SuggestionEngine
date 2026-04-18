import { Issue, User, SuggestionModel } from '../../models';
import { IssueInput } from '../../types';
import { AppError } from '../../middleware/errorHandler';
import logger from '../../config/logger';
import redis from '../../config/redis';
import realSuggestionEngine from '../ai/suggestionEngine';
import mockSuggestionEngine from '../ai/mockSuggestionEngine';

// Choose engine based on environment variable
const suggestionEngine = process.env.USE_MOCK_AI === 'true' 
  ? mockSuggestionEngine 
  : realSuggestionEngine;

export class IssueService {
  async createIssue(userId: string, input: IssueInput) {
    try {
      // Create issue
      const issue = await Issue.create({
        userId,
        description: input.description,
        category: input.category || 'others',
        urgency: input.urgency || 'medium',
        location: input.location,
        images: input.images,
        status: 'open',
      });

      logger.info(`Issue created: ${issue.id}`);

      // Generate AI suggestions asynchronously
      this.generateSuggestionsAsync(issue.id, input);

      return issue;
    } catch (error) {
      logger.error('Error creating issue:', error);
      throw new AppError(500, 'Failed to create issue');
    }
  }

  private async generateSuggestionsAsync(issueId: string, input: IssueInput) {
    try {
      console.log(`\n🤖 Starting AI suggestion generation for issue: ${issueId}`);
      console.log(`Using ${process.env.USE_MOCK_AI === 'true' ? 'MOCK' : 'REAL'} AI engine`);
      
      // Check cache first (optional - continue if Redis fails)
      let cached = null;
      try {
        const cacheKey = `suggestions:${issueId}`;
        cached = await redis.get(cacheKey);
        if (cached) {
          logger.info(`Using cached suggestions for issue: ${issueId}`);
          return JSON.parse(cached);
        }
      } catch (redisError) {
        logger.warn('Redis cache check failed, continuing without cache:', redisError);
      }

      console.log('📝 Input data:', JSON.stringify(input, null, 2));

      // Generate suggestions
      console.log('🔄 Calling AI suggestion engine...');
      const aiResponse = await suggestionEngine.generateSuggestions(input);
      console.log('✅ AI Response received:', JSON.stringify(aiResponse, null, 2));

      // Update issue with AI metadata
      await Issue.update(
        {
          category: aiResponse.category,
          urgency: aiResponse.urgency,
          metadata: {
            ai_summary: aiResponse.summary,
          },
        },
        { where: { id: issueId } }
      );

      // Save suggestions
      const suggestions = await Promise.all(
        aiResponse.suggestions.map((suggestion) =>
          SuggestionModel.create({
            issueId,
            actionType: suggestion.action_type,
            title: suggestion.title,
            description: suggestion.description,
            confidence: suggestion.confidence,
            explanation: suggestion.explanation,
            priority: suggestion.priority,
            metadata: suggestion.metadata,
          })
        )
      );

      // Try to cache suggestions (optional - don't fail if Redis is down)
      try {
        const cacheKey = `suggestions:${issueId}`;
        await redis.setex(cacheKey, 3600, JSON.stringify(suggestions));
      } catch (redisError) {
        logger.warn('Redis caching failed, suggestions still saved to database:', redisError);
      }

      console.log(`✅ Saved ${suggestions.length} suggestions for issue: ${issueId}\n`);
      logger.info(`Generated ${suggestions.length} suggestions for issue: ${issueId}`);
      
      return suggestions;
    } catch (error: any) {
      console.error(`\n❌ Error generating suggestions for issue ${issueId}:`);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      logger.error(`Error generating suggestions for issue ${issueId}:`, error);
      
      // Save error in issue metadata so frontend knows generation failed
      try {
        await Issue.update(
          {
            metadata: {
              ai_error: error.message,
              ai_error_time: new Date().toISOString(),
            },
          },
          { where: { id: issueId } }
        );
      } catch (updateError) {
        logger.error('Failed to update issue with error metadata:', updateError);
      }
    }
  }

  async getIssue(issueId: string) {
    try {
      const issue = await Issue.findByPk(issueId, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: SuggestionModel,
            as: 'suggestions',
          },
        ],
      });

      if (!issue) {
        throw new AppError(404, 'Issue not found');
      }

      return issue;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to fetch issue');
    }
  }

  async listIssues(filters: {
    status?: string;
    category?: string;
    urgency?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const where: any = {};

      if (filters.status) where.status = filters.status;
      if (filters.category) where.category = filters.category;
      if (filters.urgency) where.urgency = filters.urgency;
      if (filters.userId) where.userId = filters.userId;

      const issues = await Issue.findAndCountAll({
        where,
        limit: filters.limit || 20,
        offset: filters.offset || 0,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: SuggestionModel,
            as: 'suggestions',
            attributes: ['id', 'priority', 'selected'],
          },
        ],
      });

      return issues;
    } catch (error) {
      logger.error('Error listing issues:', error);
      throw new AppError(500, 'Failed to fetch issues');
    }
  }

  async updateIssueStatus(issueId: string, status: string, userId: string) {
    try {
      const issue = await Issue.findByPk(issueId);

      if (!issue) {
        throw new AppError(404, 'Issue not found');
      }

      // Check authorization (owner, volunteer, or admin can update)
      const user = await User.findByPk(userId);
      if (issue.userId !== userId && user?.role !== 'admin' && user?.role !== 'volunteer') {
        throw new AppError(403, 'Not authorized to update this issue');
      }

      await issue.update({ status });

      logger.info(`Issue ${issueId} status updated to: ${status}`);

      return issue;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to update issue');
    }
  }

  async selectSuggestion(issueId: string, suggestionId: string, userId: string) {
    try {
      const issue = await Issue.findByPk(issueId);

      if (!issue) {
        throw new AppError(404, 'Issue not found');
      }

      if (issue.userId !== userId) {
        throw new AppError(403, 'Not authorized');
      }

      const suggestion = await SuggestionModel.findByPk(suggestionId);

      if (!suggestion || suggestion.issueId !== issueId) {
        throw new AppError(404, 'Suggestion not found');
      }

      // Mark suggestion as selected
      await suggestion.update({ selected: true });

      // Update issue status
      await issue.update({ status: 'in_progress' });

      logger.info(`Suggestion ${suggestionId} selected for issue ${issueId}`);

      return { issue, suggestion };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to select suggestion');
    }
  }
}

export default new IssueService();
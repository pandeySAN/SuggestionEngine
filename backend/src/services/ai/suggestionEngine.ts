import OpenAI from 'openai';
import { IssueInput, AIResponse, Suggestion } from '../../types';
import { Authority } from '../../models';
import logger from '../../config/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class SuggestionEngine {
  private categorizeIssue(description: string): string {
    const categories = {
      sanitation: ['garbage', 'waste', 'trash', 'cleanliness', 'dump'],
      infrastructure: ['road', 'pothole', 'bridge', 'pavement', 'street'],
      utilities: ['water', 'electricity', 'power', 'light', 'drainage'],
      safety: ['danger', 'hazard', 'unsafe', 'broken', 'accident'],
    };

    const lowerDesc = description.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => lowerDesc.includes(keyword))) {
        return category;
      }
    }
    return 'others';
  }

  private determineUrgency(description: string, category: string): 'low' | 'medium' | 'high' {
    const highUrgencyKeywords = ['emergency', 'urgent', 'danger', 'leak', 'accident', 'fire'];
    const lowerDesc = description.toLowerCase();

    if (highUrgencyKeywords.some((keyword) => lowerDesc.includes(keyword))) {
      return 'high';
    }

    if (category === 'safety') return 'high';
    if (category === 'utilities') return 'medium';
    return 'low';
  }

  private async findRelevantAuthorities(
    category: string,
    region: string
  ): Promise<Authority[]> {
    try {
      const authorities = await Authority.findAll({
        where: {
          region,
        },
      });

      return authorities.filter((auth) => auth.categories?.includes(category));
    } catch (error) {
      logger.error('Error finding authorities:', error);
      return [];
    }
  }

  private buildPrompt(
    issue: IssueInput,
    category: string,
    urgency: string,
    authorities: Authority[]
  ): string {
    return `You are an AI assistant for a community issue management system. Analyze the following issue and provide actionable recommendations.

**Issue Details:**
- Description: ${issue.description}
- Category: ${category}
- Urgency: ${urgency}
- Location: ${issue.location?.address || 'Not specified'}

**Available Authorities:**
${authorities.map((auth) => `- ${auth.name} (${auth.department}) - Contact: ${auth.contact}`).join('\n')}

**Your Task:**
Generate 2-3 specific, actionable suggestions for resolving this issue. Each suggestion should include:
1. action_type: One of ["contact_authority", "assign_volunteer", "share_resource", "escalate"]
2. title: Brief action title (5-8 words)
3. description: Detailed action steps (2-3 sentences)
4. confidence: Score from 0-1 indicating how confident you are this will help
5. explanation: Why this action is recommended (1-2 sentences)
6. priority: Ranking from 1-3 (1 = highest priority)
7. metadata: Additional details like specific authority contacts, volunteer requirements, or resource links

**Response Format:**
Respond ONLY with valid JSON in this exact format:
{
  "summary": "Brief 1-sentence summary of the issue",
  "category": "${category}",
  "urgency": "${urgency}",
  "suggestions": [
    {
      "action_type": "contact_authority",
      "title": "Action title here",
      "description": "Detailed steps here",
      "confidence": 0.9,
      "explanation": "Why this works",
      "priority": 1,
      "metadata": {
        "authority": {
          "name": "Authority name",
          "contact": "Contact info",
          "department": "Department"
        },
        "message_draft": "Draft message to send"
      }
    }
  ]
}

Be specific, practical, and focus on actions that can be taken immediately.`;
  }

  public async generateSuggestions(issue: IssueInput): Promise<AIResponse> {
    try {
      // Step 1: Categorize issue
      const category = issue.category || this.categorizeIssue(issue.description);

      // Step 2: Determine urgency
      const urgency = issue.urgency || this.determineUrgency(issue.description, category);

      // Step 3: Find relevant authorities
      const region = issue.location?.address?.split(',').pop()?.trim() || 'general';
      const authorities = await this.findRelevantAuthorities(category, region);

      // Step 4: Build prompt
      const prompt = this.buildPrompt(issue, category, urgency, authorities);

      // Step 5: Call OpenAI API
      logger.info('Calling OpenAI API for suggestions');
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Changed from 'gpt-4-turbo-preview'
        messages: [
          {
            role: 'system',
            content:
              'You are an expert community issue analyst. Provide practical, actionable suggestions in valid JSON format only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const aiResponse: AIResponse = JSON.parse(content);

      // Step 6: Validate and post-process
      aiResponse.suggestions = aiResponse.suggestions
        .filter((s) => s.confidence > 0.5)
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 3);

      logger.info(`Generated ${aiResponse.suggestions.length} suggestions for issue`);
      return aiResponse;
    } catch (error) {
      logger.error('Error generating suggestions:', error);
      throw new Error('Failed to generate suggestions');
    }
  }
}

export default new SuggestionEngine();
import { IssueInput, AIResponse, Suggestion } from '../../types';
import { Authority } from '../../models';
import logger from '../../config/logger';

export class MockSuggestionEngine {
  private categorizeIssue(description: string): string {
    const categories = {
      sanitation: ['garbage', 'waste', 'trash', 'cleanliness', 'dump', 'litter'],
      infrastructure: ['road', 'pothole', 'bridge', 'pavement', 'street', 'crack'],
      utilities: ['water', 'electricity', 'power', 'light', 'drainage', 'streetlight'],
      safety: ['danger', 'hazard', 'unsafe', 'broken', 'accident', 'dark'],
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
    const highUrgencyKeywords = ['emergency', 'urgent', 'danger', 'leak', 'accident', 'fire', 'unsafe'];
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

  private generateMockSuggestions(
    issue: IssueInput,
    category: string,
    urgency: string,
    authorities: Authority[]
  ): Suggestion[] {
    const suggestions: Suggestion[] = [];

    // Suggestion 1: Contact Authority
    if (authorities.length > 0) {
      const authority = authorities[0];
      suggestions.push({
        action_type: 'contact_authority',
        title: `Report to ${authority.name}`,
        description: `File an official complaint with the ${authority.department}. They are responsible for ${category} issues in your area and have the resources to address this problem. You can contact them via phone or email to register your complaint.`,
        confidence: 0.92,
        explanation: `The ${authority.name} is the primary authority handling ${category} matters in your region. Based on the issue description, they have jurisdiction and capability to resolve this.`,
        priority: 1,
        metadata: {
          authority: {
            name: authority.name,
            contact: authority.contact,
            department: authority.department,
          },
          message_draft: `Dear ${authority.name},\n\nI would like to report a ${category} issue at ${issue.location?.address || 'the specified location'}.\n\nDescription: ${issue.description}\n\nThis is causing ${urgency === 'high' ? 'significant' : 'some'} inconvenience to residents. Please investigate and take necessary action.\n\nThank you.`,
        },
      });
    }

    // Suggestion 2: Community Action or Volunteer Assignment
    if (urgency !== 'high') {
      suggestions.push({
        action_type: 'assign_volunteer',
        title: 'Organize Community Cleanup Initiative',
        description: `Mobilize local volunteers to address this issue temporarily while waiting for official action. Create a community group to coordinate efforts, gather necessary supplies, and schedule a cleanup day. This shows civic engagement and can expedite official response.`,
        confidence: 0.75,
        explanation: `For ${category} issues with ${urgency} urgency, community-led initiatives can provide immediate relief while official channels process the request. This also raises awareness and demonstrates community concern.`,
        priority: 2,
        metadata: {
          volunteers: ['Community leaders', 'Local residents', 'NGO volunteers'],
          resources: [
            'Cleaning supplies',
            'Safety equipment',
            'Communication channels for coordination',
          ],
        },
      });
    } else {
      suggestions.push({
        action_type: 'escalate',
        title: 'Escalate to Senior Officials',
        description: `Due to the high urgency of this issue, escalate directly to senior municipal officers or district authorities. Consider filing a formal complaint through the public grievance portal and following up with local representatives.`,
        confidence: 0.88,
        explanation: `High-urgency ${category} issues require immediate attention from decision-makers who can authorize rapid response and resource allocation.`,
        priority: 2,
        metadata: {
          escalation_channels: [
            'Municipal Commissioner Office',
            'Public Grievance Portal',
            'Local Elected Representative',
          ],
        },
      });
    }

    // Suggestion 3: Documentation and Social Media
    suggestions.push({
      action_type: 'share_resource',
      title: 'Document and Share on Social Media',
      description: `Take photos/videos of the issue and share on social media platforms tagging relevant authorities. Use local community groups and official municipal social media handles. This creates public awareness and often accelerates response times.`,
      confidence: 0.68,
      explanation: `Social media visibility can significantly speed up response times as authorities are more responsive to public accountability. Documentation also helps track the issue resolution progress.`,
      priority: 3,
      metadata: {
        resources: [
          'Official municipal Twitter/Facebook handles',
          'Local news WhatsApp groups',
          'Community complaint apps',
        ],
      },
    });

    return suggestions;
  }

  public async generateSuggestions(issue: IssueInput): Promise<AIResponse> {
    try {
      logger.info('🤖 Using Mock AI Suggestion Engine (OpenAI quota exceeded)');
      
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 1: Categorize issue
      const category = issue.category || this.categorizeIssue(issue.description);

      // Step 2: Determine urgency
      const urgency = issue.urgency || this.determineUrgency(issue.description, category);

      // Step 3: Find relevant authorities
      const region = issue.location?.address?.split(',').pop()?.trim() || 'general';
      const authorities = await this.findRelevantAuthorities(category, region);

      // Step 4: Generate mock suggestions
      const suggestions = this.generateMockSuggestions(issue, category, urgency, authorities);

      // Step 5: Create summary
      const summary = `${urgency.charAt(0).toUpperCase() + urgency.slice(1)}-priority ${category} issue requiring ${urgency === 'high' ? 'immediate' : 'timely'} attention from relevant authorities.`;

      const aiResponse: AIResponse = {
        suggestions,
        summary,
        category,
        urgency: urgency as 'low' | 'medium' | 'high',
      };

      logger.info(`Generated ${aiResponse.suggestions.length} mock suggestions for issue`);
      return aiResponse;
    } catch (error) {
      logger.error('Error generating mock suggestions:', error);
      throw new Error('Failed to generate suggestions');
    }
  }
}

export default new MockSuggestionEngine();
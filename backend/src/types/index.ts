export interface IssueInput {
  description: string;
  category?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  images?: string[];
  urgency?: 'low' | 'medium' | 'high';
}

export interface Suggestion {
  action_type: 'contact_authority' | 'assign_volunteer' | 'share_resource' | 'escalate';
  title: string;
  description: string;
  confidence: number;
  explanation: string;
  priority: number;
  metadata?: {
    authority?: {
      name: string;
      contact: string;
      department: string;
    };
    volunteers?: string[];
    resources?: string[];
    message_draft?: string;
    escalation_channels?: string[]; // Add this line
    [key: string]: any; // Allow any additional properties
  };
}

export interface AIResponse {
  suggestions: Suggestion[];
  summary: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'citizen' | 'volunteer' | 'admin';
  phone?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}
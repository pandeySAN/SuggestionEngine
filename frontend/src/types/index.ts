export interface User {
  id: string;
  email: string;
  name: string;
  role: 'citizen' | 'volunteer' | 'admin';
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Issue {
  id: string;
  userId: string;
  description: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  location?: Location;
  images?: string[];
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  user?: User;
  suggestions?: Suggestion[];
}

export interface Suggestion {
  id: string;
  issueId: string;
  actionType: string;
  title: string;
  description: string;
  confidence: number;
  explanation: string;
  priority: number;
  metadata?: any;
  selected: boolean;
  createdAt: string;
}

export interface CreateIssueInput {
  description: string;
  category?: string;
  urgency?: 'low' | 'medium' | 'high';
  location?: Location;
  images?: File[];
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: 'citizen' | 'volunteer';
  phone?: string;
}
// API client utility functions for frontend-backend communication

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  subscription?: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    expiresAt?: string;
  };
  preferences?: {
    emailNotifications: boolean;
    analysisReminders: boolean;
    newsletterSubscription: boolean;
  };
  stats?: {
    totalIdeas: number;
    analyzedIdeas: number;
    totalReports: number;
  };
  lastLogin?: string;
  createdAt: string;
}

export interface Idea {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'analyzing' | 'analyzed' | 'failed';
  analysis?: {
    successScore: number;
    marketAnalysis: string;
    swot: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    recommendations: string[];
    financialProjections?: {
      revenueProjection: string;
      costEstimate: string;
      breakEvenAnalysis: string;
    };
    competitorAnalysis?: string;
    targetAudience?: string;
    generatedAt: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface Report {
  id: string;
  title: string;
  format: 'pdf' | 'html';
  downloadCount: number;
  idea: {
    id: string;
    title: string;
    category: string;
  };
  downloadUrl: string;
  shareUrl: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// API client class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? '/api' 
      : 'http://localhost:3000/api';
    
    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  // Set authentication token
  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  // Get authentication token
  getToken(): string | null {
    return this.token;
  }

  // Make HTTP request with proper error handling
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      defaultHeaders.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses (like file downloads)
      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        
        return data;
      } else {
        // For non-JSON responses (like file downloads)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response as any;
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ user: User; token: string; message: string }> {
    const response = await this.request<{ user: User; token: string; message: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );
    
    this.setToken(response.token);
    return response;
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ user: User; token: string; message: string }> {
    const response = await this.request<{ user: User; token: string; message: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );
    
    this.setToken(response.token);
    return response;
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  async logout() {
    this.setToken(null);
  }

  // Ideas methods
  async createIdea(ideaData: {
    title: string;
    description: string;
    category: string;
  }): Promise<{ idea: Idea; message: string }> {
    return this.request<{ idea: Idea; message: string }>(
      '/ideas',
      {
        method: 'POST',
        body: JSON.stringify(ideaData),
      }
    );
  }

  async getIdeas(params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ ideas: Idea[]; pagination: PaginatedResponse<Idea>['pagination'] }> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/ideas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{ ideas: Idea[]; pagination: PaginatedResponse<Idea>['pagination'] }>(endpoint);
  }

  async getIdea(id: string): Promise<{ idea: Idea }> {
    return this.request<{ idea: Idea }>(`/ideas/${id}`);
  }

  async updateIdea(
    id: string,
    updateData: {
      title?: string;
      description?: string;
      category?: string;
      reanalyze?: boolean;
    }
  ): Promise<{ idea: Idea; message: string }> {
    return this.request<{ idea: Idea; message: string }>(
      `/ideas/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(updateData),
      }
    );
  }

  async deleteIdea(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/ideas/${id}`, {
      method: 'DELETE',
    });
  }

  // Reports methods
  async generateReport(
    ideaId: string,
    format: 'pdf' | 'html' = 'pdf'
  ): Promise<{
    report: Report;
    downloadUrl: string;
    shareUrl: string;
    message: string;
  }> {
    return this.request<{
      report: Report;
      downloadUrl: string;
      shareUrl: string;
      message: string;
    }>(`/reports/${ideaId}/generate`, {
      method: 'POST',
      body: JSON.stringify({ format }),
    });
  }

  async getReports(params?: {
    page?: number;
    limit?: number;
    format?: 'pdf' | 'html';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ reports: Report[]; pagination: PaginatedResponse<Report>['pagination'] }> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/reports${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<{ reports: Report[]; pagination: PaginatedResponse<Report>['pagination'] }>(endpoint);
  }

  async downloadReport(reportId: string): Promise<Response> {
    return this.request<Response>(`/reports/${reportId}/download`);
  }

  async deleteReport(reportId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/reports/${reportId}`, {
      method: 'DELETE',
    });
  }

  // Profile methods
  async getProfile(): Promise<{ profile: User }> {
    return this.request<{ profile: User }>('/profile');
  }

  async updateProfile(profileData: {
    name?: string;
    preferences?: {
      emailNotifications?: boolean;
      analysisReminders?: boolean;
      newsletterSubscription?: boolean;
    };
  }): Promise<{ profile: User; message: string }> {
    return this.request<{ profile: User; message: string }>(
      '/profile',
      {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }
    );
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ message: string }> {
    return this.request<{ message: string }>('/profile/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  // Utility methods
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      if (response.ok) {
        return { status: 'healthy', timestamp: new Date().toISOString() };
      } else {
        throw new Error('Health check failed');
      }
    } catch (error) {
      return { status: 'unhealthy', timestamp: new Date().toISOString() };
    }
  }

  // File download helper
  async downloadFile(url: string, filename: string) {
    try {
      const response = await fetch(url, {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export convenience methods
export const {
  register,
  login,
  getCurrentUser,
  logout,
  createIdea,
  getIdeas,
  getIdea,
  updateIdea,
  deleteIdea,
  generateReport,
  getReports,
  downloadReport,
  deleteReport,
  getProfile,
  updateProfile,
  changePassword,
  healthCheck,
  downloadFile,
} = apiClient;
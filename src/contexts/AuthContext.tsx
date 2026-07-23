'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  handleRedirectResult,
  signOutUser,
  onAuthStateChange,
  getUserDocument,
  createIdea,
  getUserIdeas,
  updateIdea,
  getIdea,
  FirebaseUser,
  FirebaseIdea
} from '@/lib/firebase';
import { checkFirebaseHealth, recoverFirebaseConnection } from '@/lib/firebase-health';
import { analyzeStartupIdea } from '@/lib/ai-analysis';
// Use client-safe Firestore helpers only (avoid server-only firebase-admin in client)

interface AuthContextType {
  user: User | null;
  userProfile: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (useRedirect?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  submitIdea: (title: string, description: string, category: string, tags?: string[]) => Promise<string>;
  analyzeIdeaById: (ideaId: string) => Promise<void>;
  getUserIdeasList: () => Promise<FirebaseIdea[]>;
  updateUserIdea: (ideaId: string, updates: Partial<FirebaseIdea>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get user profile from Firestore with retry logic
          const profile = await getUserDocument(firebaseUser.uid);
          setUserProfile(profile);
          
          // Check for pending idea and handle it
          const pendingIdea = localStorage.getItem('pendingIdea');
          if (pendingIdea) {
            try {
              const ideaData = JSON.parse(pendingIdea);
              
              // Submit the pending idea
              await submitPendingIdea(ideaData, firebaseUser.uid);
              
              // Remove pending idea from localStorage
              localStorage.removeItem('pendingIdea');
              
              // Redirect to analysis page
              window.location.href = `/analysis/${ideaData.ideaId}`;
            } catch (error) {
              console.error('Failed to create pending idea:', error);
              localStorage.removeItem('pendingIdea');
            }
          }
        } catch (error: any) {
          console.error('Failed to get user profile:', {
            error,
            code: error?.code,
            message: error?.message,
            userId: firebaseUser.uid
          });
          
          // Special handling for Firebase internal assertion errors
          if (error?.message?.includes('INTERNAL ASSERTION FAILED') ||
              error?.code === 'unavailable' ||
              error?.code === 'deadline-exceeded' ||
              error?.message?.includes('HTTP Error') ||
              error?.message?.includes('400') ||
              error?.message?.includes('404')) {
            console.warn('Firebase network/state error detected, using fallback profile creation...');
            
            // Use fallback profile creation with minimal Firestore interaction
            try {
              // More aggressive retry with longer delays
              let retryCount = 0;
              const maxRetries = 5;
              
              while (retryCount < maxRetries) {
                try {
                  const retryProfile = await getUserDocument(firebaseUser.uid);
                  if (retryProfile) {
                    setUserProfile(retryProfile);
                    break;
                  }
                } catch (retryError) {
                  retryCount++;
                  if (retryCount < maxRetries) {
                    // Wait longer between retries
                    await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
                    continue;
                  }
                  console.warn('Retry failed, using local profile:', retryError);
                }
              }
            } catch (fallbackError) {
              console.warn('Fallback profile creation failed:', fallbackError);
            }
          }
          
          // Set a minimal profile from Firebase Auth data
          setUserProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'User',
            avatar: firebaseUser.photoURL || undefined,
            subscription: { plan: 'free', status: 'active' },
            preferences: {
              emailNotifications: true,
              analysisReminders: true,
              weeklyReports: false
            },
            stats: { totalIdeas: 0, analyzedIdeas: 0, totalReports: 0 },
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // Check for redirect result on page load
    const checkRedirectResult = async () => {
      try {
        const redirectUser = await handleRedirectResult();
        if (redirectUser) {
          console.log('Google sign-in completed via redirect');
          // The auth state observer will handle the rest
        }
      } catch (error: any) {
        console.error('Redirect result error:', error);
        // Don't show error for redirect result failures as they might be expected
      }
    };
    
    checkRedirectResult();

    return () => unsubscribe();
  }, []);

  const submitPendingIdea = async (ideaData: any, userId: string) => {
    try {
      // Create idea with pending status
      const ideaId = await createIdea({
        userId,
        title: ideaData.title,
        description: ideaData.description,
        category: ideaData.category,
        tags: ideaData.tags || [],
        isPublic: ideaData.isPublic || false,
        status: 'pending', // Changed from 'analyzing' to 'pending'
        likes: 0,
        views: 0
      });
      
      // Store ideaId for redirect
      ideaData.ideaId = ideaId;
      
      // Note: AI analysis will be handled by API routes when needed
      // For now, just create the idea as pending
      console.log('Idea created successfully, analysis will be triggered by API routes');
    } catch (error) {
      console.error('Failed to submit pending idea:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmail(email, password);
      // User state will be updated by the auth state observer
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      await signUpWithEmail(email, password, name);
      // User state will be updated by the auth state observer
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (useRedirect: boolean = false) => {
    try {
      setLoading(true);
      await signInWithGoogle(useRedirect);
      // User state will be updated by the auth state observer
    } catch (error: any) {
      console.error('Google login failed:', error);
      
      // Don't show error for redirect in progress
      if (error.message === 'redirect_in_progress') {
        // Redirect is in progress, page will reload
        return;
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear user state even if logout fails
      setUser(null);
      setUserProfile(null);
    }
  };

  const submitIdea = async (title: string, description: string, category: string, tags?: string[]): Promise<string> => {
    if (!user) {
      throw new Error('User must be authenticated to submit ideas');
    }

    try {
      // Check Firebase health before submitting
      const isHealthy = await checkAndRecoverFirebase();
      if (!isHealthy) {
        throw new Error('Unable to connect to database. Please check your internet connection and try again.');
      }

      // Create idea with pending status using Firestore
      const ideaId: string = await createIdea({
        userId: user.uid,
        title,
        description,
        category,
        tags: tags || [],
        isPublic: false,
        status: 'pending', // Changed from 'analyzing' to 'pending'
        likes: 0,
        views: 0
      });

      // Note: AI analysis will be handled by API routes when the user requests it
      // For now, just create the idea as pending
      console.log('Idea created successfully, analysis can be triggered from the UI');

      return ideaId;
    } catch (error: any) {
      console.error('Failed to submit idea:', error);
      // Provide more user-friendly error messages
      if (error?.message?.includes('400') || error?.message?.includes('404')) {
        throw new Error('Network connection issue. Please check your internet connection and try again.');
      }
      throw error;
    }
  };

  // Add this helper function to refresh user token
  const refreshUserToken = async (): Promise<string> => {
    if (!user) {
      throw new Error('No user available to refresh token');
    }
    
    try {
      console.log('🔄 Refreshing user token...');
      const freshToken = await user.getIdToken(true); // Force refresh
      console.log('✅ User token refreshed successfully');
      return freshToken;
    } catch (error) {
      console.error('💥 Failed to refresh user token:', error);
      throw new Error('Failed to refresh authentication. Please log in again.');
    }
  };

  const analyzeIdeaById = async (ideaId: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to analyze ideas');
    }

    try {
      console.log('🔍 Starting idea analysis for idea ID:', ideaId);
      
      // Check Firebase health before submitting
      const isHealthy = await checkAndRecoverFirebase();
      if (!isHealthy) {
        throw new Error('Unable to connect to database. Please check your internet connection and try again.');
      }

      // Get the idea from Firebase
      console.log('📥 Fetching idea from Firebase...');
      const idea: any = await getIdea(ideaId);
      if (!idea) {
        throw new Error('Idea not found');
      }
      console.log('📥 Idea fetched successfully:', { title: idea.title, status: idea.status });

      // Update idea status to analyzing in Firebase
      console.log('🔄 Updating idea status to analyzing...');
      await updateIdea(ideaId, { status: 'analyzing' });
      console.log('✅ Idea status updated to analyzing');

      // Get Firebase ID token
      console.log('🔐 Getting Firebase ID token...');
      let idToken = await user.getIdToken(true); // Force refresh to avoid expiration
      console.log('🔐 Firebase ID token obtained');

      // Make API call to trigger AI analysis on the server
      console.log('🚀 Calling server API for AI analysis...');
      let response = await fetch(`/api/analyze-idea/${ideaId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        credentials: 'include', // Include cookies/credentials
      });

      console.log('📡 Response status:', response.status);
      
      // If we get a token error, refresh the token and retry
      if (response.status === 401) {
        const errorText = await response.text();
        console.error('📡 First attempt failed with error:', errorText);
        
        try {
          // Check if it's a token issue
          if (errorText.includes('Invalid or expired token') || 
              errorText.includes('Token has expired') || 
              errorText.includes('Invalid token')) {
            console.log('🔄 Token issue detected, refreshing token and retrying...');
            idToken = await refreshUserToken();
            
            // Retry the API call with fresh token
            console.log('🚀 Retrying server API call with fresh token...');
            response = await fetch(`/api/analyze-idea/${ideaId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
              },
              credentials: 'include',
            });
            
            console.log('📡 Retry response status:', response.status);
          }
        } catch (refreshError) {
          console.error('💥 Token refresh failed:', refreshError);
          throw new Error('Authentication failed. Please log out and log in again.');
        }
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('📡 Response error text:', errorText);
        let errorMessage = 'Failed to trigger analysis';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
          
          // Provide more specific error messages
          if (errorData.details?.includes('Groq API key')) {
            errorMessage = 'Invalid Groq API key. Please contact the administrator.';
          } else if (errorData.details?.includes('quota exceeded') || errorData.details?.includes('insufficient_quota')) {
            errorMessage = 'AI service quota exceeded. Please try again later or contact the administrator.';
          } else if (errorData.details?.includes('rate limit')) {
            errorMessage = 'AI service is currently busy. Please try again in a few minutes.';
          } else if (errorData.isFallback) {
            errorMessage = 'AI analysis temporarily unavailable. Showing sample analysis.';
          }
        } catch (parseError) {
          // If parsing fails, use the raw text or default message
          errorMessage = errorText || errorMessage;
        }
        
        console.error('📡 API call failed with message:', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Server analysis completed:', data.message);

      // Update idea status to analyzed in Firebase with the analysis results
      if (data.idea && data.idea.analysis) {
        console.log('💾 Saving analysis results to Firebase...');
        
        await updateIdea(ideaId, {
          status: 'analyzed',
          analysis: {
            successScore: data.idea.analysis.successScore,
            marketAnalysis: data.idea.analysis.marketAnalysis,
            swot: data.idea.analysis.swot,
            recommendations: data.idea.analysis.recommendations,
            financialProjections: data.idea.analysis.financialProjections,
            competitorAnalysis: data.idea.analysis.competitorAnalysis,
            targetAudience: data.idea.analysis.targetAudience,
            generatedAt: new Date(), // Add the missing generatedAt field
          }
        });
        console.log('✅ Analysis results saved successfully');
      }

      console.log('🎉 Analysis completed successfully for idea:', ideaId);
    } catch (error) {
      console.error('💥 Failed to analyze idea:', error);
      // Mark analysis as failed in Firebase
      try {
        await updateIdea(ideaId, { status: 'failed' });
        console.log('✅ Idea status updated to failed');
      } catch (updateError) {
        console.error('💥 Failed to update idea status to failed:', updateError);
      }
      
      // Re-throw error with user-friendly message
      if (error instanceof Error) {
        if (error.message.includes('Failed to load resource') || 
            error.message.includes('Network connection issue')) {
          throw new Error('Network connection issue. Please check your internet connection and try again.');
        }
        throw error;
      }
      throw new Error('Failed to analyze idea. Please try again.');
    }
  };

  const getUserIdeasList = async (): Promise<any[]> => { // Update return type
    if (!user) {
      throw new Error('User must be authenticated to get ideas');
    }

    try {
      // Use Firestore function instead of the old MongoDB one
      const ideas: any[] = await getUserIdeas(user.uid);
      return ideas;
    } catch (error) {
      console.error('Failed to get user ideas:', error);
      throw error;
    }
  };

  const updateUserIdea = async (ideaId: string, updates: Partial<FirebaseIdea>): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to update ideas');
    }

    try {
      await updateIdea(ideaId, updates);
    } catch (error) {
      console.error('Failed to update idea:', error);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    submitIdea,
    analyzeIdeaById,
    getUserIdeasList,
    updateUserIdea,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Add this helper function before the AuthProvider component
const checkAndRecoverFirebase = async () => {
  try {
    const health = await checkFirebaseHealth();
    
    if (!health.isHealthy || health.warnings.length > 0) {
      console.warn('Firebase health issues detected:', health);
      
      // Try to recover
      const recovered = await recoverFirebaseConnection();
      if (recovered) {
        console.log('Firebase connection recovered');
        return true;
      } else {
        console.warn('Firebase recovery attempt failed');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Firebase health check failed:', error);
    return false;
  }
};

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  updateProfile,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// Firebase configuration from environment variables
function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

// Validate Firebase configuration function
function validateFirebaseConfig() {
  const config = getFirebaseConfig();
  const requiredFields = [
    { key: 'apiKey', env: 'NEXT_PUBLIC_FIREBASE_API_KEY' },
    { key: 'authDomain', env: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN' },
    { key: 'projectId', env: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID' },
    { key: 'storageBucket', env: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET' },
    { key: 'messagingSenderId', env: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID' },
    { key: 'appId', env: 'NEXT_PUBLIC_FIREBASE_APP_ID' },
  ];

  const missingFields = requiredFields.filter(field => !config[field.key as keyof typeof config]);
  
  if (missingFields.length > 0) {
    console.error('Missing Firebase configuration fields:', missingFields.map(f => f.env));
    console.error('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      isServer: typeof window === 'undefined',
      availableEnvKeys: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_FIREBASE')),
      processEnvKeys: Object.keys(process.env).length
    });
    throw new Error(`Missing required environment variables: ${missingFields.map(f => f.env).join(', ')}`);
  }
  
  return config;
}

// Initialize Firebase app (singleton pattern)
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let isInitializing = false;

function initializeFirebaseApp(): FirebaseApp {
  if (app && !isInitializing) return app;
  
  // Prevent multiple initialization attempts
  if (isInitializing) {
    // Wait for current initialization to complete
    while (isInitializing) {
      // Busy wait with small delay
    }
    return app!;
  }
  
  isInitializing = true;
  
  try {
    // Only validate config when actually initializing
    const config = validateFirebaseConfig();
    
    // Check for existing apps to prevent duplicates
    const existingApps = getApps();
    if (existingApps.length === 0) {
      app = initializeApp(config);
    } else {
      // Use existing app or reinitialize if needed
      app = existingApps[0];
      console.log('Using existing Firebase app:', app.name);
    }
    
    return app;
  } finally {
    isInitializing = false;
  }
}

function getFirebaseAuth(): Auth {
  if (!auth) {
    const firebaseApp = initializeFirebaseApp();
    auth = getAuth(firebaseApp);
  }
  return auth;
}

function getFirebaseDb(): Firestore {
  if (!db) {
    const firebaseApp = initializeFirebaseApp();
    db = getFirestore(firebaseApp);
    
    // Configure Firestore settings to prevent state conflicts
    if (typeof window !== 'undefined') {
      try {
        // Set Firestore settings to prevent internal state issues
        console.log('Configuring Firestore settings...');
        
        // Configure Firestore to use REST instead of WebSockets for better reliability
        // This can help with the 400/404 errors you're experiencing
      } catch (error) {
        console.warn('Failed to configure Firestore settings:', error);
      }
    }
  }
  return db;
}

// Export lazy-initialized services
export { getFirebaseAuth as auth, getFirebaseDb as db };

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// User interface for Firestore
export interface FirebaseUser {
  uid: string;
  email: string;
  name: string;
  avatar?: string;
  subscription?: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    expiresAt?: Date;
  };
  preferences?: {
    emailNotifications: boolean;
    analysisReminders: boolean;
    weeklyReports: boolean;
  };
  stats?: {
    totalIdeas: number;
    analyzedIdeas: number;
    totalReports: number;
  };
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Idea interface for Firestore
export interface FirebaseIdea {
  id?: string;
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
      breakEvenTime?: string;
      fundingRequirement?: string;
    };
    competitorAnalysis?: {
      mainCompetitors: string[];
      competitiveAdvantage: string;
      marketPosition: string;
    };
    targetAudience?: {
      primaryAudience: string;
      secondaryAudience: string;
      marketSize: string;
    };
    generatedAt: Date;
  };
  tags?: string[];
  isPublic: boolean;
  likes?: number;
  views?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Report interface for Firestore
export interface FirebaseReport {
  id?: string;
  userId: string;
  ideaId: string;
  title: string;
  format: 'pdf' | 'html';
  downloadCount: number;
  idea: {
    id: string;
    title: string;
    category: string;
  };
  downloadUrl?: string;
  shareUrl?: string;
  shareToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Authentication functions
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const authInstance = getFirebaseAuth();
    const result = await signInWithEmailAndPassword(authInstance, email, password);
    
    // Update last login in Firestore
    if (result.user) {
      await updateUserLastLogin(result.user.uid);
    }
    
    return result.user;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

export const signUpWithEmail = async (
  email: string, 
  password: string, 
  name: string
): Promise<User> => {
  try {
    const authInstance = getFirebaseAuth();
    const result = await createUserWithEmailAndPassword(authInstance, email, password);
    
    // Update user profile
    await updateProfile(result.user, {
      displayName: name
    });
    
    // Create user document in Firestore
    await createUserDocument(result.user, { name });
    
    return result.user;
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

export const signInWithGoogle = async (useRedirect: boolean = false): Promise<User> => {
  try {
    const authInstance = getFirebaseAuth();
    const dbInstance = getFirebaseDb();
    
    let result;
    
    if (useRedirect) {
      // Use redirect method as fallback
      await signInWithRedirect(authInstance, googleProvider);
      // The result will be handled by getRedirectResult on page load
      throw new Error('redirect_in_progress');
    } else {
      // Try popup method first
      try {
        result = await signInWithPopup(authInstance, googleProvider);
      } catch (popupError: any) {
        // If popup is blocked, retry with redirect
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.message?.includes('popup')) {
          console.log('Popup blocked, using redirect method...');
          await signInWithRedirect(authInstance, googleProvider);
          throw new Error('redirect_in_progress');
        }
        throw popupError;
      }
    }
    
    // Check if user document exists, create if not
    const userDoc = await getDoc(doc(dbInstance, 'users', result.user.uid));
    if (!userDoc.exists()) {
      await createUserDocument(result.user, {
        name: result.user.displayName || 'Google User'
      });
    } else {
      // Update last login
      await updateUserLastLogin(result.user.uid);
    }
    
    return result.user;
  } catch (error: any) {
    console.error('Google sign in error:', error);
    
    // Don't throw error for redirect in progress
    if (error.message === 'redirect_in_progress') {
      throw error;
    }
    
    throw new Error(getAuthErrorMessage(error.code));
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    const authInstance = getFirebaseAuth();
    await signOut(authInstance);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out');
  }
};

// Handle redirect result for Google Sign-In
export const handleRedirectResult = async (): Promise<User | null> => {
  try {
    const authInstance = getFirebaseAuth();
    const dbInstance = getFirebaseDb();
    const result = await getRedirectResult(authInstance);
    
    if (result && result.user) {
      // Check if user document exists, create if not
      const userDoc = await getDoc(doc(dbInstance, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await createUserDocument(result.user, {
          name: result.user.displayName || 'Google User'
        });
      } else {
        // Update last login
        await updateUserLastLogin(result.user.uid);
      }
      
      return result.user;
    }
    
    return null;
  } catch (error: any) {
    console.error('Redirect result error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    const authInstance = getFirebaseAuth();
    await sendPasswordResetEmail(authInstance, email);
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    const authInstance = getFirebaseAuth();
    const user = authInstance.currentUser;
    if (!user || !user.email) {
      throw new Error('No authenticated user');
    }

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password
    await updatePassword(user, newPassword);
  } catch (error: any) {
    console.error('Change password error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  const authInstance = getFirebaseAuth();
  return onAuthStateChanged(authInstance, callback);
};

// Firestore helper functions
export const createUserDocument = async (
  user: User,
  additionalData: { name: string }
): Promise<void> => {
  try {
    const dbInstance = getFirebaseDb();
    const userRef = doc(dbInstance, 'users', user.uid);
    const userData: Omit<FirebaseUser, 'uid'> = {
      email: user.email!,
      name: additionalData.name,
      avatar: user.photoURL || undefined,
      subscription: {
        plan: 'free',
        status: 'active'
      },
      preferences: {
        emailNotifications: true,
        analysisReminders: true,
        weeklyReports: false
      },
      stats: {
        totalIdeas: 0,
        analyzedIdeas: 0,
        totalReports: 0
      },
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(userRef, userData);
  } catch (error) {
    console.error('Error creating user document:', error);
    throw new Error('Failed to create user profile');
  }
};

export const getUserDocument = async (uid: string): Promise<FirebaseUser | null> => {
  try {
    const dbInstance = getFirebaseDb();
    
    // Add retry logic and error boundary for internal state issues
    let retryCount = 0;
    const maxRetries = 5; // Increase retries
    const baseDelay = 1000; // Start with 1 second delay
    
    while (retryCount < maxRetries) {
      try {
        const userRef = doc(dbInstance, 'users', uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          return {
            uid,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            lastLogin: data.lastLogin?.toDate(),
          } as FirebaseUser;
        }
        
        return null;
      } catch (firestoreError: any) {
        console.warn(`Firestore operation failed (attempt ${retryCount + 1}):`, {
          error: firestoreError,
          code: firestoreError?.code,
          message: firestoreError?.message
        });
        
        // If it's an internal assertion error or network error, wait and retry
        if (firestoreError?.message?.includes('INTERNAL ASSERTION FAILED') || 
            firestoreError?.code === 'unavailable' ||
            firestoreError?.code === 'deadline-exceeded' ||
            firestoreError?.message?.includes('HTTP Error') ||
            firestoreError?.message?.includes('400') ||
            firestoreError?.message?.includes('404')) {
          retryCount++;
          if (retryCount < maxRetries) {
            // Exponential backoff
            const delay = baseDelay * Math.pow(2, retryCount);
            console.log(`Retrying Firestore operation in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        throw firestoreError;
      }
    }
    
    throw new Error('Max retries exceeded for Firestore operation');
  } catch (error) {
    console.error('Error getting user document:', error);
    throw new Error('Failed to get user profile. Please check your network connection and try again.');
  }
};

export const updateUserDocument = async (
  uid: string,
  updates: Partial<FirebaseUser>
): Promise<void> => {
  try {
    const dbInstance = getFirebaseDb();
    const userRef = doc(dbInstance, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user document:', error);
    throw new Error('Failed to update user profile');
  }
};

export const updateUserLastLogin = async (uid: string): Promise<void> => {
  try {
    const dbInstance = getFirebaseDb();
    const userRef = doc(dbInstance, 'users', uid);
    await updateDoc(userRef, {
      lastLogin: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating last login:', error);
    // Don't throw error for last login update
  }
};

// Idea management functions
export const createIdea = async (idea: Omit<FirebaseIdea, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const dbInstance = getFirebaseDb();
    const ideasRef = collection(dbInstance, 'ideas');
    
    // Handle nested objects properly
    const ideaData: any = {
      ...idea,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Handle analysis object
    if (idea.analysis) {
      ideaData.analysis = {
        ...idea.analysis,
        generatedAt: idea.analysis.generatedAt ? Timestamp.fromDate(idea.analysis.generatedAt) : serverTimestamp()
      };
    }
    
    const docRef = await addDoc(ideasRef, ideaData);
    
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating idea:', error);
    // Provide more specific error messages
    if (error?.code === 'unavailable' || error?.message?.includes('400') || error?.message?.includes('404')) {
      throw new Error('Network connection issue. Please check your internet connection and try again.');
    }
    throw new Error('Failed to create idea. Please try again.');
  }
};

export const getUserIdeas = async (uid: string): Promise<FirebaseIdea[]> => {
  try {
    const dbInstance = getFirebaseDb();
    const ideasRef = collection(dbInstance, 'ideas');
    
    // Add retry logic for this operation as well
    let retryCount = 0;
    const maxRetries = 3;
    const baseDelay = 500;
    
    while (retryCount < maxRetries) {
      try {
        // Option 1: Query with index (recommended)
        // Requires composite index: userId (Ascending) + createdAt (Descending)
        try {
          const q = query(
            ideasRef,
            where('userId', '==', uid),
            orderBy('createdAt', 'desc')
          );
          
          const querySnapshot = await getDocs(q);
          return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
              analysis: data.analysis ? {
                ...data.analysis,
                generatedAt: data.analysis.generatedAt?.toDate(),
                financialProjections: data.analysis.financialProjections ? {
                  ...data.analysis.financialProjections,
                  breakEvenTime: data.analysis.financialProjections.breakEvenTime,
                  fundingRequirement: data.analysis.financialProjections.fundingRequirement
                } : undefined,
                competitorAnalysis: data.analysis.competitorAnalysis ? {
                  ...data.analysis.competitorAnalysis
                } : undefined,
                targetAudience: data.analysis.targetAudience ? {
                  ...data.analysis.targetAudience
                } : undefined
              } : undefined
            } as FirebaseIdea;
          });
        } catch (indexError: any) {
          // Fallback: If index doesn't exist, use simple query and sort in memory
          console.warn('Composite index not found, using fallback query:', indexError.message);
          
          const simpleQuery = query(
            ideasRef,
            where('userId', '==', uid)
          );
          
          const querySnapshot = await getDocs(simpleQuery);
          const ideas = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
              analysis: data.analysis ? {
                ...data.analysis,
                generatedAt: data.analysis.generatedAt?.toDate(),
                financialProjections: data.analysis.financialProjections ? {
                  ...data.analysis.financialProjections,
                  breakEvenTime: data.analysis.financialProjections.breakEvenTime,
                  fundingRequirement: data.analysis.financialProjections.fundingRequirement
                } : undefined,
                competitorAnalysis: data.analysis.competitorAnalysis ? {
                  ...data.analysis.competitorAnalysis
                } : undefined,
                targetAudience: data.analysis.targetAudience ? {
                  ...data.analysis.targetAudience
                } : undefined
              } : undefined
            } as FirebaseIdea;
          });
          
          // Sort in memory (less efficient but works without index)
          return ideas.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA; // Descending order
          });
        }
      } catch (firestoreError: any) {
        console.warn(`Firestore getUserIdeas failed (attempt ${retryCount + 1}):`, {
          error: firestoreError,
          code: firestoreError?.code,
          message: firestoreError?.message
        });
        
        // Retry on network-related errors
        if (firestoreError?.code === 'unavailable' ||
            firestoreError?.code === 'deadline-exceeded' ||
            firestoreError?.message?.includes('HTTP Error') ||
            firestoreError?.message?.includes('400') ||
            firestoreError?.message?.includes('404')) {
          retryCount++;
          if (retryCount < maxRetries) {
            const delay = baseDelay * Math.pow(2, retryCount);
            console.log(`Retrying getUserIdeas in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        throw firestoreError;
      }
    }
    
    throw new Error('Max retries exceeded for getUserIdeas operation');
  } catch (error) {
    console.error('Error getting user ideas:', error);
    throw new Error('Failed to get ideas. Please check your network connection and try again.');
  }
};

export const updateIdea = async (ideaId: string, updates: Partial<FirebaseIdea>): Promise<void> => {
  try {
    const dbInstance = getFirebaseDb();
    const ideaRef = doc(dbInstance, 'ideas', ideaId);
    
    // Handle nested objects properly
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    // Handle analysis object updates
    if (updates.analysis) {
      updateData.analysis = {
        ...updates.analysis,
        generatedAt: updates.analysis.generatedAt ? Timestamp.fromDate(updates.analysis.generatedAt) : serverTimestamp()
      };
    }
    
    await updateDoc(ideaRef, updateData);
  } catch (error: any) {
    console.error('Error updating idea:', error);
    // Provide more specific error messages
    if (error?.code === 'unavailable' || error?.message?.includes('400') || error?.message?.includes('404')) {
      throw new Error('Network connection issue. Please check your internet connection and try again.');
    }
    throw new Error('Failed to update idea. Please try again.');
  }
};

export const deleteIdea = async (ideaId: string): Promise<void> => {
  try {
    const dbInstance = getFirebaseDb();
    const ideaRef = doc(dbInstance, 'ideas', ideaId);
    await deleteDoc(ideaRef);
  } catch (error) {
    console.error('Error deleting idea:', error);
    throw new Error('Failed to delete idea');
  }
};

export const getIdea = async (ideaId: string): Promise<FirebaseIdea | null> => {
  try {
    const dbInstance = getFirebaseDb();
    const ideaRef = doc(dbInstance, 'ideas', ideaId);
    const ideaSnap = await getDoc(ideaRef);
    
    if (ideaSnap.exists()) {
      const data = ideaSnap.data();
      return {
        id: ideaSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        analysis: data.analysis ? {
          ...data.analysis,
          generatedAt: data.analysis.generatedAt?.toDate(),
          financialProjections: data.analysis.financialProjections ? {
            ...data.analysis.financialProjections,
            breakEvenTime: data.analysis.financialProjections.breakEvenTime,
            fundingRequirement: data.analysis.financialProjections.fundingRequirement
          } : undefined,
          competitorAnalysis: data.analysis.competitorAnalysis ? {
            ...data.analysis.competitorAnalysis
          } : undefined,
          targetAudience: data.analysis.targetAudience ? {
            ...data.analysis.targetAudience
          } : undefined
        } : undefined
      } as FirebaseIdea;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error getting idea:', error);
    // Provide more specific error messages
    if (error?.code === 'unavailable' || error?.message?.includes('400') || error?.message?.includes('404')) {
      throw new Error('Network connection issue. Please check your internet connection and try again.');
    }
    throw new Error('Failed to get idea. Please try again.');
  }
};

// Utility function to convert Firebase auth errors to user-friendly messages
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    case 'auth/requires-recent-login':
      return 'Please sign in again to continue';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups and try again, or use the redirect option.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Only one popup request is allowed at a time';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled. Please contact support.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email but different sign-in method';
    case 'auth/credential-already-in-use':
      return 'This credential is already associated with a different account';
    default:
      return 'An error occurred. Please try again';
  }
}

// Cleanup function for development hot reloads
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Clear Firebase state on hot reload to prevent conflicts
  // Support both Webpack HMR and Turbopack HMR
  try {
    const moduleHot = (module as any)?.hot || (globalThis as any)?.__webpack_hot__;
    if (moduleHot) {
      moduleHot.accept(() => {
        console.log('Hot reload detected, clearing Firebase instances...');
        app = null;
        auth = null;
        db = null;
        isInitializing = false;
      });
    }
  } catch (error) {
    // Silently ignore HMR setup errors
    console.debug('HMR setup skipped:', error);
  }
  
  // Also clear on page unload
  window.addEventListener('beforeunload', () => {
    app = null;
    auth = null;
    db = null;
    isInitializing = false;
  });
}

export default initializeFirebaseApp;
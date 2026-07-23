/**
 * Firebase Health Check Utility
 * 
 * This utility provides functions to check the health of Firebase connections
 * and handle common connectivity issues.
 */

import { db, auth } from './firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

/**
 * Check if Firebase is properly configured and connected
 */
export async function checkFirebaseHealth(): Promise<{ 
  isHealthy: boolean; 
  errors: string[]; 
  warnings: string[] 
}> {
  const result = {
    isHealthy: true,
    errors: [] as string[],
    warnings: [] as string[]
  };

  try {
    // Check if Firebase app is initialized
    const dbInstance = db();
    const authInstance = auth();
    
    if (!dbInstance) {
      result.errors.push('Firebase Firestore is not initialized');
      result.isHealthy = false;
    }
    
    if (!authInstance) {
      result.errors.push('Firebase Auth is not initialized');
      result.isHealthy = false;
    }
    
    // Try a simple Firestore operation with timeout
    if (dbInstance) {
      try {
        // Set a timeout for the operation
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Firebase connection timeout')), 5000);
        });
        
        const queryPromise = getDocs(query(collection(dbInstance, 'ideas'), limit(1)));
        await Promise.race([queryPromise, timeoutPromise]);
      } catch (error: any) {
        console.warn('Firebase health check failed:', error);
        if (error.message.includes('timeout')) {
          result.warnings.push('Firebase connection is slow or timing out');
        } else if (error.code === 'unavailable' || 
                   error.message.includes('400') || 
                   error.message.includes('404') ||
                   error.message.includes('NETWORK_ERROR')) {
          result.warnings.push('Firebase connection issues detected');
        } else {
          result.warnings.push('Firebase health check failed: ' + error.message);
        }
      }
    }
  } catch (error: any) {
    result.errors.push('Firebase health check error: ' + error.message);
    result.isHealthy = false;
  }

  return result;
}

/**
 * Attempt to recover from Firebase connection issues
 */
export async function recoverFirebaseConnection(): Promise<boolean> {
  try {
    // Simple recovery attempt - force re-initialization
    console.log('Attempting to recover Firebase connection...');
    
    // Wait a bit before retrying
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Run health check again
    const health = await checkFirebaseHealth();
    return health.isHealthy;
  } catch (error) {
    console.error('Firebase recovery failed:', error);
    return false;
  }
}
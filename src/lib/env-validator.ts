/**
 * Environment Variables Validation Utility
 * 
 * This utility helps validate that all required environment variables
 * are properly set up for the Startup Idea Analyzer application.
 */

interface EnvironmentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    openai: boolean;
    firebase: boolean;
    mongodb: boolean;
    jwt: boolean;
  };
}

/**
 * Validates all required environment variables
 */
export function validateEnvironmentVariables(): EnvironmentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check OpenAI API Key
  const openaiKey = process.env.OPENAI_API_KEY;
  const hasOpenAI = !!openaiKey && openaiKey.startsWith('sk-');
  if (!hasOpenAI) {
    if (!openaiKey) {
      errors.push('OPENAI_API_KEY is missing');
    } else {
      errors.push('OPENAI_API_KEY appears to be invalid (should start with "sk-")');
    }
  }

  // Check Firebase Configuration
  const firebaseVars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const missingFirebaseVars = Object.entries(firebaseVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  const hasFirebase = missingFirebaseVars.length === 0;
  if (!hasFirebase) {
    errors.push(`Missing Firebase variables: ${missingFirebaseVars.join(', ')}`);
  }

  // Check MongoDB (optional for Firebase-first setup)
  const mongoUri = process.env.MONGODB_URI;
  const hasMongoDB = !!mongoUri;
  if (!hasMongoDB) {
    warnings.push('MONGODB_URI is missing (optional if using only Firebase)');
  }

  // Check JWT Secret (legacy, may not be needed)
  const jwtSecret = process.env.JWT_SECRET;
  const hasJWT = !!jwtSecret;
  if (!hasJWT) {
    warnings.push('JWT_SECRET is missing (may not be needed with Firebase Auth)');
  }

  // Additional validation for common issues
  if (firebaseVars.NEXT_PUBLIC_FIREBASE_API_KEY && !firebaseVars.NEXT_PUBLIC_FIREBASE_API_KEY.startsWith('AIza')) {
    warnings.push('Firebase API Key may be invalid (should start with "AIza")');
  }

  if (firebaseVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && !firebaseVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN.includes('.firebaseapp.com')) {
    warnings.push('Firebase Auth Domain may be invalid (should end with ".firebaseapp.com")');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      openai: hasOpenAI,
      firebase: hasFirebase,
      mongodb: hasMongoDB,
      jwt: hasJWT,
    },
  };
}

/**
 * Logs environment validation results to console
 */
export function logEnvironmentValidation(): void {
  const result = validateEnvironmentVariables();

  console.log('🔍 Environment Variables Validation');
  console.log('=====================================');
  
  // Summary
  console.log('📊 Summary:');
  console.log(`  OpenAI: ${result.summary.openai ? '✅' : '❌'}`);
  console.log(`  Firebase: ${result.summary.firebase ? '✅' : '❌'}`);
  console.log(`  MongoDB: ${result.summary.mongodb ? '✅' : '⚠️'}`);
  console.log(`  JWT: ${result.summary.jwt ? '✅' : '⚠️'}`);
  
  // Errors
  if (result.errors.length > 0) {
    console.log('\n❌ Errors (must be fixed):');
    result.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  // Warnings
  if (result.warnings.length > 0) {
    console.log('\n⚠️ Warnings (optional):');
    result.warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  
  // Overall status
  console.log(`\n${result.isValid ? '✅ Environment setup is valid!' : '❌ Environment setup has issues that need attention.'}`);
  
  return;
}

/**
 * Server-side environment check (for API routes)
 */
export function validateServerEnvironment(): boolean {
  try {
    const result = validateEnvironmentVariables();
    if (!result.isValid) {
      console.error('Server environment validation failed:', result.errors);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error validating server environment:', error);
    return false;
  }
}
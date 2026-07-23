import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

export function initializeFirebaseAdmin() {
  // Only initialize on the server side
  if (typeof window !== 'undefined') {
    console.warn('Firebase Admin should only be initialized on the server side');
    return;
  }
  
  if (!firebaseInitialized && !admin.apps.length) {
    try {
      console.log('Initializing Firebase Admin SDK...');
      
      const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
      
      if (!projectId || !clientEmail || !privateKey) {
        throw new Error('Missing Firebase Admin credentials in environment variables');
      }
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
      
      firebaseInitialized = true;
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase Admin SDK:', error);
      throw error;
    }
  }
}

// Get Firestore instance
export function getFirestore() {
  if (typeof window !== 'undefined') {
    throw new Error('Firestore can only be accessed on the server side');
  }
  
  initializeFirebaseAdmin();
  return admin.firestore();
}

// Get Firebase Auth instance
export function getAuth() {
  if (typeof window !== 'undefined') {
    throw new Error('Firebase Auth can only be accessed on the server side');
  }
  
  initializeFirebaseAdmin();
  return admin.auth();
}

// Helper functions for common operations
export async function getIdeaById(ideaId: string): Promise<any | null> {
  const db = getFirestore();
  const ideaDoc = await db.collection('ideas').doc(ideaId).get();
  return ideaDoc.exists ? { id: ideaDoc.id, ...ideaDoc.data() } : null;
}

export async function updateIdea(ideaId: string, data: any): Promise<void> {
  const db = getFirestore();
  
  // Process the data to handle dates properly
  const processedData: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Date) {
      // Convert Date objects to Firestore timestamps
      processedData[key] = admin.firestore.Timestamp.fromDate(value);
    } else if (key === 'generatedAt' && value === undefined) {
      // Handle undefined generatedAt by setting it to server timestamp
      processedData[key] = admin.firestore.FieldValue.serverTimestamp();
    } else {
      processedData[key] = value;
    }
  }
  
  await db.collection('ideas').doc(ideaId).update({
    ...processedData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

export async function createIdea(data: any): Promise<string> {
  const db = getFirestore();
  
  // Process the data to handle dates properly
  const processedData: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Date) {
      // Convert Date objects to Firestore timestamps
      processedData[key] = admin.firestore.Timestamp.fromDate(value);
    } else {
      processedData[key] = value;
    }
  }
  
  const docRef = await db.collection('ideas').add({
    ...processedData,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return docRef.id;
}

export async function getUserIdeas(userId: string): Promise<any[]> {
  const db = getFirestore();
  const snapshot = await db.collection('ideas')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    // Convert Firestore timestamps back to JavaScript Dates
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt instanceof admin.firestore.Timestamp 
        ? data.createdAt.toDate() 
        : data.createdAt,
      updatedAt: data.updatedAt instanceof admin.firestore.Timestamp 
        ? data.updatedAt.toDate() 
        : data.updatedAt,
      ...(data.analysis?.generatedAt && {
        'analysis.generatedAt': data.analysis.generatedAt instanceof admin.firestore.Timestamp 
          ? data.analysis.generatedAt.toDate() 
          : data.analysis.generatedAt
      })
    };
  });
}
import _mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Validate MongoDB URI format
if (MONGODB_URI.includes('_mongodb._tcp')) {
  throw new Error(`Invalid MongoDB URI format detected: ${MONGODB_URI}. The URI contains '_mongodb._tcp' which is incorrect. Please check your .env.local file and correct the MONGODB_URI value.`);
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

// This file is deprecated as we're switching to Firestore
// Keeping it for backward compatibility but it's no longer used

async function connectDB() {
  // No-op function as we're using Firestore now
  console.log('MongoDB connection is deprecated. Using Firestore instead.');
  return Promise.resolve();
}

export default connectDB;
export { connectDB };

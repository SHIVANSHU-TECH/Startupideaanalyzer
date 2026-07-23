import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firestore';
import * as firebaseAdmin from 'firebase-admin';

export async function GET() {
  try {
    console.log('Testing Firestore date handling...');
    
    const db = getFirestore();
    
    // Test creating a document with dates
    console.log('Creating test document with dates...');
    const testDoc = await db.collection('test').add({
      name: 'Date Test Document',
      createdAt: new Date(),
      test: true,
      // Test with undefined date field
      optionalDate: undefined
    });
    
    console.log('Test document created with ID:', testDoc.id);
    
    // Test reading the document
    console.log('Reading test document...');
    const docSnapshot = await db.collection('test').doc(testDoc.id).get();
    
    if (docSnapshot.exists) {
      const data = docSnapshot.data();
      console.log('Test document read successfully:', data);
      
      // Test updating the document with dates
      console.log('Updating test document with dates...');
      await db.collection('test').doc(testDoc.id).update({
        updatedAt: new Date(),
        updated: true,
        // Test with server timestamp
        serverTimestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('Test document updated successfully');
      
      // Test deleting the document
      console.log('Deleting test document...');
      await db.collection('test').doc(testDoc.id).delete();
      
      console.log('Test document deleted successfully');
      
      return NextResponse.json({
        success: true,
        message: 'Firestore date handling test completed successfully'
      });
    } else {
      console.error('Test document not found after creation');
      return NextResponse.json({
        success: false,
        error: 'Test document not found after creation'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('❌ Firestore date test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Firestore date test failed',
      details: error.message || 'Unknown error',
      stack: error.stack
    }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firestore';

export async function GET() {
  try {
    console.log('Testing Firestore operations...');
    
    const db = getFirestore();
    
    // Test creating a document
    console.log('Creating test document...');
    const testDoc = await db.collection('test').add({
      name: 'Test Document',
      createdAt: new Date(),
      test: true
    });
    
    console.log('Test document created with ID:', testDoc.id);
    
    // Test reading the document
    console.log('Reading test document...');
    const docSnapshot = await db.collection('test').doc(testDoc.id).get();
    
    if (docSnapshot.exists) {
      console.log('Test document read successfully:', docSnapshot.data());
      
      // Test updating the document
      console.log('Updating test document...');
      await db.collection('test').doc(testDoc.id).update({
        updatedAt: new Date(),
        updated: true
      });
      
      console.log('Test document updated successfully');
      
      // Test deleting the document
      console.log('Deleting test document...');
      await db.collection('test').doc(testDoc.id).delete();
      
      console.log('Test document deleted successfully');
      
      return NextResponse.json({
        success: true,
        message: 'Firestore operations completed successfully'
      });
    } else {
      console.error('Test document not found after creation');
      return NextResponse.json({
        success: false,
        error: 'Test document not found after creation'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('❌ Firestore test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Firestore test failed',
      details: error.message || 'Unknown error',
      stack: error.stack
    }, { status: 500 });
  }
}
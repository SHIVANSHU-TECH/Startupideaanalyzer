import { NextRequest, NextResponse } from 'next/server';
import { analyzeStartupIdea } from '@/lib/ai-analysis';
import { initializeFirebaseAdmin, getFirestore } from '@/lib/firebase-admin';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('Analyze idea API called with params:', params);
  
  try {
    // Initialize Firebase Admin SDK
    initializeFirebaseAdmin();
    
    // Extract Firebase ID token from Authorization header
    const authHeader = request.headers.get('authorization');
    console.log('Authorization header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('ID token extracted (first 10 chars):', idToken.substring(0, 10) + '...');
    
    // Import admin dynamically to avoid browser issues
    const admin = await import('firebase-admin');
    
    // Verify Firebase ID token
    let decodedToken;
    try {
      console.log('Verifying Firebase ID token...');
      decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log('Firebase ID token verified successfully');
    } catch (error: any) {
      console.error('Token verification failed:', error);
      
      // Provide more specific error messages
      if (error?.code === 'auth/argument-error') {
        return NextResponse.json(
          { error: 'Invalid token format' },
          { status: 401 }
        );
      }
      
      if (error?.code === 'auth/id-token-expired') {
        return NextResponse.json(
          { error: 'Token has expired. Please log in again.' },
          { status: 401 }
        );
      }
      
      if (error?.code === 'auth/id-token-revoked') {
        return NextResponse.json(
          { error: 'Token has been revoked. Please log in again.' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: 'Invalid or expired token. Please log in again.' },
        { status: 401 }
      );
    }
    
    const userId = decodedToken.uid;
    console.log('User ID extracted:', userId);

    const { id: ideaId } = params;
    console.log('Idea ID extracted:', ideaId);

    // Get Firestore instance
    const db = getFirestore();
    
    // Find idea by ID and ensure it belongs to the authenticated user
    let ideaDoc;
    try {
      console.log('Finding idea in Firestore...');
      ideaDoc = await db.collection('ideas').doc(ideaId).get();
      
      if (!ideaDoc.exists) {
        console.log('Idea not found');
        return NextResponse.json(
          { error: 'Idea not found' },
          { status: 404 }
        );
      }
      
      const idea = ideaDoc.data();
      console.log('Idea found:', !!idea);
      
      // Check if user owns this idea
      if (idea?.userId !== userId) {
        console.log('User does not own this idea');
        return NextResponse.json(
          { error: 'Unauthorized access to idea' },
          { status: 403 }
        );
      }
      
      // Update idea status to analyzing
      console.log('Updating idea status to analyzing...');
      await db.collection('ideas').doc(ideaId).update({
        status: 'analyzing',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('Idea status updated successfully');
    } catch (findError) {
      console.error('Failed to find/update idea:', findError);
      return NextResponse.json(
        { error: 'Failed to find or update idea' },
        { status: 500 }
      );
    }

    try {
      console.log('Starting AI analysis...');
      
      // Get the idea data again after updating status
      const updatedIdeaDoc = await db.collection('ideas').doc(ideaId).get();
      const idea = updatedIdeaDoc.data();
      
      console.log('Idea data for analysis:', {
        title: idea?.title,
        category: idea?.category,
        descriptionLength: idea?.description?.length
      });
      
      // Perform AI analysis
      const analysis = await analyzeStartupIdea(
        idea?.title || '',
        idea?.description || '',
        idea?.category || ''
      );
      
      console.log('AI analysis completed successfully:', {
        hasSuccessScore: !!analysis.successScore,
        hasMarketAnalysis: !!analysis.marketAnalysis,
        swotItems: analysis.swot ? {
          strengths: analysis.swot.strengths.length,
          weaknesses: analysis.swot.weaknesses.length,
          opportunities: analysis.swot.opportunities.length,
          threats: analysis.swot.threats.length
        } : null,
        recommendations: analysis.recommendations?.length
      });

      // Update idea with analysis results
      try {
        console.log('Saving analysis results to Firestore...');
        
        const analysisData = {
          successScore: analysis.successScore,
          marketAnalysis: analysis.marketAnalysis,
          swot: analysis.swot,
          recommendations: analysis.recommendations,
          financialProjections: analysis.financialProjections,
          competitorAnalysis: analysis.competitorAnalysis,
          targetAudience: analysis.targetAudience,
          generatedAt: require('firebase-admin').firestore.FieldValue.serverTimestamp(),
        };
        
        await db.collection('ideas').doc(ideaId).update({
          status: 'analyzed',
          analysis: analysisData,
          updatedAt: require('firebase-admin').firestore.FieldValue.serverTimestamp()
        });
        
        console.log('Analysis results saved successfully');
        
        // Return the updated idea
        const finalIdeaDoc = await db.collection('ideas').doc(ideaId).get();
        const finalIdea = finalIdeaDoc.data();
        
        console.log('Analysis completed successfully, returning response');
        return NextResponse.json(
          {
            message: 'Analysis completed successfully',
            idea: {
              id: ideaId,
              ...finalIdea
            },
          },
          { status: 200 }
        );
      } catch (updateError) {
        console.error('Failed to save analysis results:', updateError);
        
        // Update status to failed
        await db.collection('ideas').doc(ideaId).update({
          status: 'failed',
          updatedAt: require('firebase-admin').firestore.FieldValue.serverTimestamp()
        });
        
        return NextResponse.json(
          { error: 'Failed to save analysis results' },
          { status: 500 }
        );
      }
    } catch (analysisError: any) {
      console.error('Analysis failed:', analysisError);
      
      // Update status to failed
      try {
        await db.collection('ideas').doc(ideaId).update({
          status: 'failed',
          updatedAt: require('firebase-admin').firestore.FieldValue.serverTimestamp()
        });
        console.log('Idea status updated to failed');
      } catch (updateError) {
        console.error('Failed to update idea status to failed:', updateError);
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to analyze idea',
          details: analysisError.message || 'Unknown error during analysis',
          // Add more debugging information
          isFallback: analysisError.message?.includes('fallback'),
          isQuotaExceeded: analysisError.message?.includes('quota exceeded') || analysisError.message?.includes('insufficient_quota')
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Analyze idea error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message || 'Unknown server error'
      },
      { status: 500 }
    );
  }
}
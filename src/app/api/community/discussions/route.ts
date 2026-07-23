import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const db = getFirestore();

        // Fetch ideas that are marked as public
        const snapshot = await db.collection('ideas')
            .where('isPublic', '==', true)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        const ideas = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                _id: doc.id, // Keep _id for frontend compatibility
                ...data,
                createdAt: data.createdAt instanceof admin.firestore.Timestamp
                    ? data.createdAt.toDate()
                    : data.createdAt,
                updatedAt: data.updatedAt instanceof admin.firestore.Timestamp
                    ? data.updatedAt.toDate()
                    : data.updatedAt,
                userId: typeof data.userId === 'string' ? { name: 'Anonymous' } : data.userId // Handle missing user population
            };
        });

        return NextResponse.json({ success: true, data: ideas });
    } catch (error: any) {
        console.error('Error fetching discussions:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const db = getFirestore();
        const body = await req.json();

        // Basic validation
        if (!body.title || !body.description) {
            return NextResponse.json({ success: false, error: 'Title and Description are required' }, { status: 400 });
        }

        const discussionData = {
            ...body,
            isPublic: true, // Discussions are public ideas
            likes: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        // If no userId is provided, usage anonymous
        if (!discussionData.userId) {
            discussionData.userId = { name: "Anonymous" };
        }

        const docRef = await db.collection('ideas').add(discussionData);

        return NextResponse.json({ success: true, data: { _id: docRef.id, ...discussionData } }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating discussion:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

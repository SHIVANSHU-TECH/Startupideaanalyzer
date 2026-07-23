import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const db = getFirestore();
        const { id } = await params;
        const docRef = db.collection('ideas').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ success: false, error: 'Discussion not found' }, { status: 404 });
        }

        const data = doc.data();

        // Fetch replies
        const repliesSnapshot = await docRef.collection('replies').orderBy('createdAt', 'asc').get();
        const replies = repliesSnapshot.docs.map(replyDoc => {
            const replyData = replyDoc.data();
            return {
                id: replyDoc.id,
                ...replyData,
                createdAt: replyData.createdAt instanceof admin.firestore.Timestamp
                    ? replyData.createdAt.toDate()
                    : replyData.createdAt
            };
        });

        const discussion = {
            _id: doc.id,
            ...data,
            replies: replies,
            createdAt: data?.createdAt instanceof admin.firestore.Timestamp
                ? data.createdAt.toDate()
                : data?.createdAt,
            updatedAt: data?.updatedAt instanceof admin.firestore.Timestamp
                ? data.updatedAt.toDate()
                : data?.updatedAt,
            userId: typeof data?.userId === 'string' ? { name: 'Anonymous' } : data?.userId
        };

        return NextResponse.json({ success: true, data: discussion });
    } catch (error: any) {
        console.error('Error fetching discussion details:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const db = getFirestore();
        const body = await req.json();
        const { id } = await params;

        if (!body.content || !body.user) {
            return NextResponse.json({ success: false, error: 'Content and User are required' }, { status: 400 });
        }

        const replyData = {
            content: body.content,
            user: body.user,
            likes: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = db.collection('ideas').doc(id);
        const replyRef = await docRef.collection('replies').add(replyData);

        return NextResponse.json({ success: true, data: { id: replyRef.id, ...replyData } }, { status: 201 });
    } catch (error: any) {
        console.error('Error adding reply:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

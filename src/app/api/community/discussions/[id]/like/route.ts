import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const db = getFirestore();
        const { id } = await params;
        const docRef = db.collection('ideas').doc(id);

        // Increment the likes field
        await docRef.update({
            likes: admin.firestore.FieldValue.increment(1)
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error liking discussion:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

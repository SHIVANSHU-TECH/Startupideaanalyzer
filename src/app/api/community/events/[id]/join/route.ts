import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const db = getFirestore();
        const eventRef = db.collection('events').doc(params.id);

        // In a real app, we would check if user is already attending in a subcollection
        // For now, simpler increment

        await eventRef.update({
            attendees: admin.firestore.FieldValue.increment(1)
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error joining event:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

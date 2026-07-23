import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const db = getFirestore();
        const snapshot = await db.collection('events')
            .orderBy('date', 'asc')
            .limit(50)
            .get();

        const events = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date instanceof admin.firestore.Timestamp
                    ? data.date.toDate().toLocaleDateString()
                    : data.date,
                // Ensure other fields are serializable
            };
        });

        return NextResponse.json({ success: true, data: events });
    } catch (error: any) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const db = getFirestore();
        const body = await req.json();

        // Basic validation
        if (!body.title || !body.date) {
            return NextResponse.json({ success: false, error: 'Title and Date are required' }, { status: 400 });
        }

        const eventData = {
            ...body,
            date: admin.firestore.Timestamp.fromDate(new Date(body.date)),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            attendees: 0
        };

        const docRef = await db.collection('events').add(eventData);

        return NextResponse.json({ success: true, data: { id: docRef.id, ...body } }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating event:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

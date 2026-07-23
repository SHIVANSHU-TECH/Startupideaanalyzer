import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const db = getFirestore();
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const type = searchParams.get('type');

        let query: admin.firestore.Query = db.collection('resources');

        if (category && category !== 'all') {
            query = query.where('category', '==', category);
        }
        if (type) {
            query = query.where('type', '==', type);
        }

        const snapshot = await query.orderBy('createdAt', 'desc').get();

        const resources = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                _id: doc.id,
                ...data,
                createdAt: data.createdAt instanceof admin.firestore.Timestamp
                    ? data.createdAt.toDate()
                    : data.createdAt,
                updatedAt: data.updatedAt instanceof admin.firestore.Timestamp
                    ? data.updatedAt.toDate()
                    : data.updatedAt,
            };
        });

        return NextResponse.json({ success: true, data: resources });
    } catch (error: any) {
        console.error('Error fetching resources:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const db = getFirestore();
        const body = await req.json();

        const resourceData = {
            ...body,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            downloadCount: 0,
            rating: 0
        };

        const docRef = await db.collection('resources').add(resourceData);

        return NextResponse.json({ success: true, data: { id: docRef.id, ...resourceData } }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating resource:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

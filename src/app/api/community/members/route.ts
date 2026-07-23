import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const db = getFirestore();
        // Fetch users (members)
        const snapshot = await db.collection('users')
            .limit(100)
            .get();

        const uniqueMembers = new Map();

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const email = data.email?.toLowerCase();

            // If email is missing, use ID as key. If email exists and we haven't seen it, or if it's the first time
            const key = email || doc.id;

            if (!uniqueMembers.has(key)) {
                uniqueMembers.set(key, {
                    id: doc.id,
                    name: data.name || data.displayName || data.email?.split('@')[0] || 'Anonymous',
                    role: data.role || 'Member',
                    avatar: (data.name?.[0] || data.email?.[0] || 'A').toUpperCase(),
                    expertise: data.expertise || [],
                    connections: data.connections || 0,
                    email: data.email
                });
            }
        });

        const membersList = Array.from(uniqueMembers.values());

        return NextResponse.json({ success: true, data: membersList });
    } catch (error: any) {
        console.error('Error fetching members:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

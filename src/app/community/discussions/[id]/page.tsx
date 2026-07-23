'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function DiscussionDetail() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const params = useParams();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [discussion, setDiscussion] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const fetchDiscussion = async () => {
        try {
            const res = await fetch(`/api/community/discussions/${params.id}`);
            const data = await res.json();
            if (data.success) {
                setDiscussion(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch discussion:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchDiscussion();
        }
    }, [params.id]);

    const handlePostReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || !user) return;

        setIsReplying(true);
        try {
            const res = await fetch(`/api/community/discussions/${params.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: replyContent,
                    user: {
                        name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
                        id: user.uid
                    }
                })
            });

            if (res.ok) {
                setReplyContent('');
                fetchDiscussion(); // Refresh replies
            }
        } catch (error) {
            console.error('Error posting reply:', error);
        } finally {
            setIsReplying(false);
        }
    };

    const handleLike = async () => {
        try {
            const res = await fetch(`/api/community/discussions/${params.id}/like`, {
                method: 'POST'
            });
            if (res.ok) {
                setDiscussion({ ...discussion, likes: (discussion.likes || 0) + 1 });
            }
        } catch (error) {
            console.error("Error liking discussion:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!discussion) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-900">Discussion not found</h2>
                <Link href="/community" className="mt-4 text-indigo-600 hover:underline">Return to Community</Link>
            </div>
        );
    }

    return (
        <div className="relative flex size-full min-h-screen flex-col bg-gray-50" style={{ fontFamily: '"Spline Sans", "Noto Sans", sans-serif' }}>
            {/* Header */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 bg-white px-10 py-4">
                <div className="flex items-center gap-4 text-gray-900">
                    <div className="size-8 text-indigo-600">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44Z" fill="currentColor"></path>
                        </svg>
                    </div>
                    <Link href="/" className="text-xl font-bold leading-tight tracking-[-0.015em] text-gray-900">Startup Idea Analyzer</Link>
                </div>
                <div className="flex items-center gap-4">
                    <nav className="hidden md:flex items-center gap-6">
                        <Link className="text-base font-medium text-gray-600 hover:text-gray-900" href="/">Home</Link>
                        <Link className="text-base font-medium text-gray-900" href="/community">Community</Link>
                        <Link className="text-base font-medium text-gray-600 hover:text-gray-900" href="/resources">Resources</Link>
                    </nav>
                    {user ? (
                        <div className="relative">
                            <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 rounded-full bg-gray-100 p-1 hover:bg-gray-200">
                                <div className="aspect-square size-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                                    {(user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                                </div>
                            </button>
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">Sign In</Link>
                    )}
                </div>
            </header>

            <main className="container mx-auto max-w-4xl px-4 py-8">
                <Link href="/community" className="mb-6 flex items-center text-sm font-medium text-indigo-600 hover:underline">
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Discussions
                </Link>

                {/* Original Post */}
                <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                    <div className="mb-6 flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-full bg-indigo-500 text-lg font-bold text-white uppercase">
                            {discussion.userId?.name?.[0] || 'A'}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{discussion.title}</h1>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span>By {discussion.userId?.name || 'Anonymous'}</span>
                                <span>•</span>
                                <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600">{discussion.category}</span>
                            </div>
                        </div>
                    </div>
                    <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                        {discussion.description}
                    </div>
                    <div className="mt-8 border-t pt-6 flex gap-4">
                        <button
                            onClick={handleLike}
                            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 10h4.708a2 2 0 011.981 2.284l-1.347 8.357a2 2 0 01-1.981 1.359H4V10c0-1.105.447-2.105 1.172-2.828l6.101-6.101a.3.3 0 01.515.212V8a2 2 0 002 2h0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            {discussion.likes || 0} Likes
                        </button>
                    </div>
                </div>

                {/* Replies Section */}
                <div className="mt-12">
                    <h2 className="mb-6 text-xl font-bold text-gray-900">Replies ({discussion.replies?.length || 0})</h2>

                    <div className="space-y-6">
                        {discussion.replies?.map((reply: any) => (
                            <div key={reply.id} className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex size-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600 uppercase">
                                        {reply.user?.name?.[0] || 'A'}
                                    </div>
                                    <div>
                                        <span className="text-sm font-bold text-gray-900">{reply.user?.name}</span>
                                        <span className="ml-3 text-xs text-gray-500">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                            </div>
                        ))}
                    </div>

                    {/* Reply Form */}
                    {user ? (
                        <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50 p-6">
                            <h3 className="mb-4 font-bold text-gray-900">Join the discussion</h3>
                            <form onSubmit={handlePostReply}>
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    className="w-full rounded-lg border border-gray-200 p-4 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    rows={4}
                                    required
                                ></textarea>
                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isReplying}
                                        className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {isReplying ? 'Posting...' : 'Post Reply'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="mt-8 rounded-xl border border-gray-200 bg-gray-100 p-8 text-center">
                            <p className="text-gray-600">Please <Link href="/login" className="font-bold text-indigo-600">sign in</Link> to participate in the discussion.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

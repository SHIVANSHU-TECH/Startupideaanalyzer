'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Community() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('discussions');

  // Modal State
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', category: 'General', description: '' });
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', category: 'Mixer' });

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const [discussions, setDiscussions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Discussions
  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/community/discussions');
      const data = await res.json();
      if (data.success) {
        setDiscussions(data.data.map((item: any) => ({
          ...item,
          id: item._id, // Ensure id is mapped for UI
          author: item.userId?.name || 'Anonymous',
          avatar: (item.userId?.name?.[0] || 'A').toUpperCase(),
          replies: item.repliesCount || 0,
          timeAgo: new Date(item.createdAt).toLocaleDateString(),
          excerpt: item.description.substring(0, 120) + '...'
        })));
      }
    } catch (error) {
      console.error('Failed to fetch discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'discussions') fetchDiscussions();
  }, [activeTab]);

  // Fetch Events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/community/events');
        const data = await res.json();
        if (data.success) {
          setEvents(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'events') fetchEvents();
  }, [activeTab]);

  // Fetch Members
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/community/members');
        const data = await res.json();
        if (data.success) {
          setMembers(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch members:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'members') fetchMembers();
  }, [activeTab]);

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const res = await fetch('/api/community/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newDiscussion,
          userId: { name: user.displayName || user.email?.split('@')[0] || 'Anonymous', id: user.uid }
        })
      });

      if (res.ok) {
        setShowStartModal(false);
        setNewDiscussion({ title: '', category: 'General', description: '' });
        fetchDiscussions();
      }
    } catch (error) {
      console.error('Error creating discussion:', error);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const res = await fetch('/api/community/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });

      if (res.ok) {
        setShowEventModal(false);
        setNewEvent({ title: '', date: '', time: '', category: 'Mixer' });
        // Refresh events
        const resEvents = await fetch('/api/community/events');
        const data = await resEvents.json();
        if (data.success) setEvents(data.data);
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      const res = await fetch(`/api/community/events/${eventId}/join`, {
        method: 'POST'
      });
      if (res.ok) {
        // Optimistically update
        setEvents(events.map(e => e.id === eventId ? { ...e, attendees: (e.attendees || 0) + 1 } : e));
        alert("You've joined the event!");
      }
    } catch (error) {
      console.error("Error joining event:", error);
    }
  };

  const handleConnect = (member: any) => {
    alert(`Connection request sent to ${member.name}!`);
  };

  const handleLike = async (e: React.MouseEvent, discussionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/community/discussions/${discussionId}/like`, {
        method: 'POST'
      });
      if (res.ok) {
        setDiscussions(discussions.map(d => d.id === discussionId ? { ...d, likes: (d.likes || 0) + 1 } : d));
      }
    } catch (error) {
      console.error("Error liking discussion:", error);
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col" style={{ fontFamily: '"Spline Sans", "Noto Sans", sans-serif' }}>
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-white px-10 py-4 shadow-sm">
        <div className="flex items-center gap-4 text-gray-900">
          <div className="size-8 text-indigo-600">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44Z" fill="currentColor"></path>
            </svg>
          </div>
          <Link href="/" className="text-xl font-bold leading-tight text-gray-900">Startup Idea Analyzer</Link>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6">
            <Link className="text-base font-medium text-gray-600 hover:text-gray-900" href="/">Home</Link>
            <Link className="text-base font-medium text-indigo-600" href="/community">Community</Link>
            <Link className="text-base font-medium text-gray-600 hover:text-gray-900" href="/resources">Resources</Link>
          </nav>
          {user ? (
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 rounded-full bg-gray-100 p-1 hover:bg-gray-200">
                <div className="aspect-square size-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium uppercase">
                  {(user.displayName?.[0] || 'U')}
                </div>
              </button>
            </div>
          ) : (
            <Link href="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">Sign Up</Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h1 className="text-4xl font-bold md:text-6xl mb-6">Join Our Startup Community</h1>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">Connect with founders, share strategies, and grow your network in an environment built for ambitious creators.</p>
          <div className="flex justify-center gap-6">
            <div className="flex flex-col">
              <span className="text-3xl font-bold">12k+</span>
              <span className="text-sm opacity-70">Members</span>
            </div>
            <div className="h-12 w-[1px] bg-white/30 self-center"></div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold">2.3k+</span>
              <span className="text-sm opacity-70">Discussions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto max-w-6xl">
          <nav className="flex gap-8">
            {['discussions', 'events', 'members'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 font-medium capitalize border-b-2 transition-all ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto max-w-6xl px-4 grid lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2">
            {activeTab === 'discussions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Recent Engagement</h2>
                    <p className="text-sm text-gray-500">See what the community is talking about</p>
                  </div>
                  <button
                    onClick={() => user ? setShowStartModal(true) : router.push('/login')}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow-md"
                  >
                    Start Discussion
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center p-12">
                    <div className="animate-spin h-8 w-8 border-t-2 border-indigo-600 rounded-full"></div>
                  </div>
                ) : discussions.map(item => (
                  <div key={item.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                    <div className="flex gap-4">
                      <div className="size-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold uppercase">{item.avatar}</div>
                      <div className="flex-1">
                        <Link href={`/community/discussions/${item.id}`} className="text-lg font-bold text-gray-900 hover:text-indigo-600 underline-offset-4 decoration-2">{item.title}</Link>
                        <p className="mt-2 text-gray-600 text-sm leading-relaxed">{item.excerpt}</p>
                        <div className="mt-4 flex items-center gap-6 text-xs text-gray-400 font-medium">
                          <span>By {item.author}</span>
                          <span>{item.timeAgo}</span>
                          <button
                            onClick={(e) => handleLike(e, item.id)}
                            className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 10h4.708a2 2 0 011.981 2.284l-1.347 8.357a2 2 0 01-1.981 1.359H4V10c0-1.105.447-2.105 1.172-2.828l6.101-6.101a.3.3 0 01.515.212V8a2 2 0 002 2h0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                            {item.likes || 0} Likes
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Upcoming Mixer & Workshops</h2>
                    <p className="text-sm text-gray-500">Global events for startup founders</p>
                  </div>
                  <button
                    onClick={() => user ? setShowEventModal(true) : router.push('/login')}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow-md"
                  >
                    Create Event
                  </button>
                </div>
                {events.map(event => (
                  <div key={event.id} className="bg-white p-6 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-md uppercase">{event.category}</span>
                        <span className="text-xs text-gray-400">{event.date} • {event.time}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{event.attendees || 0} participants attending</p>
                    </div>
                    <button
                      onClick={() => handleJoinEvent(event.id)}
                      className="bg-gray-100 text-gray-900 px-5 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition"
                    >
                      Join Event
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'members' && (
              <div className="grid md:grid-cols-2 gap-6">
                {members.map(member => (
                  <div key={member.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
                    <div className="size-16 mx-auto rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold mb-4">{member.avatar}</div>
                    <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{member.role}</p>
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      {member.expertise?.map((tag: string) => (
                        <span key={tag} className="text-[10px] font-bold px-2 py-1 bg-gray-50 text-gray-500 rounded border uppercase">{tag}</span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleConnect(member)}
                      className="w-full border-2 border-indigo-600 text-indigo-600 py-2 rounded-lg text-sm font-bold hover:bg-indigo-600 hover:text-white transition"
                    >
                      Connect Reach out
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Community Pulse</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Active Founders</span>
                  <span className="font-bold">3,241</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Monthly Success Stories</span>
                  <span className="font-bold">18</span>
                </div>
              </div>
            </div>

            <div className="bg-indigo-600 p-8 rounded-xl text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Need Beta Testers?</h3>
                <p className="text-sm opacity-80 mb-6 font-medium">Put your MVP in front of a community that understands the struggle.</p>
                <button className="bg-white text-indigo-600 px-6 py-2 rounded-lg text-sm font-bold shadow-lg">Submit for Review</button>
              </div>
              <div className="absolute -bottom-10 -right-10 size-40 bg-white/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Start Discussion Modal */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Start New Discussion</h2>
            <form onSubmit={handleCreateDiscussion} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Discussion Theme / Title</label>
                <input
                  type="text"
                  value={newDiscussion.title}
                  onChange={e => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                  className="w-full rounded-lg border-gray-200 border p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. Scaling B2B SaaS in 2024"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Topic Category</label>
                <select
                  value={newDiscussion.category}
                  onChange={e => setNewDiscussion({ ...newDiscussion, category: e.target.value })}
                  className="w-full rounded-lg border-gray-200 border p-3"
                >
                  <option>General</option>
                  <option>Scaling</option>
                  <option>Funding</option>
                  <option>Technical</option>
                  <option>Marketing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description / Message</label>
                <textarea
                  rows={4}
                  value={newDiscussion.description}
                  onChange={e => setNewDiscussion({ ...newDiscussion, description: e.target.value })}
                  className="w-full rounded-lg border-gray-200 border p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Tell the community what's on your mind..."
                  required
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setShowStartModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">Launch Discussion</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Create Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Community Event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full rounded-lg border-gray-200 border p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. Founder Meetup NYC"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full rounded-lg border-gray-200 border p-3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full rounded-lg border-gray-200 border p-3"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Event Type</label>
                <select
                  value={newEvent.category}
                  onChange={e => setNewEvent({ ...newEvent, category: e.target.value })}
                  className="w-full rounded-lg border-gray-200 border p-3"
                >
                  <option>Mixer</option>
                  <option>Workshop</option>
                  <option>Webinar</option>
                  <option>Networking</option>
                </select>
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setShowEventModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">Publish Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
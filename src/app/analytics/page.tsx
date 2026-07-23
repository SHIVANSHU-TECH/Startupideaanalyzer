'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FirebaseIdea } from '@/lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';

function AnalyticsContent() {
  const { user, logout, getUserIdeasList } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Fetch analytics data from backend
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch ideas for analytics calculation
      const ideas = await getUserIdeasList(); // Get all user ideas from Firebase
      
      // Calculate analytics from ideas data
      const totalIdeas = ideas.length;
      const analyzedIdeas = ideas.filter(idea => idea.status === 'analyzed').length;
      const pendingIdeas = ideas.filter(idea => idea.status === 'pending').length;
      const analyzingIdeas = ideas.filter(idea => idea.status === 'analyzing').length;
      const failedIdeas = ideas.filter(idea => idea.status === 'failed').length;
      
      // Calculate average score
      const ideasWithScores = ideas.filter(idea => idea.analysis?.successScore);
      const averageScore = ideasWithScores.length > 0 
        ? Math.round(ideasWithScores.reduce((sum, idea) => sum + (idea.analysis?.successScore || 0), 0) / ideasWithScores.length)
        : 0;
      
      // Calculate category distribution
      const categoryCount: { [key: string]: number } = {};
      ideas.forEach(idea => {
        categoryCount[idea.category] = (categoryCount[idea.category] || 0) + 1;
      });
      
      const categoryData = Object.entries(categoryCount)
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / totalIdeas) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6); // Top 6 categories
      
      // Calculate score distribution
      const scoreRanges = {
        '90-100': 0,
        '80-89': 0,
        '70-79': 0,
        '60-69': 0,
        '50-59': 0,
        'Below 50': 0
      };
      
      ideasWithScores.forEach(idea => {
        const score = idea.analysis?.successScore || 0;
        if (score >= 90) scoreRanges['90-100']++;
        else if (score >= 80) scoreRanges['80-89']++;
        else if (score >= 70) scoreRanges['70-79']++;
        else if (score >= 60) scoreRanges['60-69']++;
        else if (score >= 50) scoreRanges['50-59']++;
        else scoreRanges['Below 50']++;
      });
      
      const scoreDistribution = Object.entries(scoreRanges)
        .filter(([_, count]) => count > 0)
        .map(([range, count], index) => ({
          range,
          count,
          color: [
            'bg-green-500',
            'bg-blue-500', 
            'bg-yellow-500',
            'bg-orange-500',
            'bg-red-400',
            'bg-red-600'
          ][index] || 'bg-gray-500'
        }));
      
      // Get recent activity (last 10 ideas)
      const recentActivity = ideas
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map(idea => ({
          id: idea.id,
          action: idea.status === 'analyzed' ? 'Analyzed' : 'Submitted',
          idea: idea.title,
          score: idea.analysis?.successScore,
          date: new Date(idea.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        }));
      
      // Calculate improvement rate (mock calculation)
      const improvementRate = analyzedIdeas > 0 ? Math.round((analyzedIdeas / totalIdeas) * 100) : 0;
      
      setAnalytics({
        stats: {
          totalIdeas,
          analyzedIdeas,
          pendingIdeas,
          analyzingIdeas,
          failedIdeas,
          averageScore,
          improvementRate
        },
        categoryData,
        scoreDistribution,
        recentActivity
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError('Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics on component mount and when time range changes
  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Unable to load analytics</h3>
          <p className="mt-2 text-gray-500">{error || 'Please try again later.'}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col" style={{ fontFamily: '"Spline Sans", "Noto Sans", sans-serif' }}>
      <div className="flex h-full grow">
        {/* Sidebar */}
        <div className="hidden md:flex w-80 bg-gray-800 text-white p-6 flex-col justify-between">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500 p-2 rounded-lg">
                <svg className="text-white" fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                  <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm42.42-126.13a8,8,0,0,0-11.32,0L112,136.69,94.91,119.6a8,8,0,0,0-11.32,11.32l22.63,22.63a8,8,0,0,0,11.32,0L170.42,97.19A8,8,0,0,0,170.42,89.87Z"></path>
                </svg>
              </div>
              <div className="flex flex-col">
                <h1 className="text-white text-lg font-bold">Idea Analyzer</h1>
                <p className="text-gray-400 text-sm">AI-powered insights</p>
              </div>
            </div>
            <nav className="flex flex-col gap-2">
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors" href="/dashboard">
                <span className="font-medium">Dashboard</span>
              </a>
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors" href="/ideas">
                <span className="font-medium">Submitted Ideas</span>
              </a>
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors" href="/reports">
                <span className="font-medium">Saved Reports</span>
              </a>
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-600 text-white" href="/analytics">
                <span className="font-medium">Analytics</span>
              </a>
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors" href="/settings">
              <span className="font-medium">Settings</span>
            </a>
          </div>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <header className="mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Analytics</h1>
                  <p className="text-gray-600 mt-2">Track your idea submission performance and insights.</p>
                </div>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
            </header>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Ideas</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.stats.totalIdeas}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Analyzed</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.stats.analyzedIdeas}</p>
                    <p className="text-xs text-gray-500">{analytics.stats.pendingIdeas} pending</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Score</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.stats.averageScore}</p>
                    <p className="text-xs text-gray-500">out of 100</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.stats.improvementRate}%</p>
                    <p className="text-xs text-gray-500">completion rate</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Category Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ideas by Category</h3>
                {analytics.categoryData.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.categoryData.map((category: any, index: number) => (
                      <div key={index} className="flex items-center">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-900">{category.name}</span>
                            <span className="text-sm text-gray-500">{category.count}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full" 
                              style={{ width: `${category.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">No data available</p>
                  </div>
                )}
              </div>

              {/* Score Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Distribution</h3>
                {analytics.scoreDistribution.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.scoreDistribution.map((range: any, index: number) => (
                      <div key={index} className="flex items-center">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className={`w-4 h-4 rounded ${range.color}`}></div>
                          <span className="text-sm font-medium text-gray-900">{range.range}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2 ml-4">
                            <div 
                              className={`h-2 rounded-full ${range.color}`}
                              style={{ width: `${Math.max((range.count / analytics.stats.analyzedIdeas) * 100, 5)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500 w-8 text-right">{range.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">No analyzed ideas yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              {analytics.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {analytics.recentActivity.map((activity: any) => (
                    <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {activity.action === 'Analyzed' ? (
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {activity.action} "{activity.idea}"
                          </p>
                          <p className="text-sm text-gray-500">{activity.date}</p>
                        </div>
                      </div>
                      {activity.score && (
                        <span className="text-sm font-medium text-indigo-600">
                          Score: {activity.score}/100
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">No recent activity</p>
                  <button
                    onClick={() => router.push('/')}
                    className="mt-2 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                  >
                    Submit your first idea
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Analytics() {
  return (
    <ProtectedRoute>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}
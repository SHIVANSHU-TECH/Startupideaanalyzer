'use client'

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FirebaseIdea } from '@/lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';

function DashboardContent() {
  const { user, userProfile, logout, getUserIdeasList } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [ideas, setIdeas] = useState<FirebaseIdea[]>([]);
  const [analytics, setAnalytics] = useState({ totalIdeas: 0, averageScore: 0, successRate: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Fetch dashboard data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch user ideas from Firebase
        const userIdeas = await getUserIdeasList();
        setIdeas(userIdeas);
        
        // Calculate analytics from ideas
        if (userIdeas.length > 0) {
          const analyzedIdeas = userIdeas.filter(idea => idea.status === 'analyzed' && idea.analysis);
          const totalScore = analyzedIdeas.reduce((sum, idea) => {
            return sum + (idea.analysis?.successScore || 0);
          }, 0);
          const averageScore = analyzedIdeas.length > 0 ? Math.round(totalScore / analyzedIdeas.length) : 0;
          const successRate = analyzedIdeas.length > 0 ? Math.round((analyzedIdeas.length / userIdeas.length) * 100) : 0;
          
          setAnalytics({
            totalIdeas: userIdeas.length,
            averageScore,
            successRate
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user, getUserIdeasList]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzed':
        return 'bg-green-100 text-green-800';
      case 'analyzing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewAnalysis = (ideaId: string) => {
    router.push(`/analysis/${ideaId}`);
  };

  const handleDownloadReport = async (ideaId: string) => {
    try {
      // Report generation would be implemented here
      console.log('Downloading report for idea:', ideaId);
      alert('Report generation feature coming soon!');
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden" style={{ fontFamily: '"Spline Sans", "Noto Sans", sans-serif' }}>
      <div className="flex h-full grow">
        {/* Sidebar */}
        <div className="hidden md:flex w-80 flex-shrink-0 bg-gray-800 text-white p-6 flex-col justify-between" style={{ '--secondary-color': '#1f2937', '--primary-color': '#4338ca' } as React.CSSProperties}>
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
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-600 text-white" href="#">
                <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                  <path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"></path>
                </svg>
                <span className="font-medium">Dashboard</span>
              </a>
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors" href="/ideas">
                <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                  <path d="M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16,16,0,0,0-6.23-12.66A87.59,87.59,0,0,1,40,104.49C39.74,56.83,78.26,17.14,125.88,16A88,88,0,0,1,216,104Zm-16,0a72,72,0,0,0-73.74-72c-39,.92-70.47,33.39-70.26,72.39a71.65,71.65,0,0,0,27.64,56.3A32,32,0,0,1,96,186v6h64v-6a32.15,32.15,0,0,1,12.47-25.35A71.65,71.65,0,0,0,200,104Zm-16.11-9.34a57.6,57.6,0,0,0-46.56-46.55,8,8,0,0,0-2.66,15.78c16.57,2.79,30.63,16.85,33.44,33.45A8,8,0,0,0,176,104a9,9,0,0,0,1.35-.11A8,8,0,0,0,183.89,94.66Z"></path>
                </svg>
                <span className="font-medium">Submitted Ideas</span>
              </a>
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors" href="/reports">
                <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                  <path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Zm0,16V161.57l-51.77-32.35a8,8,0,0,0-8.48,0L72,161.56V48ZM132.23,177.22a8,8,0,0,0-8.48,0L72,209.57V180.43l56-35,56,35v29.14Z"></path>
                </svg>
                <span className="font-medium">Saved Reports</span>
              </a>
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors" href="/analytics">
                <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                  <path d="M216,40H136V24a8,8,0,0,0-16,0V40H40A16,16,0,0,0,24,56V176a16,16,0,0,0,16,16H79.36L57.75,219a8,8,0,0,0,12.5,10l29.59-37h56.32l29.59,37a8,8,0,1,0,12.5-10l-21.61-27H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,136H40V56H216V176ZM104,120v24a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0Zm32-16v40a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm32-16v56a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0Z"></path>
                </svg>
                <span className="font-medium">Analytics</span>
              </a>
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors" href="/settings">
              <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z"></path>
              </svg>
              <span className="font-medium">Settings</span>
            </a>
          </div>
        </div>
        

        
        {/* Mobile Header */}
        <div className="md:hidden bg-gray-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 p-2 rounded-lg">
              <svg className="text-white" fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm42.42-126.13a8,8,0,0,0-11.32,0L112,136.69,94.91,119.6a8,8,0,0,0-11.32,11.32l22.63,22.63a8,8,0,0,0,11.32,0L170.42,97.19A8,8,0,0,0,170.42,89.87Z"></path>
              </svg>
            </div>
            <h1 className="text-white text-lg font-bold">Idea Analyzer</h1>
          </div>
          {user && (
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-full bg-gray-700 p-1 hover:bg-gray-600"
              >
                <div className="aspect-square size-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <a href="/analysis" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Analysis
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                  </a>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            </header>
            
            {/* Submitted Ideas Section */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Submitted Ideas</h2>
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-4 text-sm font-semibold text-gray-600">Idea</th>
                        <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                        <th className="p-4 text-sm font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                  <tbody>
                    {error ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-red-600">
                          {error}
                        </td>
                      </tr>
                    ) : ideas.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-gray-500">
                          No ideas submitted yet. <a href="/" className="text-indigo-600 hover:text-indigo-500">Submit your first idea!</a>
                        </td>
                      </tr>
                    ) : (
                      ideas.map((idea) => (
                        <tr key={idea.id} className="border-t border-gray-200">
                          <td className="p-4 text-gray-800">{idea.title}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(idea.status)}`}>
                              <svg className="w-2 h-2 mr-2 text-current" fill="currentColor" viewBox="0 0 8 8">
                                <circle cx="4" cy="4" r="3"></circle>
                              </svg>
                              {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                            </span>
                          </td>
                          <td className="p-4 flex gap-2">
                            {idea.status === 'analyzed' ? (
                              <>
                                <button 
                                  onClick={() => handleViewAnalysis(idea.id!)}
                                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                  <svg fill="currentColor" height="16" viewBox="0 0 256 256" width="16" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.48c.35.79,8.82,19.58,27.65,38.41C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.35c18.83-18.83,27.3-37.62,27.65-38.41A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
                                  </svg>
                                  View Analysis
                                </button>
                                <button 
                                  onClick={() => handleDownloadReport(idea.id!)}
                                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                  <svg fill="currentColor" height="16" viewBox="0 0 256 256" width="16" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M213.66,133.66l-80,80a8,8,0,0,1-11.32,0l-80-80a8,8,0,0,1,11.32-11.32L120,188.69V40a8,8,0,0,1,16,0V188.69l66.34-66.35a8,8,0,0,1,11.32,11.32Z"></path>
                                  </svg>
                                  Download
                                </button>
                              </>
                            ) : idea.status === 'analyzing' ? (
                              <span className="text-sm text-blue-600">Processing...</span>
                            ) : (
                              <span className="text-sm text-gray-400">Pending</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  </table>
                </div>
              </div>
            </section>
            
            {/* Analytics Section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-2">
                  <p className="text-gray-600 font-medium">Total Ideas</p>
                  <div className="flex items-end gap-2">
                    <p className="text-4xl font-bold text-gray-900">{analytics.totalIdeas}</p>
                    <span className="text-sm font-semibold text-blue-500 flex items-center">
                      <svg className="mr-1" fill="currentColor" height="16" viewBox="0 0 256 256" width="16" xmlns="http://www.w3.org/2000/svg">
                        <path d="M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16,16,0,0,0-6.23-12.66A87.59,87.59,0,0,1,40,104.49C39.74,56.83,78.26,17.14,125.88,16A88,88,0,0,1,216,104Zm-16,0a72,72,0,0,0-73.74-72c-39,.92-70.47,33.39-70.26,72.39a71.65,71.65,0,0,0,27.64,56.3A32,32,0,0,1,96,186v6h64v-6a32.15,32.15,0,0,1,12.47-25.35A71.65,71.65,0,0,0,200,104Z"></path>
                      </svg>
                      Submitted
                    </span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-2">
                  <p className="text-gray-600 font-medium">Average Success Score</p>
                  <div className="flex items-end gap-2">
                    <p className="text-4xl font-bold text-gray-900">{analytics.averageScore}%</p>
                    <span className={`text-sm font-semibold flex items-center ${
                      analytics.averageScore >= 80 ? 'text-green-500' :
                      analytics.averageScore >= 60 ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      <svg className="mr-1" fill="currentColor" height="16" viewBox="0 0 256 256" width="16" xmlns="http://www.w3.org/2000/svg">
                        <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32,0l-40-40a8,8,0,0,1,11.32-11.32L120,188.69l66.34-66.35a8,8,0,0,1,11.32,11.32Z"></path>
                      </svg>
                      {analytics.averageScore >= 80 ? 'Excellent' :
                       analytics.averageScore >= 60 ? 'Good' : 'Needs Work'}
                    </span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-2">
                  <p className="text-gray-600 font-medium">Analysis Success Rate</p>
                  <div className="flex items-end gap-2">
                    <p className="text-4xl font-bold text-gray-900">{analytics.successRate}%</p>
                    <span className="text-sm font-semibold text-indigo-500 flex items-center">
                      <svg className="mr-1" fill="currentColor" height="16" viewBox="0 0 256 256" width="16" xmlns="http://www.w3.org/2000/svg">
                        <path d="M104,120v24a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0Zm32-16v40a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm32-16v56a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0Z"></path>
                      </svg>
                      Completion
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
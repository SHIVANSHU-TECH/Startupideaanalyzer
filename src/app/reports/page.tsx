'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FirebaseIdea } from '@/lib/firebase';
import { downloadHTMLReport, downloadPDFReport, generateReportImage } from '@/lib/client-report-generator';
import ProtectedRoute from '@/components/ProtectedRoute';

function ReportsContent() {
  const { user, logout, getUserIdeasList } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterFormat, setFilterFormat] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Fetch reports from Firebase (based on analyzed ideas)
  const fetchReports = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      if (!user) {
        setReports([]);
        setTotalReports(0);
        setTotalPages(1);
        return;
      }
      
      // Get all analyzed ideas from Firebase
      const allIdeas = await getUserIdeasList();
      
      // Convert analyzed ideas to report format
      let reportData = allIdeas
        .filter(idea => idea.status === 'analyzed' && idea.analysis)
        .map(idea => ({
          id: idea.id,
          title: `${idea.title} - Analysis Report`,
          format: 'pdf' as const,
          downloadCount: 0,
          ideaId: idea.id,
          ideaTitle: idea.title,
          metadata: {
            successScore: idea.analysis?.successScore
          },
          createdAt: idea.updatedAt?.toISOString() || idea.createdAt.toISOString()
        }));
      
      // Apply filters
      if (filterFormat !== 'all') {
        reportData = reportData.filter(report => report.format === filterFormat);
      }
      
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        reportData = reportData.filter(report => 
          report.title.toLowerCase().includes(searchLower) ||
          (report.ideaTitle && report.ideaTitle.toLowerCase().includes(searchLower))
        );
      }
      
      // Apply pagination
      const totalCount = reportData.length;
      const totalPagesCount = Math.ceil(totalCount / 10);
      const startIndex = (page - 1) * 10;
      const endIndex = startIndex + 10;
      const paginatedReports = reportData.slice(startIndex, endIndex);
      
      setReports(paginatedReports);
      setCurrentPage(page);
      setTotalPages(totalPagesCount);
      setTotalReports(totalCount);
      
      // Adjust current page if necessary
      if (page > totalPagesCount && totalPagesCount > 0) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch reports on component mount and when filters change
  useEffect(() => {
    if (user) {
      fetchReports(1);
      setCurrentPage(1);
    }
  }, [user, filterFormat, searchTerm]);

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchReports(page);
  };

  // Download report (now with actual functionality)
  const handleDownloadReport = async (reportId: string, format: string = 'pdf') => {
    try {
      // Find the idea corresponding to this report
      const allIdeas = await getUserIdeasList();
      const idea = allIdeas.find(idea => idea.id === reportId);
      
      if (!idea || !idea.analysis) {
        throw new Error('Idea or analysis not found');
      }
      
      const reportData = {
        idea,
        userInfo: {
          name: user?.displayName || user?.email?.split('@')[0] || 'User',
          email: user?.email || 'user@example.com'
        }
      };
      
      setLoading(true);
      
      switch (format.toLowerCase()) {
        case 'html':
          downloadHTMLReport(reportData);
          break;
        case 'pdf':
          await downloadPDFReport(reportData);
          break;
        case 'image':
        case 'png':
          await generateReportImage(reportData);
          break;
        default:
          await downloadPDFReport(reportData);
      }
      
      // Show success message based on format
      const formatName = format.toLowerCase();
      const message = formatName === 'pdf' 
        ? 'PDF print dialog opened. You can save it as PDF from the print dialog.'
        : formatName === 'html'
        ? 'HTML report downloaded successfully!'
        : 'Report image generated successfully!';
      
      alert(message);
    } catch (error) {
      console.error('Failed to download report:', error);
      alert('Failed to download report: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Delete report (not implemented yet - reports are derived from ideas)
  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }
    
    try {
      // For now, we'll show a message that this feature is coming soon
      alert('Delete functionality coming soon! To remove a report, delete the corresponding analyzed idea.');
    } catch (error) {
      console.error('Failed to delete report:', error);
      alert('Failed to delete report. Please try again.');
    }
  };

  // View report (navigate to analysis page)
  const handleViewReport = (reportId: string, ideaId: string) => {
    router.push(`/analysis/${ideaId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col" style={{ fontFamily: '"Spline Sans", "Noto Sans", sans-serif' }}>
      <div className="flex h-full grow">
        {/* Sidebar - Same as Ideas page */}
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
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-600 text-white" href="/reports">
                <span className="font-medium">Saved Reports</span>
              </a>
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors" href="/analytics">
                <span className="font-medium">Analytics</span>
              </a>
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900">Saved Reports</h1>
              <p className="text-gray-600 mt-2">Access your startup idea analysis reports.</p>
            </header>
            
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64"
                    />
                    <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <select
                    value={filterFormat}
                    onChange={(e) => setFilterFormat(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">All Formats</option>
                    <option value="pdf">PDF Reports</option>
                    <option value="html">HTML Reports</option>
                    <option value="image">Image Reports</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {totalReports} total reports
                  </span>
                  <button
                    onClick={() => router.push('/ideas')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    View Ideas to Generate Reports
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}

            {/* Reports List */}
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                        <div className="flex items-center gap-2 ml-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {report.format.toUpperCase()}
                          </span>
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete report"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Analysis for: {report.ideaTitle || 'Untitled Idea'}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>Created: {formatDate(report.createdAt)}</span>
                        {report.metadata?.successScore && (
                          <span className="font-medium text-indigo-600">Score: {report.metadata.successScore}/100</span>
                        )}
                        <span className="capitalize">Format: {report.format}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-6">
                      <button 
                        onClick={() => handleViewReport(report.id, report.ideaId)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleDownloadReport(report.id, 'pdf')}
                          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                          title="Download as PDF"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          PDF
                        </button>
                        <button 
                          onClick={() => handleDownloadReport(report.id, 'html')}
                          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                          title="Download as HTML"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                          HTML
                        </button>
                        <button 
                          onClick={() => handleDownloadReport(report.id, 'image')}
                          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                          title="Download as Image"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          IMG
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {reports.length === 0 && !loading && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No reports found</h3>
                <p className="mt-2 text-gray-500">
                  {searchTerm || filterFormat !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Your analysis reports will appear here once ideas are analyzed.'
                  }
                </p>
                {!searchTerm && filterFormat === 'all' && (
                  <button
                    onClick={() => router.push('/ideas')}
                    className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    View Your Ideas
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-700">
                  Showing page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg ${
                            page === currentPage
                              ? 'bg-indigo-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Reports() {
  return (
    <ProtectedRoute>
      <ReportsContent />
    </ProtectedRoute>
  );
}
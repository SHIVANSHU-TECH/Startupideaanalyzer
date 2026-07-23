"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getIdea, FirebaseIdea } from '@/lib/firebase';

const AnalysisPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user, analyzeIdeaById } = useAuth();
  const [idea, setIdea] = useState<FirebaseIdea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const ideaId = params.id as string;

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!ideaId) {
      router.push('/dashboard');
      return;
    }

    fetchIdea();
  }, [user, ideaId]);

  // Add periodic polling for analysis completion
  useEffect(() => {
    if (!ideaId || !user || (idea && idea.status === 'analyzed') || (idea && idea.status === 'failed')) {
      return;
    }

    const interval = setInterval(() => {
      fetchIdea();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [ideaId, user, idea?.status]);

  const fetchIdea = async () => {
    try {
      setLoading(true);
      const fetchedIdea = await getIdea(ideaId);
      
      if (!fetchedIdea) {
        setError('Idea not found');
        return;
      }
      
      // Check if user owns this idea
      if (fetchedIdea.userId !== user?.uid) {
        setError('You do not have permission to view this idea');
        return;
      }
      
      setIdea(fetchedIdea);
    } catch (error) {
      console.error('Failed to fetch idea:', error);
      setError('Failed to load idea. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeIdea = async () => {
    if (!idea) return;
    
    console.log('🔍 handleAnalyzeIdea called for idea:', idea.id);
    
    try {
      setIsAnalyzing(true);
      console.log('🚀 Calling analyzeIdeaById...');
      await analyzeIdeaById(ideaId);
      console.log('✅ analyzeIdeaById completed, refreshing idea data...');
      // Refresh the idea data
      await fetchIdea();
      console.log('✅ Idea data refreshed');
    } catch (error) {
      console.error('💥 Failed to analyze idea in handleAnalyzeIdea:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze idea. Please try again.');
    } finally {
      setIsAnalyzing(false);
      console.log('🔄 handleAnalyzeIdea finished');
    }
  };

  const handleGenerateReport = async () => {
    if (!idea) return;
    
    try {
      // This would integrate with your report generation system
      console.log('Generating report for idea:', idea.id);
      alert('Report generation feature coming soon!');
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Analysis Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested analysis could not be found.'}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const getSuccessScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuccessScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Idea Analysis</h1>
            </div>
            <div className="flex space-x-3">
              {idea.status !== 'analyzed' && idea.status !== 'analyzing' && (
                <button
                  onClick={handleAnalyzeIdea}
                  disabled={isAnalyzing}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : 'Analyze Idea'}
                </button>
              )}
              <button
                onClick={handleGenerateReport}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Idea Overview */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="sm:flex sm:items-center sm:justify-between">
                <div className="sm:flex sm:space-x-5">
                  <div className="mt-4 text-center sm:mt-0 sm:text-left">
                    <h2 className="text-xl font-bold text-gray-900">{idea.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {idea.category} • {new Date(idea.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex justify-center sm:mt-0">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    idea.status === 'analyzed' ? 'bg-green-100 text-green-800' :
                    idea.status === 'analyzing' ? 'bg-blue-100 text-blue-800' :
                    idea.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{idea.description}</p>
              </div>
            </div>
          </div>

          {idea.status === 'pending' && (
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analysis Not Started</h3>
                <p className="text-gray-500 mb-4">Click the &ldquo;Analyze Idea&rdquo; button to begin the analysis.</p>
                <button
                  onClick={handleAnalyzeIdea}
                  disabled={isAnalyzing}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : 'Analyze Idea'}
                </button>
              </div>
            </div>
          )}

          {idea.status === 'analyzing' && (
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analysis in Progress</h3>
                <p className="text-gray-500">Your startup idea is being analyzed. This may take a few moments...</p>
              </div>
            </div>
          )}

          {idea.status === 'failed' && (
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analysis Failed</h3>
                <p className="text-gray-500 mb-4">There was an error analyzing your idea. Please try again.</p>
                <button
                  onClick={handleAnalyzeIdea}
                  disabled={isAnalyzing}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Retrying...
                    </>
                  ) : 'Retry Analysis'}
                </button>
              </div>
            </div>
          )}

          {idea.analysis ? (
            <>
              {/* Success Score */}
              <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                <div className="px-4 py-5 sm:p-6">
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getSuccessScoreBg(idea.analysis.successScore)} mb-4`}>
                      <span className={`text-2xl font-bold ${getSuccessScoreColor(idea.analysis.successScore)}`}>
                        {idea.analysis.successScore}%
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Success Score</h3>
                    <p className="text-sm text-gray-500 mt-1">Overall viability and potential for success</p>
                  </div>
                </div>
              </div>

              {/* Market Analysis */}
              <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Market Analysis</h3>
                  <p className="text-gray-700 whitespace-pre-line">{idea.analysis.marketAnalysis}</p>
                </div>
              </div>

              {/* SWOT Analysis */}
              <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">SWOT Analysis</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">Strengths</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        {idea.analysis.swot?.strengths?.map((strength, index) => (
                          <li key={index}>• {strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">Weaknesses</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        {idea.analysis.swot?.weaknesses?.map((weakness, index) => (
                          <li key={index}>• {weakness}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Opportunities</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        {idea.analysis.swot?.opportunities?.map((opportunity, index) => (
                          <li key={index}>• {opportunity}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">Threats</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {idea.analysis.swot?.threats?.map((threat, index) => (
                          <li key={index}>• {threat}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
                  <ul className="space-y-3">
                    {idea.analysis.recommendations?.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Financial Projections */}
              {idea.analysis.financialProjections && (
                <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Projections</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900">Revenue Projection</h4>
                        <p className="text-gray-700 text-sm mt-1">{idea.analysis.financialProjections.revenueProjection}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Cost Estimate</h4>
                        <p className="text-gray-700 text-sm mt-1">{idea.analysis.financialProjections.costEstimate}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Break-even Analysis</h4>
                        <p className="text-gray-700 text-sm mt-1">{idea.analysis.financialProjections.breakEvenAnalysis}</p>
                      </div>
                      {idea.analysis.financialProjections.breakEvenTime && (
                        <div>
                          <h4 className="font-medium text-gray-900">Break-even Time</h4>
                          <p className="text-gray-700 text-sm mt-1">{idea.analysis.financialProjections.breakEvenTime}</p>
                        </div>
                      )}
                      {idea.analysis.financialProjections.fundingRequirement && (
                        <div>
                          <h4 className="font-medium text-gray-900">Funding Requirement</h4>
                          <p className="text-gray-700 text-sm mt-1">{idea.analysis.financialProjections.fundingRequirement}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Analysis */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {(idea.analysis.competitorAnalysis || (typeof idea.analysis.competitorAnalysis === 'string' && idea.analysis.competitorAnalysis.length > 0)) && (
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Competitor Analysis</h3>
                      <div className="space-y-3">
                        {typeof idea.analysis.competitorAnalysis === 'string' ? (
                          <p className="text-gray-700 text-sm whitespace-pre-line">
                            {idea.analysis.competitorAnalysis}
                          </p>
                        ) : (
                          <>
                            <div>
                              <h4 className="font-medium text-gray-900">Main Competitors</h4>
                              <ul className="text-gray-700 text-sm mt-1 list-disc list-inside">
                                {Array.isArray(idea.analysis.competitorAnalysis?.mainCompetitors) && 
                                  idea.analysis.competitorAnalysis.mainCompetitors.map((competitor, index) => (
                                    <li key={index}>{competitor}</li>
                                  ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Competitive Advantage</h4>
                              <p className="text-gray-700 text-sm mt-1 whitespace-pre-line">
                                {idea.analysis.competitorAnalysis?.competitiveAdvantage}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Market Position</h4>
                              <p className="text-gray-700 text-sm mt-1 whitespace-pre-line">
                                {idea.analysis.competitorAnalysis?.marketPosition}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {(idea.analysis.targetAudience || (typeof idea.analysis.targetAudience === 'string' && idea.analysis.targetAudience.length > 0)) && (
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Target Audience</h3>
                      <div className="space-y-3">
                        {typeof idea.analysis.targetAudience === 'string' ? (
                          <p className="text-gray-700 text-sm whitespace-pre-line">
                            {idea.analysis.targetAudience}
                          </p>
                        ) : (
                          <>
                            <div>
                              <h4 className="font-medium text-gray-900">Primary Audience</h4>
                              <p className="text-gray-700 text-sm mt-1 whitespace-pre-line">
                                {idea.analysis.targetAudience?.primaryAudience}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Secondary Audience</h4>
                              <p className="text-gray-700 text-sm mt-1 whitespace-pre-line">
                                {idea.analysis.targetAudience?.secondaryAudience}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Market Size</h4>
                              <p className="text-gray-700 text-sm mt-1 whitespace-pre-line">
                                {idea.analysis.targetAudience?.marketSize}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default AnalysisPage;
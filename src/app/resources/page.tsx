'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Resources() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const categories = [
    { id: 'all', name: 'All Resources', count: 45 },
    { id: 'guides', name: 'Startup Guides', count: 12 },
    { id: 'templates', name: 'Templates', count: 8 },
    { id: 'tools', name: 'Tools & Software', count: 15 },
    { id: 'funding', name: 'Funding Resources', count: 6 },
    { id: 'legal', name: 'Legal & Compliance', count: 4 }
  ];

  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const query = activeCategory === 'all' ? '' : `?category=${activeCategory}`;
        const res = await fetch(`/api/resources${query}`);
        const data = await res.json();
        if (data.success) {
          setResources(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [activeCategory]);

  const tools = [
    {
      name: "Lean Canvas Generator",
      description: "Interactive tool to create your Lean Canvas online",
      category: "Planning",
      type: "Web Tool",
      isPremium: false
    },
    {
      name: "Market Size Calculator",
      description: "Estimate your Total Addressable Market (TAM) with data-driven insights",
      category: "Research",
      type: "Calculator",
      isPremium: true
    },
    {
      name: "Competitor Analysis Template",
      description: "Structured template to analyze your competition systematically",
      category: "Research",
      type: "Spreadsheet",
      isPremium: false
    },
    {
      name: "Financial Model Builder",
      description: "Build comprehensive financial projections for your startup",
      category: "Finance",
      type: "Spreadsheet",
      isPremium: true
    }
  ];

  return (
    <div className="relative flex size-full min-h-screen flex-col" style={{ fontFamily: '"Spline Sans", "Noto Sans", sans-serif' }}>
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 px-10 py-4">
        <div className="flex items-center gap-4 text-gray-900">
          <div className="size-8 text-indigo-600">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold leading-tight tracking-[-0.015em] text-gray-900">Startup Idea Analyzer</h2>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6">
            <Link className="text-base font-medium text-gray-600 hover:text-gray-900" href="/">Home</Link>
            <a className="text-base font-medium text-gray-600 hover:text-gray-900" href="/how-it-works">How It Works</a>
            <a className="text-base font-medium text-gray-600 hover:text-gray-900" href="/pricing">Pricing</a>
            <a className="text-base font-medium text-gray-600 hover:text-gray-900" href="/community">Community</a>
            <a className="text-base font-medium text-gray-900" href="/resources">Resources</a>
          </nav>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-full bg-gray-100 p-1 hover:bg-gray-200"
              >
                <div className="aspect-square size-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user.displayName || user.email}
                </span>
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <a href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</a>
                  <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <a href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Log In</a>
              <a href="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">Sign Up</a>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        {/* Hero Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
                Startup Resources
              </h1>
              <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to build, validate, and grow your startup. Free guides, templates, tools, and expert resources.
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-6 py-3 rounded-full font-medium text-sm transition-colors ${activeCategory === category.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {loading ? (
                    <div className="flex justify-center p-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : resources.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-lg border border-gray-200">
                      <p className="text-gray-500">No resources found in this category.</p>
                    </div>
                  ) : (
                    resources.map((resource) => (
                      <div key={resource._id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {resource.type}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-4">{resource.description}</p>

                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                {resource.downloadCount} downloads
                              </span>
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {resource.rating}
                              </span>
                              <span>{resource.fileType} • {resource.size || 'N/A'}</span>
                              <span>By {resource.author}</span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <button className="bg-indigo-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                              {resource.linkUrl ? 'Visit Tool' : 'Download'}
                            </button>
                            <button className="text-gray-600 text-sm hover:text-gray-800">
                              Preview
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Last updated: {new Date(resource.updatedAt || resource.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  {/* Interactive Tools */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Interactive Tools</h3>
                    <div className="space-y-4">
                      {tools.map((tool, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 text-sm">{tool.name}</h4>
                            {tool.isPremium && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pro
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-3">{tool.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">{tool.category}</span>
                            <button className={`text-xs px-3 py-1 rounded-md font-medium ${tool.isPremium
                              ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}>
                              {tool.isPremium ? 'Upgrade' : 'Use Tool'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Popular Downloads */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Downloaded</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-semibold text-sm">
                          1
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Pitch Deck Templates</p>
                          <p className="text-xs text-gray-500">3,421 downloads</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-semibold text-sm">
                          2
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Validation Framework</p>
                          <p className="text-xs text-gray-500">2,847 downloads</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-semibold text-sm">
                          3
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Business Model Canvas</p>
                          <p className="text-xs text-gray-500">1,923 downloads</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Newsletter Signup */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
                    <h3 className="text-lg font-semibold mb-2">Weekly Resources</h3>
                    <p className="text-sm mb-4 opacity-90">
                      Get new templates, guides, and tools delivered to your inbox every week.
                    </p>
                    <div className="space-y-3">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-3 py-2 rounded-md text-gray-900 text-sm placeholder-gray-500"
                      />
                      <button className="w-full bg-white text-indigo-600 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-100">
                        Subscribe
                      </button>
                    </div>
                  </div>

                  {/* Request Resource */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Something Specific?</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Can&apos;t find what you&apos;re looking for? Let us know what resource you need.
                    </p>
                    <button className="w-full bg-gray-100 text-gray-900 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200">
                      Request Resource
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Resources */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Featured This Week</h2>
              <p className="mt-4 text-lg text-gray-600">
                Hand-picked resources to accelerate your startup journey
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Go-to-Market Playbook</h3>
                <p className="text-gray-600 text-sm mb-4">Complete guide to launching your product successfully with proven strategies and tactics.</p>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                  Download Free →
                </button>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Model Template</h3>
                <p className="text-gray-600 text-sm mb-4">5-year financial projection template with automated calculations and investor-ready charts.</p>
                <button className="text-green-600 text-sm font-medium hover:text-green-700">
                  Download Free →
                </button>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Legal Startup Kit</h3>
                <p className="text-gray-600 text-sm mb-4">Essential legal documents and checklists every startup founder needs to know about.</p>
                <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                  Download Free →
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

function AnalysisContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [currentIdea, setCurrentIdea] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const idea = localStorage.getItem('currentIdea');
    if (idea) {
      setCurrentIdea(idea);
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };
  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden" style={{ fontFamily: '"Spline Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 px-10 py-4">
          <div className="flex items-center gap-4 text-gray-900">
            <div className="size-8 text-indigo-600">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z" fill="currentColor"></path>
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
              <a className="text-base font-medium text-gray-600 hover:text-gray-900" href="/resources">Resources</a>
            </nav>
            <div className="flex items-center gap-4">
              <button className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                <div className="text-gray-800" data-icon="Bell" data-size="24px" data-weight="regular">
                  <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                    <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
                  </svg>
                </div>
              </button>
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
                      <a href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Dashboard
                      </a>
                      <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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
              ) : (
                <div className="flex items-center gap-2">
                  <a href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                    Log In
                  </a>
                  <a href="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                    Sign Up
                  </a>
                </div>
              )}
            </div>
          </div>
        </header>
        
        <main className="flex-1 bg-gray-50/50">
          <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <h1 className="text-4xl font-bold tracking-tighter text-gray-900 sm:text-5xl">Idea Analysis Report</h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">Your startup idea has been analyzed. Here are the insights and recommendations.</p>
            </div>
            <div className="mb-12 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="grid items-center gap-8 md:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Potential Success Rating: <span className="text-green-500">78%</span></h3>
                    <p className="mt-2 text-gray-600">Based on our analysis, your startup idea has a high potential for success. Explore the detailed analysis below.</p>
                  </div>
                  <div className="flex gap-4">
                    <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      Refine Idea
                      <svg fill="currentColor" height="16" viewBox="0 0 256 256" width="16" xmlns="http://www.w3.org/2000/svg">
                        <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160,136,75.31,152.69,92,68,176.68ZM48,179.31,76.69,208H48Zm48,25.38L79.31,188,164,103.31,180.69,120Zm96-96L147.31,64l24-24L216,84.68Z"></path>
                      </svg>
                    </button>
                    <button className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2">
                      Save Report
                    </button>
                    <button className="inline-flex items-center justify-center rounded-lg border border-transparent bg-transparent px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-all hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2">
                      Share Insights
                    </button>
                  </div>
                </div>
                <div className="relative h-64 w-full">
                  <div className="absolute inset-0 rounded-lg bg-center bg-no-repeat bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCM2zpHTgeiViVxEx0cRCagWKV7cvuTglYXfShWIreUoEfrILg5LRxNIqa0yoxXKG2DVJ-qQlXASrtlKAM7-82HzCCatP1ln0yIwPfe6LtKHYPNMSgnGSbkAxykZSpewffcI8yWszPSwAocpbjM6txEixyOvOgOMMZ_QK0P08vTErRAkzu9UbXkWZqkQfAcOl7O-qRSOOE4wazY0EHqKaZkM_E8DUmdziYbFHkwKMq9eO50A0XGIHOFrsH2C-k85v3Qwp4Se7dk-ds")' }}></div>
                </div>
              </div>
            </div>
            <div className="grid gap-8">
              {/* Market Analysis */}
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Market Analysis</h2>
                <div className="mt-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  <div className="group relative overflow-hidden rounded-xl shadow-md transition-shadow hover:shadow-lg">
                    <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDoQnaQRGnors3RyIKHsrPfwDDX_V4TowdFtpzZNau7gmH6RQDifHu_c7C7uu210I8_OHbUOX7YLzdOmfcdXnafnWLZi1yaw17Gp7BGoFm_lycgEDgOMYEMiLIiXpXmtQG7ziYPjRivePTpLGQTFtAesOkEgJsR0vjGNNzI9xVJg_46yPkRf_umgjb2VSpREt09gck-mGN_g3S-4DjccGeJdYY1kiurxE_NmWa8bb2B77ijRR9Okgij2ICY-_KYbajeSshVhtMF21E")' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 p-6">
                      <h3 className="text-xl font-bold text-white">Market Insights</h3>
                      <p className="mt-2 text-sm text-gray-200">The market is growing at 15% annually, driven by demand for personalized solutions.</p>
                    </div>
                  </div>
                  <div className="group relative overflow-hidden rounded-xl shadow-md transition-shadow hover:shadow-lg">
                    <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCYnPURYra0meqoGDgL2MM3aFvemYAE7Lm0Kz2X883i21gOy7O_Rf53YCJedI4VIi0qLR6bcJ4wkKzuuzA9d_YZ87bQ4DCM0rHnTiZzwS3qeWCmO3910JCu-2qA6n40kWYdrKCgNaRo2iZnTus__SrUWvW-wyOHrun2NnJd5mKBHX0_KrQCS3CrhltajpgM2vHTjRguCs8rLzcjj_qcJvy55aPdli3mcsseopbRTwYiZOnk8deFOLACcbUO99ZaZZNaP_1lbQoazyk")' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 p-6">
                      <h3 className="text-xl font-bold text-white">Competitor Analysis</h3>
                      <p className="mt-2 text-sm text-gray-200">Key competitors include Innovate Solutions and Tech Pioneers. Your USP is user engagement.</p>
                    </div>
                  </div>
                  <div className="group relative overflow-hidden rounded-xl shadow-md transition-shadow hover:shadow-lg">
                    <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBIT9jM7mvCn5SLjfKQYiI2jVuKNfASvG0KYq5pqZe2DVq9WY8XS51u-FP2SaYDhWj4P4jU1pYBTNEWgKtT3z2z6JASFNgO1B1Lxs6rMVzSrSvzHeK5EyS28t3Mw-yjeWXXgysFv6PjNVW9bYznkT7cECF3GYRB7UhOl1_xlYMyHlHk3DPHzuv0R4BPXKR7nKioz3SHSfAw_oIYWzLou1s9uUM8sngqt3jK10hgKBBDZCbzvggteDHc7VnDy351GJfX_zmyRzxyZqU")' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 p-6">
                      <h3 className="text-xl font-bold text-white">Target Audience</h3>
                      <p className="mt-2 text-sm text-gray-200">Primary: Tech-savvy young professionals (25-35). Secondary: Small business owners.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* SWOT Analysis */}
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">SWOT Analysis</h2>
                <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900">Strengths</h3>
                    <p className="mt-2 text-gray-600">Skilled team, innovative product, strong market understanding.</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900">Weaknesses</h3>
                    <p className="mt-2 text-gray-600">Limited funding, need for rapid scaling, brand awareness challenge.</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900">Opportunities</h3>
                    <p className="mt-2 text-gray-600">New markets, strategic partnerships, social media marketing.</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900">Threats</h3>
                    <p className="mt-2 text-gray-600">Market trends, new competitors, regulatory changes.</p>
                  </div>
                </div>
              </div>
              
              {/* Recommendations */}
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Recommendations</h2>
                <div className="mt-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  <div className="group relative overflow-hidden rounded-xl shadow-md transition-shadow hover:shadow-lg">
                    <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBo8xF3XyrGL3AXDxWC2nmupsEhmmgQmfNz25wzq5t64YcbHEEBVuWlPGbBG9K1mVNCAqDoYAV__ZRVpTZwiUnVupQh4x4BYe9EUOFnMGfow5w1afFpgzAZxSD_r9Td1kVe2DMgZYbZS9eTE5j1BSO_ZW2_zMO_cNl64-nbeK15dbTNGkY_4yB7J8zrVfn713UrZFIDJpZWTpsSqaJmfs3nJ3MLZPq7U6g7TnCLx427-oaXvC3oiAzA8hXE_zKL_D7W4zBvFQMJov4")' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 p-6">
                      <h3 className="text-xl font-bold text-white">Improvement & Pivot</h3>
                      <p className="mt-2 text-sm text-gray-200">Refine UI/UX. Explore adjacent markets based on user feedback.</p>
                    </div>
                  </div>
                  <div className="group relative overflow-hidden rounded-xl shadow-md transition-shadow hover:shadow-lg">
                    <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBJ7LqWarrOqDomV9iLOK1R6Q4q1Up59961Xb71XwNxexu8mk8lq5CNUmdp9mZZUzMlzzCtd9_V3h0ntCmDzh4NoN_UY9ksNFKj_Sdr6K7pt7_sClwFXzgajuvBHPOeUVR7Prl53HVNSzjnTRJExoJbVoV_sgHLbtJ3MTnwevhsgon0ou7zmDTzYAl44zT-xcdLENMozJxyJoyS7uKRpyvINl0FoUfIfn3AAEuLiBnud4eR_bxIOrqMobLHkytsQF7l3gUnWDgvOK4")' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 p-6">
                      <h3 className="text-xl font-bold text-white">Suggested Features</h3>
                      <p className="mt-2 text-sm text-gray-200">Personalized recommendations, platform integrations, and advanced analytics.</p>
                    </div>
                  </div>
                  <div className="group relative overflow-hidden rounded-xl shadow-md transition-shadow hover:shadow-lg">
                    <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAckH50RsLblYx7gFe3e_OxzuMXFUpd7XZWAknMN1rxTQVYNRKLr909AK8ZXZ1WQPsZXKUcSYlTyKp_uXwAt9O1AXHZN3u9PH2XZbyVsxSn6tb-5Bdoa8cyfL78jk0RXZU-zKN9IoADaNTFV7kwCAWxWWh8fpk1Zt-UqF2iNIze-nVpQud1UU5b-wxBRGA6cEEtS74Vk9zGe9WnGGEU-zzpDYY3Ymn9z9115igPguOfMhSfcixWxhfIvRbvXWKC-wZ3IHDhERnkOhs")' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 p-6">
                      <h3 className="text-xl font-bold text-white">Go-to-Market Strategy</h3>
                      <p className="mt-2 text-sm text-gray-200">Focus on digital marketing, content creation, and influencer collaborations.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function Analysis() {
  return (
    <ProtectedRoute>
      <AnalysisContent />
    </ProtectedRoute>
  );
}
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const HomePage = () => {
  const [ideaText, setIdeaText] = useState('');
  const [category, _setCategory] = useState('Technology');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user, submitIdea } = useAuth();
  const router = useRouter();

  const categories = [
    'Technology', 'Healthcare', 'Education', 'Finance', 'E-commerce',
    'Entertainment', 'Food & Beverage', 'Travel', 'Real Estate', 'Sports',
    'Fashion', 'Environment', 'Social Impact', 'B2B Services', 'Other'
  ];

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError('');

    if (!ideaText.trim()) {
      setError('Please enter your startup idea');
      return;
    }

    if (ideaText.trim().length < 20) {
      setError('Please provide more detail about your idea (at least 20 characters)');
      return;
    }

    // Check if user is authenticated
    if (!user) {
      // Store the idea in localStorage temporarily
      localStorage.setItem('pendingIdea', JSON.stringify({
        title: ideaText.trim().split('.')[0].substring(0, 50) +
          (ideaText.trim().length > 50 ? '...' : ''),
        description: ideaText.trim(),
        category
      }));
      // Redirect to login/signup
      router.push('/login');
      return;
    }

    // If authenticated, submit the idea using Firebase
    try {
      setIsSubmitting(true);

      // Create a title from the first sentence or first 50 characters
      const title = ideaText.trim().split('.')[0].substring(0, 50) +
        (ideaText.trim().length > 50 ? '...' : '');

      const ideaId = await submitIdea(title, ideaText.trim(), category);

      // Redirect to the analysis page with the idea ID
      router.push(`/analysis/${ideaId}`);
    } catch (error) {
      console.error('Failed to submit idea:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit idea. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex-1">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z" fill="currentColor"></path>
                </svg>
                <h2 className="text-xl font-bold text-gray-900">Startup Idea Analyzer</h2>
              </div>
              <nav className="hidden items-center gap-8 md:flex">
                <Link className="text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600" href="/">Home</Link>
                <Link className="text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600" href="/pricing">Pricing</Link>
                <Link className="text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600" href="/community">Community</Link>
                <Link className="text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600" href="/resources">Resources</Link>
              </nav>
              <div className="flex items-center gap-4">
                {user ? (
                  <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600 md:block">
                      Dashboard
                    </Link>
                    <div className="flex items-center gap-2 rounded-full bg-gray-100 p-1">
                      <div className="aspect-square size-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden sm:block text-sm font-medium text-gray-700 pr-2">
                        {user.displayName || user.email}
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600 md:block" href="/login">Log In</Link>
                    <Link className="flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700" href="/signup">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="pt-16">
          {/* Hero Section */}
          <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center py-24 sm:py-32">
            <div className="absolute inset-0 z-0 bg-gray-900">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30"
                style={{
                  backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBgpuYiMrjrjPOunwU9kpIgt30kOK7VSZp8BM6Xt8KHK67oeVw_Bxo1sjl6R56yoHCPQVhuVYSawOd7fU6HvPvdkB1SEaqwxB33yC71BFT_B1X9iL2zjO3JXY5ZEXINIrPEl03GWqvKDiHHGIKWOCno8AkldnHk-10Gy8W9bJVdhG3yspq8NBicUT5NcfXxcuD6nKajJrn3_IArDf5rCT02kPii452x07Ay9SdWc5v07Pr0_vaxBu_-O1pdKIDdP4AKHx1-7ybE0yM")`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
            </div>

            <div className="container relative z-10 mx-auto px-4 text-center sm:px-6 lg:px-8">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Validate Your Startup Idea in Minutes with AI Insights
              </h1>
              <p className="mt-6 text-lg text-gray-300">
                Get instant feedback and analysis on your business concept. Enter your idea below to get started.
              </p>

              <div className="mx-auto mt-10 max-w-2xl">
                <div className="rounded-xl bg-white/10 p-2 backdrop-blur-sm">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row">
                    {error && (
                      <div className="absolute -top-16 left-0 right-0 rounded-lg bg-red-500/20 border border-red-500/30 p-3 text-red-100 text-sm">
                        {error}
                      </div>
                    )}



                    <textarea
                      className="form-textarea flex-1 resize-none rounded-lg border-0 bg-white/20 p-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                      placeholder="Describe your startup idea in detail..."
                      rows={4}
                      value={ideaText}
                      onChange={(e) => setIdeaText(e.target.value)}
                      disabled={isSubmitting}
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting || !ideaText.trim()}
                      className="flex h-12 items-center justify-center rounded-lg bg-green-500 px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Analyzing Idea...
                        </>
                      ) : (
                        'Analyze Idea'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>

          {/* Popular Ideas Section */}
          <section className="py-20 sm:py-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Popular Ideas & Success Stories
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  Explore ideas analyzed by our community and see what makes them successful.
                </p>
              </div>

              <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="overflow-hidden rounded-xl bg-white shadow-lg transition-shadow duration-300 hover:shadow-2xl">
                  <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBgpuYiMrjrjPOunwU9kpIgt30kOK7VSZp8BM6Xt8KHK67oeVw_Bxo1sjl6R56yoHCPQVhuVYSawOd7fU6HvPvdkB1SEaqwxB33yC71BFT_B1X9iL2zjO3JXY5ZEXINIrPEl03GWqvKDiHHGIKWOCno8AkldnHk-10Gy8W9bJVdhG3yspq8NBicUT5NcfXxcuD6nKajJrn3_IArDf5rCT02kPii452x07Ay9SdWc5v07Pr0_vaxBu_-O1pdKIDdP4AKHx1-7ybE0yM")` }} />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">AI-Powered Personal Stylist</h3>
                    <p className="mt-2 text-sm text-gray-600">A mobile app that uses AI to recommend outfits based on a user&apos;s wardrobe, style preferences, and local weather.</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">High Potential</span>
                      <Link className="text-sm font-medium text-indigo-600 hover:text-indigo-500" href="#">Read Analysis →</Link>
                    </div>
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl bg-white shadow-lg transition-shadow duration-300 hover:shadow-2xl">
                  <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBCwrxsGMLm1EtvdSzu5Hq-jNmamNv11qnvG--CQcJ5bW77uBhVg-drECPxBUilfM7du9_9YQGcAfXJxuC6j2yx3fK1TJbeUCMRySH0bYnTU_-YTo8KY_ApbM9tS6LCdOkJQI-Ac8JxB2J9OBV5_z0mNexBVkqc2HDZ_F8TP-r4DsQ9qF6biXf2E9slnSXhxgQQHecdynOkw-jc97Rpz3NYcjNOICAaLjv_wi1kEEoqxv9CBFaXbe3j4M6xSN7-OgEpaNZgWh_NxzQ")` }} />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">Eco-Friendly Meal Kit Delivery</h3>
                    <p className="mt-2 text-sm text-gray-600">A subscription service providing meal kits with locally-sourced, organic ingredients and sustainable packaging.</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">Funded</span>
                      <Link className="text-sm font-medium text-indigo-600 hover:text-indigo-500" href="#">Read Analysis →</Link>
                    </div>
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl bg-white shadow-lg transition-shadow duration-300 hover:shadow-2xl">
                  <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuD_Z3RITcsz6CcFJ1Sk0b2KhroK8YbinFBUvrmpC-L2y-Jyy2pVTJuriRny-aiOMyFXTYnuUgeRIfLZ_cbp7TRF1xNgniPxUd4pnj7fVAyBPoY1UfvwCwrNhGfrmL0PGJ4Z5QMymapgOkDM0jzJ6fHE0FxlOba6GnBAousNn40Hn31xaWaKfnaPiXeIujdq5yq0i8D6M_tQrDG-Kq9hxeIhmpCQhnFxrN35MtZ3i0vseBlSNiY6tLlR6kYDYNm_92xSC4l2GeEOh8w")` }} />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">Virtual Reality Language Learning</h3>
                    <p className="mt-2 text-sm text-gray-600">An immersive VR platform where users can practice speaking a new language with AI-powered virtual conversation partners.</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">Promising</span>
                      <Link className="text-sm font-medium text-indigo-600 hover:text-indigo-500" href="#">Read Analysis →</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex flex-col items-center gap-4 md:items-start">
              <div className="flex items-center gap-3">
                <svg className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z" fill="currentColor"></path>
                </svg>
                <h2 className="text-xl font-bold">Startup Idea Analyzer</h2>
              </div>
              <p className="text-sm text-gray-400">© 2024 Idea Analyzer. All rights reserved.</p>
            </div>
            <div className="flex flex-col items-center gap-4 text-center md:items-end">
              <div className="flex gap-6">
                <Link className="text-sm text-gray-400 hover:text-white" href="/how-it-works">About</Link>
                <Link className="text-sm text-gray-400 hover:text-white" href="/community">Contact</Link>
                <Link className="text-sm text-gray-400 hover:text-white" href="/resources">Privacy Policy</Link>
              </div>
              <div className="flex justify-center gap-6">
                <Link className="text-gray-400 hover:text-white" href="#">
                  <span className="sr-only">Twitter</span>
                  <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </Link>
                <Link className="text-gray-400 hover:text-white" href="#">
                  <span className="sr-only">LinkedIn</span>
                  <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path clipRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fillRule="evenodd"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
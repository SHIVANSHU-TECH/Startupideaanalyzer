'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Pricing() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started with basic idea analysis',
      features: [
        '3 idea analyses per month',
        'Basic market insights',
        'SWOT analysis',
        'Community access',
        'Email support'
      ],
      limitations: [
        'Limited to 3 analyses',
        'Basic templates only'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Pro',
      price: { monthly: 29, yearly: 290 },
      description: 'For entrepreneurs ready to validate and refine their ideas',
      features: [
        'Unlimited idea analyses',
        'Advanced market research',
        'Competitor analysis',
        'Financial projections',
        'Custom reports & exports',
        'Priority support',
        'Team collaboration (up to 3 members)'
      ],
      limitations: [],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: { monthly: 99, yearly: 990 },
      description: 'For teams and organizations with advanced needs',
      features: [
        'Everything in Pro',
        'White-label reports',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'Advanced analytics dashboard',
        'Unlimited team members',
        '24/7 phone support'
      ],
      limitations: [],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="relative flex size-full min-h-screen flex-col" style={{ fontFamily: '"Spline Sans", "Noto Sans", sans-serif' }}>
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 px-10 py-4">
        <div className="flex items-center gap-4 text-gray-900">
          <div className="size-8 text-indigo-600">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold leading-tight tracking-[-0.015em] text-gray-900">Startup Idea Analyzer</h2>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6">
            <Link className="text-base font-medium text-gray-600 hover:text-gray-900" href="/">Home</Link>
            <a className="text-base font-medium text-gray-600 hover:text-gray-900" href="/how-it-works">How It Works</a>
            <a className="text-base font-medium text-gray-900" href="/pricing">Pricing</a>
            <a className="text-base font-medium text-gray-600 hover:text-gray-900" href="/community">Community</a>
            <a className="text-base font-medium text-gray-600 hover:text-gray-900" href="/resources">Resources</a>
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
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center mb-16">
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
                Choose Your Plan
              </h1>
              <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
                Get the insights you need to validate and grow your startup idea with our flexible pricing options.
              </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
              <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                    billingCycle === 'monthly' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                    billingCycle === 'yearly' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Yearly <span className="text-green-600 font-semibold">(Save 17%)</span>
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-2xl shadow-lg p-8 relative ${
                    plan.popular ? 'ring-2 ring-indigo-600 scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">
                        ${billingCycle === 'monthly' ? plan.price.monthly : Math.floor(plan.price.yearly / 12)}
                      </span>
                      <span className="text-gray-600">/month</span>
                      {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                        <div className="text-sm text-gray-500 mt-1">
                          Billed annually (${plan.price.yearly})
                        </div>
                      )}
                    </div>
                    <p className="mt-4 text-gray-600">{plan.description}</p>
                  </div>

                  <div className="mt-8">
                    <ul className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <svg className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="ml-3 text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8">
                    <button
                      className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-colors ${
                        plan.popular
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Comparison */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">Compare Features</h2>
              <p className="mt-4 text-lg text-gray-600">
                See what&apos;s included in each plan to find the perfect fit for your needs.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Features</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900">Free</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900">Pro</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-4 px-6 text-sm text-gray-900">Monthly idea analyses</td>
                    <td className="py-4 px-6 text-center text-sm text-gray-600">3</td>
                    <td className="py-4 px-6 text-center text-sm text-gray-600">Unlimited</td>
                    <td className="py-4 px-6 text-center text-sm text-gray-600">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-sm text-gray-900">Market insights</td>
                    <td className="py-4 px-6 text-center">
                      <svg className="h-5 w-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <svg className="h-5 w-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <svg className="h-5 w-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-sm text-gray-900">Advanced competitor analysis</td>
                    <td className="py-4 px-6 text-center">
                      <svg className="h-5 w-5 text-gray-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <svg className="h-5 w-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <svg className="h-5 w-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-sm text-gray-900">Financial projections</td>
                    <td className="py-4 px-6 text-center">
                      <svg className="h-5 w-5 text-gray-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <svg className="h-5 w-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <svg className="h-5 w-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-sm text-gray-900">API access</td>
                    <td className="py-4 px-6 text-center">
                      <svg className="h-5 w-5 text-gray-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <svg className="h-5 w-5 text-gray-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <svg className="h-5 w-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I change my plan anytime?</h3>
                <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated accordingly.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
                <p className="text-gray-600">Yes, we offer a 14-day free trial for the Pro plan. No credit card required.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600">We accept all major credit cards, PayPal, and bank transfers for Enterprise customers.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
import Link from 'next/link';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <svg 
              className="h-8 w-8 text-indigo-600" 
              fill="none" 
              viewBox="0 0 48 48" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z" 
                fill="currentColor"
              />
            </svg>
            <h2 className="text-xl font-bold text-gray-900">Startup Idea Analyzer</h2>
          </div>
          
          <nav className="hidden items-center gap-8 md:flex">
            <Link 
              href="#" 
              className="text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600"
            >
              How It Works
            </Link>
            <Link 
              href="#" 
              className="text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600"
            >
              Pricing
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link 
              href="#" 
              className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600 md:block"
            >
              Log In
            </Link>
            <Link 
              href="#" 
              className="flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
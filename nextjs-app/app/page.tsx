// app/page.tsx
import { Suspense } from "react";
import { Search } from "lucide-react";
import { Roboto } from 'next/font/google';
import { AllPosts } from "./components/Posts";
import type { Metadata } from 'next';

// Initialize Roboto font
const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Step-by-Step DIY Guides & Projects',
  description: 'Discover DIY projects with step-by-step guides for woodworking, home decor, gardening, and crafts. Get AI-powered assistance for your next DIY project.',
};

export default function HomePage() {
  return (
    <div className={roboto.className}>
      {/* Hero Section with Search */}
      <section
        className="relative bg-gradient-to-r from-orange-50 to-white"
        aria-labelledby="hero-heading"
      >
        <div className="container relative">
          <div className="mx-auto max-w-3xl py-20 text-center">
            <h1
              id="hero-heading"
              className="text-xl text-gray-700 mb-8 font-medium"
            >
              Step-by-step guides for your next DIY project
            </h1>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <label htmlFor="search-projects" className="sr-only">
                Search for DIY projects
              </label>
              <input
                id="search-projects"
                type="search"
                placeholder="Search for DIY projects..."
                className="w-full py-4 px-6 pr-12 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <Search
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={24}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Posts Section */}
      <section className="container py-12">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse"
                  role="status"
                  aria-label="Loading post"
                >
                  <div className="bg-gray-200 h-48 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <span className="sr-only">Loading...</span>
                </div>
              ))}
            </div>
          }
        >
          <AllPosts />
        </Suspense>
      </section>
    </div>
  );
}
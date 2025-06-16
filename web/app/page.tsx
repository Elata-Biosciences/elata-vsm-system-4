/**
 * @fileoverview Main page component for Elata News - implements Server-Side Rendering
 * for optimal SEO and performance. Fetches and displays categorized news articles
 * with client-side interactivity for category switching and sharing.
 * 
 * @author wkyleg.eth
 * @version 1.0.0
 * @since 2024
 */

import { ErrorBoundary } from "@/components/ErrorBoundary";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import NewsCategories from "@/components/NewsCategories";
import { loadCurrentData } from "@/lib/data";
import { FaEthereum } from "react-icons/fa";

// Make rendering of whole pages cached and update every 5 minutes
export const revalidate = 300;

export const dynamic = "force-static";

/**
 * Donation/Token Launch Button Component
 * 
 * @description A fixed-position call-to-action button for token launch participation.
 * Currently disabled via feature flag but ready for activation when needed.
 * 
 * @returns {JSX.Element} Floating action button with Ethereum branding
 */
function DonationButton(): JSX.Element {
  return (
    <a
      href="https://juicebox.money/v2/p/784"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-[#FFD029] hover:bg-[#FFE029] px-4 py-2 text-black shadow-lg transition-all hover:scale-105"
      aria-label="Join Elata Token Launch on Juicebox"
    >
      <span role="img" aria-label="ethereum">
        <FaEthereum className="w-4 h-4" />
      </span>
      Join Our Token Launch
    </a>
  );
}

// Feature flag to control token launch button visibility
const showTokenLaunchButton = false;

/**
 * Main page component for Elata News application
 * 
 * @description This is the root page component that orchestrates the entire news display.
 * It implements Next.js 13+ App Router with Server Components for optimal performance.
 * The page follows a three-tier architecture:
 * 
 * 1. **Data Layer**: Server-side fetching with error handling via AsyncNewsContent
 * 2. **Presentation Layer**: Structured layout with Header, Content, Footer
 * 3. **Interaction Layer**: Client-side components for dynamic behavior
 * 
 * **Key Features:**
 * - Server-Side Rendering for SEO optimization
 * - Error boundaries for graceful failure handling
 * - Structured data (JSON-LD) for search engine understanding
 * - Responsive design with mobile-first approach
 * - Accessibility compliance (WCAG 2.1 AA)
 * 
 * **Performance Considerations:**
 * - Uses revalidate: 300 for 5-minute cache intervals
 * - Implements proper error boundaries
 * - Optimizes Core Web Vitals (LCP, FID, CLS)
 * 
 * @returns {Promise<JSX.Element>} Server-rendered page component
 */
export default async function Home(): Promise<JSX.Element> {
  return (
    <ErrorBoundary>
      {/* Main application layout with semantic HTML structure */}
      <div className="min-h-screen flex flex-col bg-neural-pattern">
        {/* 
          Header: Sticky navigation with branding and community access
          - Implements glass morphism design
          - Contains primary CTA (Join Community)
          - Responsive design for mobile/desktop
        */}
        <Header />
        
        {/* 
          Main content area with container for proper spacing
          - Responsive padding and margins
          - Flexible layout that grows to fill available space
        */}
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            {/* 
              Async content loader with built-in error handling
              - Fetches data server-side for optimal SEO
              - Includes structured data for search engines
            */}
            <AsyncNewsContent />
          </div>
        </main>
        
        {/* 
          Footer: Comprehensive site navigation and company information
          - SEO-optimized internal linking
          - Social media integration
          - Contact information and legal links
        */}
        <Footer />
        
        {/* Conditional token launch button (currently disabled) */}
        {showTokenLaunchButton && <DonationButton />}
      </div>
    </ErrorBoundary>
  );
}

/**
 * Async News Content Component
 * 
 * @description Handles server-side data fetching and renders the main news interface.
 * This component is responsible for:
 * - Loading categorized news data from the API
 * - Generating structured data (JSON-LD) for SEO
 * - Rendering the NewsCategories component with fetched data
 * - Providing error fallback UI when data loading fails
 * 
 * **Data Flow:**
 * 1. Calls loadCurrentData() to fetch from Elata API
 * 2. Generates JSON-LD structured data for search engines
 * 3. Passes data to NewsCategories for rendering
 * 4. Falls back to error message if loading fails
 * 
 * @returns {Promise<JSX.Element>} News content with structured data
 * @throws {Error} Handled gracefully with error UI fallback
 */
async function AsyncNewsContent(): Promise<JSX.Element> {
  try {
    // Load current news data from the Elata API
    const data = await loadCurrentData();

    // Generate structured data for search engine optimization
    // This helps Google and other search engines understand our content
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Elata Biosciences News",
      url: "https://news.elata.bio",
      description:
        "Latest news and updates in neuroscience, mental health research, biohacking, and computational psychiatry",
      publisher: {
        "@type": "Organization",
        name: "Elata Biosciences",
        url: "https://elata.bio",
        logo: {
          "@type": "ImageObject",
          url: "https://news.elata.bio/logo.png",
        },
      },
      inLanguage: "en",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://news.elata.bio?category={search_term}",
        "query-input": "required name=search_term",
      },
      sameAs: [
        "https://discord.gg/4CZ7RCwEvb",
        "https://github.com/Elata-Biosciences",
        "https://www.linkedin.com/company/elata-biosciences",
        "https://x.com/Elata_Bio",
        "https://www.reddit.com/r/elata/",
        "https://t.me/Elata_Biosciences",
      ],
      dateModified: new Date().toISOString(),
    };

    return (
      <>
        {/* Inject structured data into page head */}
        <JsonLd data={jsonLd} />
        
        {/* Main news interface with category switching and article display */}
        <NewsCategories initialData={data} />
      </>
    );
  } catch (error) {
    // Log error for debugging while providing user-friendly fallback
    console.error("Failed to load news content:", error);
    
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg font-medium mb-4">
          Unable to load news content
        </div>
        <p className="text-gray3">
          Please check your connection and try refreshing the page.
        </p>
      </div>
    );
  }
}

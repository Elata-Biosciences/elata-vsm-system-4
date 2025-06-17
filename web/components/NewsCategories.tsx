/**
 * @fileoverview NewsCategories Component - Core news display and interaction interface
 * 
 * @description This is the primary content component that handles:
 * - Category-based news filtering with smooth transitions
 * - Article sharing functionality with URL state management
 * - Advanced animations and micro-interactions
 * - Responsive design for mobile and desktop
 * - Accessibility compliance with ARIA labels and keyboard navigation
 * 
 * **Architecture:**
 * - Client-side component with complex state management
 * - URL-based routing for category selection (SEO-friendly)
 * - Modal system for sharing and discussions
 * - Animation system with staggered loading effects
 * 
 * **Performance Features:**
 * - Optimized re-renders with proper dependency arrays
 * - Smooth transitions with CSS transforms
 * - Efficient event handling with cleanup
 * - Lazy loading of modal components
 * 
 * @author wkyleg.eth
 * @version 2.0.0
 * @since 2024
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaArrowRight, FaDiscord } from "react-icons/fa";
import ShareModal from "./ShareModal";
import type {
  SummaryOutput,
  Article,
  SummaryOutputCategoriesKey,
} from "@elata/shared-types";
import { useState, useEffect } from "react";

/**
 * Props interface for NewsCategories component
 * 
 * @interface NewsCategoriesProps
 * @property {SummaryOutput} initialData - Server-fetched categorized news data
 */
interface NewsCategoriesProps {
  initialData: SummaryOutput;
}

/**
 * Maps internal category keys to user-friendly display names
 * 
 * @description This mapping provides human-readable category names for the UI
 * while maintaining consistent internal naming conventions. Categories align
 * with Elata's research focus areas and target audience interests.
 * 
 * @param {SummaryOutputCategoriesKey} category - Internal category identifier
 * @returns {string} Human-readable category name for display
 * 
 * @example
 * ```typescript
 * formatCategoryName('computational') // Returns: "Computational & Precision Psychiatry"
 * formatCategoryName('biohacking')    // Returns: "Experimental Treatments"
 * ```
 */
const formatCategoryName = (category: SummaryOutputCategoriesKey): string => {
  const categoryMap: { [key in SummaryOutputCategoriesKey]: string } = {
    research: "Research News",
    industry: "Industry News",
    biohacking: "Experimental Treatments",
    computational: "Computational & Precision Psychiatry",
    hardware: "Hardware, Neuroimaging, BCIs",
    desci: "DeSci, DAOs, Crypto",
    offTopic: "Off Topic Curiosities",
  };
  return categoryMap[category] || category;
};

/**
 * NewsCategories Component - Main news interface with category filtering
 * 
 * @description The core component responsible for displaying categorized news articles
 * with advanced interaction patterns. Features include:
 * 
 * **Category Management:**
 * - URL-based category selection for SEO and bookmarking
 * - Smooth transitions between categories with loading states
 * - Animated category pills with hover effects and active states
 * 
 * **Article Display:**
 * - Card-based layout with hover animations
 * - Staggered loading animations for visual appeal
 * - Responsive design adapting to screen sizes
 * - Accessibility features (ARIA labels, keyboard navigation)
 * 
 * **Interaction Features:**
 * - Three-dot menu system for article actions
 * - Share modal with URL state management
 * - Discord integration for community discussions
 * - Click-outside-to-close functionality
 * 
 * **State Management:**
 * - Multiple useState hooks for different UI states
 * - useEffect hooks for URL synchronization and event handling
 * - Proper cleanup to prevent memory leaks
 * 
 * @param {NewsCategoriesProps} props - Component props
 * @returns {JSX.Element} Rendered news categories interface
 * 
 * @example
 * ```typescript
 * <NewsCategories initialData={newsData} />
 * ```
 */
export default function NewsCategories({ initialData }: NewsCategoriesProps) {
  const categories = Object.keys(initialData);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [shareItem, setShareItem] = useState<Article | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousCategory, setPreviousCategory] = useState<string | null>(null);

  // Get category from URL or default to first category
  const category = searchParams.get("category");
  const activeCategory = categories.includes(category || "")
    ? category
    : categories[0];

  // Track category changes for animations
  useEffect(() => {
    if (activeCategory && activeCategory !== previousCategory) {
      setPreviousCategory(activeCategory);
    }
  }, [activeCategory, previousCategory]);

  // Add this useEffect to handle share modal on page load
  useEffect(() => {
    if (searchParams.get("share") === "true") {
      const title = searchParams.get("title") || "";
      const author = searchParams.get("author") || "";
      const url = searchParams.get("url") || "";
      const description = searchParams.get("description") || "";
      const source = searchParams.get("source") || "";

      // Create a temporary Article object from URL parameters
      const sharedArticle: Article = {
        title,
        author,
        url,
        description,
        source,
        relevanceScore: 1,
      };

      setShareItem(sharedArticle);
    }
  }, [searchParams]);

  // Add click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && !(event.target as Element).closest(".menu-container")) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  const handleCategoryClick = (newCategory: string) => {
    if (newCategory === activeCategory) return;
    
    // Start transition
    setIsTransitioning(true);
    
    // Immediately update URL for instant pill state change
    const params = new URLSearchParams(searchParams);
    params.set("category", newCategory);
    router.push(`?${params.toString()}`, { scroll: false });
    
    // End transition after content loads
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-8">
      {/* Enhanced Category Pills */}
      <div className="flex flex-wrap gap-3 mb-12">
        {categories
          .filter((category) => category !== "timestamp")
          .map((category) => (
            <button
              key={category}
              type="button"
              className={`
                px-6 py-3 rounded-2xl text-sm font-semibold transform 
                pill-hover relative overflow-hidden backdrop-blur-sm
                font-sf-pro transition-all duration-200 ease-out
                ${activeCategory === category
                  ? "bg-offBlack text-white shadow-lg scale-105 active"
                  : "bg-white/70 text-offBlack border border-gray2/50 hover:bg-white hover:border-gray3"
                }
              `}
              onClick={() => handleCategoryClick(category)}
            >
              <span className="relative z-10">
                {formatCategoryName(category as SummaryOutputCategoriesKey)}
              </span>
              {activeCategory === category && (
                <div className="absolute inset-0 bg-gradient-to-r from-offBlack via-gray3 to-offBlack opacity-20 animate-pulse" />
              )}
            </button>
          ))}
      </div>

      {/* Enhanced Content Grid with Transitions */}
      <div className={`w-full grid gap-8 content-transition ${isTransitioning ? 'changing' : ''}`}>
        {initialData[activeCategory as SummaryOutputCategoriesKey].map(
          (item, index) => (
            <article
              key={`${item.title}-${item.source}-${item.url}`}
              className={`
                w-full bg-cream1 p-8 border border-gray2/50 rounded-3xl 
                transition-all duration-500 ease-out transform-gpu 
                hover:shadow-xl hover:border-elataGreen/30 hover:-translate-y-2 hover:scale-[1.02]
                animate-staggerFadeIn opacity-0
                backdrop-blur-sm bg-cream1/90
              `}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="flex justify-between items-start gap-6">
                <div className="flex-1 relative pb-10">
                  <h2 className="text-xl sm:text-2xl font-bold mb-3 text-offBlack font-montserrat leading-tight">
                    {item.title}
                  </h2>
                  {item.author && (
                    <div className="text-sm text-gray3 mb-5 font-sf-pro animate-slideInRight">
                      by {item.author.split(",")[0]}
                      {item.author.split(",").length > 1 ? " et al." : ""}
                    </div>
                  )}
                  {item?.description && (
                    <p className="text-gray3 mb-6 leading-relaxed font-sf-pro text-base animate-fadeInUp">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="relative menu-container">
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === item.url ? null : item.url)
                    }
                    type="button"
                    className="p-2 text-gray3 hover:text-offBlack transition-all duration-300 hover:scale-110 hover:bg-gray2/30 rounded-full"
                    aria-label="More options"
                  >
                    <span className="text-xl font-bold">⋯</span>
                  </button>

                  {openMenuId === item.url && (
                    <div className="absolute right-0 top-full mt-2 bg-cream1/95 backdrop-blur-md border border-gray2/50 rounded-xl shadow-xl z-20 min-w-[140px] overflow-hidden animate-fadeInScale">
                      <Link
                        href="https://discord.gg/VmkH5JfxMC"
                        className="flex items-center gap-3 px-5 py-4 text-offBlack hover:bg-gray2/40 transition-all duration-300 font-sf-pro font-medium text-sm border-b border-gray2/30 last:border-b-0"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Join our Discord community for discussion"
                        title="Join our Discord community"
                        onClick={() => setOpenMenuId(null)}
                      >
                        <FaDiscord
                          className="w-4 h-4 flex-shrink-0"
                          aria-hidden="true"
                        />
                        Discuss
                      </Link>
                      <button
                        onClick={() => {
                          setShareItem(item);
                          setOpenMenuId(null);
                        }}
                        type="button"
                        className="flex items-center gap-3 px-5 py-4 text-offBlack hover:bg-gray2/40 transition-all duration-300 font-sf-pro font-medium text-sm w-full text-left"
                      >
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                          />
                        </svg>
                        Share
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center p-8">
                <div className="text-sm text-gray3 font-sf-pro font-medium">
                  {item.source}
                </div>
                <Link
                  href={item.url}
                  className="inline-flex items-center gap-2 text-gray3 hover:text-offBlack transition-all duration-300 font-sf-pro font-medium text-sm hover:scale-105 group"
                  target="_blank"
                  rel="noopener noreferrer"
                  title={item.description}
                  aria-label={`Read more about ${item.title}`}
                >
                  Read More
                  <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          )
        )}
      </div>

      {shareItem && (
        <ShareModal
          isOpen={!!shareItem}
          onClose={() => setShareItem(null)}
          item={shareItem}
        />
      )}
    </div>
  );
}
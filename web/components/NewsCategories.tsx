"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaExternalLinkAlt, FaDiscord, FaShare } from "react-icons/fa";
import ShareModal from "./ShareModal";
import type {
  SummaryOutput,
  Article,
  SummaryOutputCategoriesKey,
} from "@elata/shared-types";
import { useState, useEffect } from "react";

interface NewsCategoriesProps {
  initialData: SummaryOutput;
}

const formatCategoryName = (category: SummaryOutputCategoriesKey): string => {
  const categoryMap: { [key in SummaryOutputCategoriesKey]: string } = {
    research: "Research News",
    industry: "Industry News",
    biohacking: "Biohacking Mental Health",
    computational: "Computational & Precision Psychiatry",
    hardware: "Hardware, Neuroimaging, BCIs",
    desci: "DeSci, DAOs, Crypto",
    offTopic: "Off Topic Curiosities",
  };
  return categoryMap[category] || category;
};

export default function NewsCategories({ initialData }: NewsCategoriesProps) {
  const categories = Object.keys(initialData);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [shareItem, setShareItem] = useState<Article | null>(null);

  // Get category from URL or default to first category
  const category = searchParams.get("category");
  const activeCategory = categories.includes(category || "")
    ? category
    : categories[0];

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

  const handleCategoryClick = (newCategory: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("category", newCategory);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-8">
      <div className="flex flex-wrap gap-2 mb-8">
        {categories
          .filter((category) => category !== "timestamp")
          .map((category) => (
            <button
              key={category}
              type="button"
              className={`px-3 py-1.5 rounded-full  text-xs sm:text-sm transition-all duration-300 ease-in-out transform hover:scale-105 ${
                activeCategory === category
                  ? "bg-yellow-400 text-black font-bold shadow-md hover:shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              {formatCategoryName(category as SummaryOutputCategoriesKey)}
            </button>
          ))}
      </div>
      <div className="w-full grid gap-6">
        {initialData[activeCategory as SummaryOutputCategoriesKey].map(
          (item) => (
            <article
              key={`${item.title}-${item.source}-${item.url}`}
              className="w-full bg-white p-6 sm:p-8 border-2 border-black shadow-md 
              hover:border-yellow-400 hover:shadow-xl hover:-translate-y-1
              transition-all duration-500 ease-in-out rounded-none
              transform-gpu animate-fadeIn"
            >
              <h2 className="text-lg sm:text-xl font-bold mb-3">
                {item.title}
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 mb-4">
                <span className="font-medium">{item.source}</span>
                {item.author && (
                  <span className="mt-1 sm:mt-0 italic">
                    by {item.author.split(",")[0]}
                    {item.author.split(",").length > 1 ? " et al." : ""}
                  </span>
                )}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {item?.description}
              </p>
              <div className="w-full grid sm:grid-cols-3 gap-3">
                <Link
                  href={item.url}
                  className="w-full inline-flex justify-center items-center gap-2 
                  bg-black text-white px-4 py-2.5 rounded-none
                  transform transition-all duration-200 ease-out
                  hover:shadow-md hover:bg-gray-800 hover:scale-102
                  active:scale-98"
                  target="_blank"
                  rel="noopener noreferrer"
                  title={item.description}
                  aria-label={`Read more about ${item.title}`}
                >
                  <FaExternalLinkAlt className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12" 
                    aria-hidden="true" 
                  />
                  Read More
                </Link>
                <Link
                  href="https://discord.gg/4CZ7RCwEvb"
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-none shadow-sm hover:shadow-md hover:bg-yellow-500 transition-all"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Join our Discord community for discussion"
                  title="Join our Discord community"
                >
                  <FaDiscord className="w-4 h-4" aria-hidden="true" />
                  Discuss
                </Link>
                <button
                  onClick={() => setShareItem(item)}
                  type="button"
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-none hover:bg-gray-300 transition-colors"
                >
                  <FaShare className="w-4 h-4" />
                  Share
                </button>
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

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaExternalLinkAlt, FaDiscord, FaShare } from "react-icons/fa";
import ShareModal from "./ShareModal";
import { Article } from "@/lib/types";

interface NewsCategoriesProps {
  initialData: {
    [key: string]: Article[];
  };
}

const formatCategoryName = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
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
  console.log(initialData);
  const categories = Object.keys(initialData);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [shareItem, setShareItem] = useState<Article | null>(null);

  useEffect(() => {
    // Check URL parameters on mount
    const params = new URLSearchParams(window.location.search);
    if (params.get("share") === "true") {
      const sharedItem: Article = {
        title: params.get("title") || "",
        description: params.get("description") || "",
        author: params.get("author") || "",
        name: params.get("name") || "",
        url: params.get("url") || "",
      };
      setShareItem(sharedItem);
    }
  }, []);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-8">
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm transition-all duration-300 ease-in-out transform hover:scale-105 ${
              activeCategory === category
                ? "bg-yellow-400 text-black font-bold shadow-md hover:shadow-lg"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => handleCategoryClick(category)}
          >
            {formatCategoryName(category)}
          </button>
        ))}
      </div>
      <div className="w-full grid gap-6">
        {initialData[activeCategory].map((item, index) => (
          <article
            key={index}
            className="w-full bg-white p-6 sm:p-8 border-2 border-black shadow-md 
              hover:border-yellow-400 hover:shadow-xl hover:-translate-y-1
              transition-all duration-300 ease-out rounded-lg
              animate-fadeIn"
          >
            <h2 className="text-lg sm:text-xl font-bold mb-3">{item.title}</h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 mb-4">
              <span className="font-medium">{item.name}</span>
              {item.author && (
                <span className="mt-1 sm:mt-0 italic">
                  by {item.author.split(',')[0]}{item.author.split(',').length > 1 ? ' et al.' : ''}
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
                  bg-black text-white px-4 py-2.5 rounded-md
                  transform transition-all duration-200 ease-out
                  hover:shadow-md hover:bg-gray-800 hover:scale-102
                  active:scale-98"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaExternalLinkAlt className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12" />
                Read More
              </Link>
              <Link
                href="https://discord.gg/your-elata-discord-invite"
                className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded shadow-sm hover:shadow-md hover:bg-yellow-500 transition-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaDiscord className="w-4 h-4" />
                Discuss
              </Link>
              <button
                onClick={() => setShareItem(item)}
                className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
              >
                <FaShare className="w-4 h-4" />
                Share
              </button>
            </div>
          </article>
        ))}
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

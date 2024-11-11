'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { NewsItem } from '@/lib/types'
import { FaExternalLinkAlt, FaDiscord, FaShare } from 'react-icons/fa'
import ShareModal from './ShareModal'

interface NewsCategoriesProps {
  initialData: {
    [key: string]: NewsItem[]
  }
}

export default function NewsCategories({ initialData }: NewsCategoriesProps) {
  const categories = Object.keys(initialData)
  const [activeCategory, setActiveCategory] = useState(categories[0])
  const [shareItem, setShareItem] = useState<NewsItem | null>(null)

  useEffect(() => {
    // Check URL parameters on mount
    const params = new URLSearchParams(window.location.search)
    if (params.get('share') === 'true') {
      const sharedItem: NewsItem = {
        title: params.get('title') || '',
        author: params.get('author') || '',
        source: params.get('source') || '',
        url: params.get('url') || '',
        date: params.get('date') || '',
      }
      setShareItem(sharedItem)
    }
  }, [])

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category)
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-8">
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm transition-all shadow-sm hover:shadow-md ${
              activeCategory === category
                ? 'bg-yellow-400 text-black font-bold shadow-md hover:shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="w-full grid gap-6">
        {initialData[activeCategory].map((item, index) => (
          <article 
            key={index} 
            className="w-full bg-white p-4 sm:p-6 border-2 border-black shadow-md hover:border-yellow-400 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            <h2 className="text-lg sm:text-xl font-bold mb-2">{item.title}</h2>
            <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-600 mb-4">
              <span className="mb-1 sm:mb-0">{item.author}</span>
              <div className="flex gap-2">
                <span>{item.source}</span>
                <span>•</span>
                <span>{item.date}</span>
              </div>
            </div>
            <div className="w-full flex flex-col sm:flex-row gap-2">
              <Link
                href={item.url}
                className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-black text-white px-4 py-2 rounded shadow-sm hover:shadow-md hover:bg-gray-800 transition-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaExternalLinkAlt className="w-4 h-4" />
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
  )
}
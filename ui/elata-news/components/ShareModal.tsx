'use client'

import { useState, useEffect } from 'react'
import { 
  FaTwitter, FaFacebook, FaLinkedin, FaReddit, 
  FaWhatsapp, FaTelegram, FaEnvelope, FaSms,
  FaPinterest, FaTumblr, FaLink, FaExternalLinkAlt,
  FaWeibo, FaLine, FaHackerNews
} from 'react-icons/fa'
import { SiWechat, SiMastodon, SiFarcaster } from 'react-icons/si'
import { NewsItem } from '@/lib/types'
import Link from 'next/link'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  item: NewsItem
}

export default function ShareModal({ isOpen, onClose, item }: ShareModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Update URL with story metadata
      const params = new URLSearchParams(window.location.search)
      params.set('share', 'true')
      params.set('title', item.title)
      params.set('author', item.author)
      params.set('source', item.source)
      params.set('url', item.url)
      window.history.pushState({}, '', `${window.location.pathname}?${params}`)
    }
    
    // Cleanup function to reset URL when modal closes
    return () => {
      window.history.pushState({}, '', window.location.pathname)
    }
  }, [isOpen, item])

  const shareOptions = [
    {
      name: 'Twitter/X',
      icon: FaTwitter,
      action: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(item.title)}&url=${encodeURIComponent(window.location.href)}`)
      }
    },
    {
      name: 'Farcaster',
      icon: SiFarcaster,
      action: () => {
        window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(`${item.title} ${window.location.href}`)}`)
      }
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      action: () => {
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(item.title)}`)
      }
    },
    {
      name: 'Reddit',
      icon: FaReddit,
      action: () => {
        window.open(`https://reddit.com/submit?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(item.title)}`)
      }
    },
    {
      name: 'Hacker News',
      icon: FaHackerNews,
      action: () => {
        window.open(`https://news.ycombinator.com/submitlink?u=${encodeURIComponent(window.location.href)}&t=${encodeURIComponent(item.title)}`)
      }
    },
    {
      name: 'Mastodon',
      icon: SiMastodon,
      action: () => {
        window.open(`https://toot.kytta.dev/?text=${encodeURIComponent(`${item.title} ${window.location.href}`)}`)
      }
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      action: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(`${item.title} ${window.location.href}`)}`)
      }
    },
    {
      name: 'Telegram',
      icon: FaTelegram,
      action: () => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(item.title)}`)
      }
    },
    {
      name: 'WeChat',
      icon: SiWechat,
      action: () => {
        window.open(`weixin://dl/posts?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(item.title)}`)
      }
    },
    {
      name: 'Weibo',
      icon: FaWeibo,
      action: () => {
        window.open(`http://service.weibo.com/share/share.php?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(item.title)}`)
      }
    },
    {
      name: 'LINE',
      icon: FaLine,
      action: () => {
        window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}`)
      }
    },
    {
      name: 'Email',
      icon: FaEnvelope,
      action: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(item.title)}&body=${encodeURIComponent(`Check out this article: ${window.location.href}`)}`
      }
    },
    {
      name: 'SMS',
      icon: FaSms,
      action: () => {
        window.location.href = `sms:?body=${encodeURIComponent(`${item.title} ${window.location.href}`)}`
      }
    },
    {
      name: 'Copy Link',
      icon: FaLink,
      action: () => {
        navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
    }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Share This Story</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="mb-6">
            <h3 className="font-bold mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {item.author} • {item.source}
            </p>
            
            <Link
              href={item.url}
              className="w-full inline-flex justify-center items-center gap-2 bg-black text-white px-4 py-3 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-800 transition-all font-bold"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaExternalLinkAlt className="w-4 h-4" />
              Read Full Article
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={option.action}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <option.icon className="w-6 h-6" />
                <span className="text-sm">{option.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 
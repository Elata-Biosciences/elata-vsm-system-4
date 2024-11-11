'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaDiscord, FaReddit, FaQuestionCircle, FaGithub } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import InfoModal from './InfoModal'

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const socialLinks = [
    {
      icon: FaQuestionCircle,
      onClick: () => setIsModalOpen(true),
      label: 'About Elata',
      isButton: true
    },
    {
      icon: FaGithub,
      href: 'https://github.com/elata-dev',
      label: 'GitHub',
    },
    {
      icon: FaXTwitter,
      href: 'https://x.com/elata',
      label: 'Twitter',
    },
    {
      icon: FaReddit,
      href: 'https://reddit.com/r/elata',
      label: 'Reddit',
    },
    {
      icon: FaDiscord,
      href: 'https://discord.gg/your-elata-discord-invite',
      label: 'Discord',
    },
  ]

  return (
    <>
      <header className="sticky top-0 z-50 bg-black text-white px-3 py-2 sm:p-4 flex justify-between items-center shadow-xl">
        <Link 
          href="https://elata.bio" 
          className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/logo.jpeg"
            alt="Elata Logo"
            width={28}
            height={28}
            className="sm:w-8 sm:h-8 rounded-full shadow-md border-2 border-gray-700 hover:border-yellow-400 transition-colors ring-2 ring-yellow-400/70 ring-offset-2 ring-offset-black hover:ring-yellow-400/90 animate-[subtle-pulse_2s_ease-in-out_infinite]"
          />
          <div className="text-xl sm:text-2xl font-bold">ELATA NEWS</div>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {socialLinks.map(({ icon: Icon, href, label, onClick, isButton }) => 
            isButton ? (
              <button
                key={label}
                onClick={onClick}
                className="p-1.5 sm:p-2 hover:bg-gray-800 rounded-full transition-all hover:shadow-lg"
                aria-label={label}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            ) : (
              <Link
                key={label}
                href={href!}
                className="p-1.5 sm:p-2 hover:bg-gray-800 rounded-full transition-all hover:shadow-lg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            )
          )}
        </div>
      </header>
      <InfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
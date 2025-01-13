"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaDiscord,
  FaReddit,
  FaQuestionCircle,
  FaGithub,
  FaLinkedin,
  FaTelegramPlane,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import InfoModal from "./InfoModal";
import { HiMenu } from "react-icons/hi";

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const socialLinks: {
    icon: React.ElementType;
    href?: string;
    label: string;
    onClick?: () => void;
    isButton?: boolean;
    isSpecialButton?: boolean;
  }[] = [
    {
      icon: FaQuestionCircle,
      onClick: () => setIsModalOpen(true),
      label: "About Elata",
      isButton: true,
    },
    {
      icon: FaGithub,
      href: "https://github.com/Elata-Biosciences/elata-vsm-system-4",
      label: "GitHub",
    },
    {
      icon: FaLinkedin,
      href: "https://www.linkedin.com/company/elata-biosciences/posts/?feedView=all",
      label: "LinkedIn",
    },
    {
      icon: FaXTwitter,
      href: "https://x.com/Elata_Bio",
      label: "Twitter",
    },
    {
      icon: FaReddit,
      href: "https://www.reddit.com/r/elata/",
      label: "Reddit",
    },
    {
      icon: FaTelegramPlane,
      href: "https://t.me/Elata_Biosciences",
      label: "Telegram",
    },
    {
      icon: FaDiscord,
      href: "https://discord.gg/7fgyFgZfyP",
      label: "Discord",
      isSpecialButton: true,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-black text-white px-4 py-4 sm:p-4 flex justify-between items-center shadow-xl">
        <Link
          href="https://elata.bio"
          className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit Elata's main website"
          title="Visit Elata.bio - Advancing Mental Health Research"
        >
          <Image
            src="/logo.jpeg"
            alt="Elata Biosciences Logo"
            width={24}
            height={24}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-md border-2 border-gray-700 hover:border-yellow-400 transition-colors ring-2 ring-yellow-400/70 ring-offset-2 ring-offset-black hover:ring-yellow-400/90 animate-[subtle-pulse_2s_ease-in-out_infinite]"
          />
          <div className="text-lg sm:text-2xl font-bold">ELATA NEWS</div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2 sm:gap-4">
          {socialLinks.map(({ icon: Icon, href, label, onClick, isButton, isSpecialButton }) => (
            isButton ? (
              <button
                type="button"
                key={label}
                onClick={onClick}
                className="p-1.5 sm:p-2 hover:bg-gray-800 rounded-full transition-all hover:shadow-lg"
                aria-label={`Open ${label} information modal`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </button>
            ) : isSpecialButton ? (
              <Link
                key={label}
                href={href || ""}
                className="group inline-flex items-center bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-1.5 rounded-full font-medium text-sm transition-all duration-300 ease-out hover:scale-105 hover:shadow-[0_0_15px_rgba(250,204,21,0.5)] transform-gpu"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join Elata's Discord Community"
                title="Join our active community on Discord"
              >
                Join Community
                <svg 
                  aria-hidden="true"
                  className="w-4 h-4 ml-1.5 animate-none group-hover:animate-bounce-x"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            ) : (
              <Link
                key={label}
                href={href || ""}
                className="p-1.5 sm:p-2 hover:bg-gray-800 rounded-full transition-all hover:shadow-lg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit Elata on ${label}`}
                title={`Follow Elata on ${label}`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </Link>
            )
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden p-2 hover:bg-gray-800 rounded-full"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <HiMenu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-[56px] right-0 w-full bg-black border-t border-gray-800 shadow-xl z-40">
          <div className="px-4 pt-2 pb-4 flex flex-col gap-2">
            {socialLinks.map(({ icon: Icon, href, label, onClick, isButton, isSpecialButton }) =>
              isButton ? (
                <button
                  type="button"
                  key={label}
                  onClick={() => {
                    onClick?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-[2px] py-2.5 hover:bg-gray-800 rounded-lg w-full text-white font-medium"
                >
                  <Icon className="w-5 h-5 min-w-[20px]" />
                  <span>{label}</span>
                </button>
              ) : isSpecialButton ? (
                <Link
                  key={label}
                  href={href || ""}
                  className="flex items-center justify-center gap-3 bg-yellow-400 hover:bg-yellow-500 text-black px-[2px] py-2.5 rounded-lg font-medium w-full mt-1"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5 min-w-[20px]" />
                  Join Community
                </Link>
              ) : (
                <Link
                  key={label}
                  href={href || ""}
                  className="flex items-center gap-3 px-[2px] py-2.5 hover:bg-gray-800 rounded-lg w-full text-white font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5 min-w-[20px]" />
                  <span>{label}</span>
                </Link>
              )
            )}
          </div>
        </div>
      )}

      <InfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

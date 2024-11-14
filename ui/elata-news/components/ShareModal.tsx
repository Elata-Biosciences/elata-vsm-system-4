"use client";

import { useEffect } from "react";
import {
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaReddit,
  FaWhatsapp,
  FaTelegram,
  FaEnvelope,
  FaSms,
  FaPinterest,
  FaTumblr,
  FaLink,
  FaExternalLinkAlt,
  FaWeibo,
  FaLine,
  FaHackerNews,
  FaGetPocket,
  FaTimes,
} from "react-icons/fa";
import {
  SiWechat,
  SiMastodon,
  SiFarcaster,
  SiSubstack,
  SiDiscord,
} from "react-icons/si";
import { Article } from "@/lib/types";
import Link from "next/link";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Article | null;
}

export default function ShareModal({ isOpen, onClose, item }: ShareModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Update URL with story metadata
      const params = new URLSearchParams(window.location.search);
      params.set("share", "true");
      params.set("title", item?.title || "");
      params.set("author", item?.author || "");
      params.set("url", item?.url || "");
      params.set("description", item?.description || "");
      window.history.pushState({}, "", `${window.location.pathname}?${params}`);
    }

    // Cleanup function to reset URL when modal closes
    return () => {
      window.history.pushState({}, "", window.location.pathname);
    };
  }, [isOpen, item]);

  const shareOptions = [
    {
      name: "Twitter/X",
      icon: FaTwitter,
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            item?.title || ""
          )}&url=${encodeURIComponent(window.location.href)}`
        );
      },
    },
    {
      name: "Facebook",
      icon: FaFacebook,
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            window.location.href
          )}`
        );
      },
    },
    {
      name: "Farcaster",
      icon: SiFarcaster,
      action: () => {
        window.open(
          `https://warpcast.com/~/compose?text=${encodeURIComponent(
            `${item?.title || ""} ${window.location.href}`
          )}`
        );
      },
    },
    {
      name: "LinkedIn",
      icon: FaLinkedin,
      action: () => {
        window.open(
          `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
            window.location.href
          )}&title=${encodeURIComponent(item?.title || "")}`
        );
      },
    },
    {
      name: "Reddit",
      icon: FaReddit,
      action: () => {
        window.open(
          `https://reddit.com/submit?url=${encodeURIComponent(
            window.location.href
          )}&title=${encodeURIComponent(item?.title || "")}`
        );
      },
    },
    {
      name: "Hacker News",
      icon: FaHackerNews,
      action: () => {
        window.open(
          `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(
            window.location.href
          )}&t=${encodeURIComponent(item?.title || "")}`
        );
      },
    },
    {
      name: "Mastodon",
      icon: SiMastodon,
      action: () => {
        window.open(
          `https://toot.kytta.dev/?text=${encodeURIComponent(
            `${item?.title || ""} ${window.location.href}`
          )}`
        );
      },
    },
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      action: () => {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            `${item?.title || ""} ${window.location.href}`
          )}`
        );
      },
    },
    {
      name: "Telegram",
      icon: FaTelegram,
      action: () => {
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(
            window.location.href
          )}&text=${encodeURIComponent(item?.title || "")}`
        );
      },
    },
    {
      name: "WeChat",
      icon: SiWechat,
      action: () => {
        window.open(
          `weixin://dl/posts?url=${encodeURIComponent(
            window.location.href
          )}&title=${encodeURIComponent(item?.title || "")}`
        );
      },
    },
    {
      name: "Weibo",
      icon: FaWeibo,
      action: () => {
        window.open(
          `http://service.weibo.com/share/share.php?url=${encodeURIComponent(
            window.location.href
          )}&title=${encodeURIComponent(item?.title || "")}`
        );
      },
    },
    {
      name: "LINE",
      icon: FaLine,
      action: () => {
        window.open(
          `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
            window.location.href
          )}`
        );
      },
    },
    {
      name: "Email",
      icon: FaEnvelope,
      action: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(
          item?.title || ""
        )}&body=${encodeURIComponent(
          `Check out this article: ${window.location.href}`
        )}`;
      },
    },
    {
      name: "SMS",
      icon: FaSms,
      action: () => {
        window.location.href = `sms:?body=${encodeURIComponent(
          `${item?.title || ""} ${window.location.href}`
        )}`;
      },
    },

    {
      name: "Pinterest",
      icon: FaPinterest,
      action: () => {
        window.open(
          `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
            window.location.href
          )}&description=${encodeURIComponent(item?.title || "")}`
        );
      },
    },
    {
      name: "Tumblr",
      icon: FaTumblr,
      action: () => {
        window.open(
          `https://www.tumblr.com/share/link?url=${encodeURIComponent(
            window.location.href
          )}&name=${encodeURIComponent(item?.title || "")}`
        );
      },
    },
    {
      name: "Pocket",
      icon: FaGetPocket,
      action: () => {
        window.open(
          `https://getpocket.com/save?url=${encodeURIComponent(
            window.location.href
          )}&title=${encodeURIComponent(item?.title || "")}`
        );
      },
    },
    {
      name: "Substack Notes",
      icon: SiSubstack,
      action: () => {
        window.open(
          `https://substack.com/notes?url=${encodeURIComponent(
            window.location.href
          )}&title=${encodeURIComponent(item?.title || "")}`
        );
      },
    },
    {
      name: "Discord",
      icon: SiDiscord,
      action: () => {
        window.open(
          `https://discord.com/channels/@me?message=${encodeURIComponent(
            `${item?.title || ""} ${window.location.href}`
          )}`
        );
      },
    },
    {
      name: "Copy Link",
      icon: FaLink,
      action: () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      },
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold">Share This Story!</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors duration-200 p-2 hover:bg-gray-200 rounded-none"
              aria-label="Close"
            >
              <FaTimes className="text-2xl" />
            </button>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-lg sm:text-xl font-semibold leading-snug">{item?.title}</h3>
            <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 gap-1 sm:gap-2">
              <span className="font-medium">{item?.name}</span>
              {item?.author && (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline">•</span>
                  <span className="italic">by {item?.author.split(',')[0]} et al.</span>
                </div>
              )}
            </div>
            {item?.description && (
              <div className="text-sm text-gray-600 leading-relaxed pl-3 border-l-2 border-gray-200">
                {item.description}
              </div>
            )}
          </div>

          <Link
            href={item?.url || ""}
            className="w-full group flex items-center justify-center gap-2 bg-black text-white py-3.5 px-6 rounded-xl mb-8
              hover:bg-gray-800 transition-all duration-200 text-base font-bold"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaExternalLinkAlt className="w-4 h-4 transition-transform group-hover:rotate-12" />
            Read Full Article
          </Link>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-6">
            {shareOptions.slice(0, 6).map((option) => (
              <button
                key={option.name}
                onClick={option.action}
                className="flex flex-col items-center gap-2 p-2 rounded-xl
                  hover:bg-gray-50 active:bg-gray-100 transition-colors group"
              >
                <span className="p-2.5 rounded-full bg-gray-100 group-hover:bg-white transition-colors">
                  <option.icon className="w-5 h-5 text-gray-700" />
                </span>
                <span className="text-xs text-gray-600 text-center">{option.name}</span>
              </button>
            ))}
          </div>

          <div className="pt-6 border-t border-gray-200">
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
              {shareOptions.slice(6).map((option) => (
                <button
                  key={option.name}
                  onClick={option.action}
                  className="flex flex-col items-center gap-2 p-2 rounded-lg
                    hover:bg-gray-50 active:bg-gray-100 transition-colors group"
                >
                  <span className="p-2 rounded-full bg-gray-100 group-hover:bg-white transition-colors">
                    <option.icon className="w-4 h-4 text-gray-600" />
                  </span>
                  <span className="text-xs text-gray-500 text-center whitespace-nowrap">{option.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

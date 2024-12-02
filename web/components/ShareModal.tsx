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
  FaDiscord,
} from "react-icons/fa";
import {
  SiWechat,
  SiMastodon,
  SiFarcaster,
  SiSubstack,
  SiDiscord,
} from "react-icons/si";
import type { Article } from "@elata/shared-types";
import Link from "next/link";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Article | null;
}

export default function ShareModal({ isOpen, onClose, item }: ShareModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Preserve existing parameters (like category) while adding share parameters
      const params = new URLSearchParams(window.location.search);
      params.set("share", "true");
      params.set("title", item?.title || "");
      params.set("author", item?.author || "");
      params.set("url", item?.url || "");
      params.set("description", item?.description || "");
      window.history.pushState({}, "", `${window.location.pathname}?${params}`);
    }

    // Cleanup function to remove only share-related parameters
    return () => {
      const params = new URLSearchParams(window.location.search);
      params.delete("share");
      params.delete("title");
      params.delete("author");
      params.delete("url");
      params.delete("description");

      // If there are remaining parameters (like category), keep them
      const remainingParams = params.toString();
      const newUrl = remainingParams
        ? `${window.location.pathname}?${remainingParams}`
        : window.location.pathname;

      window.history.pushState({}, "", newUrl);
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
      name: "Substack",
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
            <h2 className="text-2xl sm:text-3xl font-bold">
              Share This Story!
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors duration-200 p-2 hover:bg-gray-200 rounded-none"
              aria-label="Close"
            >
              <FaTimes className="text-2xl" />
            </button>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-lg sm:text-xl font-semibold leading-snug">
              {item?.title}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 gap-1 sm:gap-2">
              <span className="font-medium">{item?.source}</span>
              {item?.author && (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline">•</span>
                  <span className="italic">
                    by {item?.author.split(",")[0]} et al.
                  </span>
                </div>
              )}
            </div>
            {item?.description && (
              <div className="text-sm text-gray-600 leading-relaxed pl-3 border-l-2 border-gray-200">
                {item.description}
              </div>
            )}
          </div>

          <div className="w-full grid sm:grid-cols-2 gap-3 mb-8">
            <Link
              href={item?.url || ""}
              className="w-full inline-flex justify-center items-center gap-2 
                bg-black text-white px-4 py-2.5 rounded-md
                transform transition-all duration-200 ease-out
                hover:shadow-md hover:bg-gray-800 hover:scale-102
                active:scale-98"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaExternalLinkAlt className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12" />
              Read Full Article
            </Link>
            <Link
              href="https://discord.gg/4CZ7RCwEvb"
              className="w-full inline-flex justify-center items-center gap-2 
                bg-yellow-400 text-black px-4 py-2.5 rounded-md
                transform transition-all duration-200 ease-out
                hover:shadow-md hover:bg-yellow-500 hover:scale-102
                active:scale-98"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaDiscord className="w-4 h-4" />
              Discuss
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-6">
            {shareOptions.slice(0, 6).map((option) => (
              <button
                key={option.name}
                onClick={option.action}
                type="button"
                className="flex flex-col items-center gap-2 p-2 rounded-xl
                  hover:bg-gray-50 active:bg-gray-100 transition-colors group"
              >
                <span className="p-2.5 rounded-full bg-gray-100 group-hover:bg-white transition-colors">
                  <option.icon className="w-5 h-5 text-gray-700" />
                </span>
                <span className="text-xs text-gray-600 text-center">
                  {option.name}
                </span>
              </button>
            ))}
          </div>

          <div className="pt-6 border-t border-gray-200">
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
              {shareOptions.slice(6).map((option) => (
                <button
                  key={option.name}
                  onClick={option.action}
                  type="button"
                  className="flex flex-col items-center gap-2 p-2 rounded-lg
                    hover:bg-gray-50 active:bg-gray-100 transition-colors group"
                >
                  <span className="p-2 rounded-full bg-gray-100 group-hover:bg-white transition-colors">
                    <option.icon className="w-4 h-4 text-gray-600" />
                  </span>
                  <span className="text-xs text-gray-500 text-center whitespace-nowrap">
                    {option.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

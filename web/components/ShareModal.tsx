"use client";

import { useEffect } from "react";
import Image from "next/image";
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
      params.set("source", item?.source || "");
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
      params.delete("source");

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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-cream1 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray2 scrollbar-hide">
        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Elata Biosciences Logo"
                width={32}
                height={32}
                className="h-8 w-auto object-contain hover:opacity-90 transition-opacity"
              />
              <h2 className="text-3xl font-bold font-montserrat text-offBlack">
                Share This Story!
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray3 hover:text-offBlack transition-colors duration-200 p-2 hover:bg-gray2/30 rounded-lg"
              aria-label="Close"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          <div className="space-y-6 mb-8">
            <h3 className="text-xl font-bold leading-snug font-montserrat text-offBlack">
              {item?.title}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray3 gap-1 sm:gap-2 font-sf-pro">
              <span className="font-medium">
                {item?.author}
                {!!item?.author && !!item?.source && " at "}
                {item?.source}
              </span>
            </div>
            {item?.description && (
              <div className="text-base text-gray3 leading-relaxed pl-5 border-l-2 border-elataGreen/30 font-sf-pro bg-white/30 rounded-r-lg py-4 pr-5">
                {item.description}
              </div>
            )}
          </div>

          <div className="w-full grid sm:grid-cols-2 gap-4 mb-8">
            <Link
              href={item?.url || ""}
              className="w-full inline-flex justify-center items-center gap-3 
                bg-offBlack hover:bg-gray3 text-white px-6 py-3 rounded-none
                transform transition-all duration-300 ease-out
                hover:shadow-lg hover:scale-105 font-sf-pro font-medium"
              target="_blank"
              rel="noopener noreferrer"
              title="Read Full Article"
            >
              <FaExternalLinkAlt className="w-4 h-4" />
              Read Full Article
            </Link>
            <Link
              href="https://discord.gg/4CZ7RCwEvb"
              className="w-full inline-flex justify-center items-center gap-3 
                bg-elataGreen hover:bg-elataGreen/90 text-white px-6 py-3 rounded-none
                transform transition-all duration-300 ease-out
                hover:shadow-lg hover:scale-105 font-sf-pro font-medium"
              target="_blank"
              rel="noopener noreferrer"
              title="Discuss on Elata Bioscience Discord"
            >
              <FaDiscord className="w-4 h-4" />
              Discuss
            </Link>
          </div>

          <div className="pt-8 border-t border-gray2/50">
            <h4 className="text-lg font-bold font-montserrat text-offBlack mb-6">Share on Social Media</h4>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-6">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={option.action}
                  type="button"
                  className="flex flex-col items-center gap-3 p-3 rounded-lg transition-all duration-300 group"
                >
                  <span className="p-3 rounded-full bg-cream2/80 border border-gray2/50 group-hover:scale-110 transition-all duration-300">
                    <option.icon className="w-5 h-5 text-gray3" />
                  </span>
                  <span className="text-xs text-gray3 text-center whitespace-nowrap font-sf-pro">
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

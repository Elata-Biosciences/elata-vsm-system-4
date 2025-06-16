"use client";

import { FaArrowUp } from "react-icons/fa";

export default function ScrollToTopButton() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      className="flex items-center gap-2 text-sm text-gray3 hover:text-offBlack transition-colors font-sf-pro group px-3 py-2 rounded-lg hover:bg-gray2/30"
      aria-label="Scroll to top"
    >
      <span>Back to top</span>
      <FaArrowUp className="w-3 h-3 group-hover:-translate-y-1 transition-transform" />
    </button>
  );
} 
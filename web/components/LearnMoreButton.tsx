"use client";

import { useState } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import InfoModal from "./InfoModal";

export default function LearnMoreButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="group relative inline-flex items-center gap-3 bg-elataGreen hover:bg-elataGreen/90 text-white px-6 py-3 rounded-none font-medium font-sf-pro transition-all duration-300 hover:shadow-lg transform hover:scale-105 overflow-hidden w-full justify-center"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-offBlack/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <FaQuestionCircle className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
        <span className="relative z-10">Learn More</span>
        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-offBlack group-hover:w-full transition-all duration-300 ease-out" />
      </button>

      <InfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
} 
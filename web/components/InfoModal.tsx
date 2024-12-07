"use client";

import Link from "next/link";
import { FaTimes } from "react-icons/fa";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-sm shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              About Elata News
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors duration-200 p-2 hover:bg-gray-200 rounded-none"
            >
              <FaTimes className="text-2xl" />
            </button>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-md font-medium text-gray-800 leading-relaxed mb-6">
              Elata Biosciences is a DAO pioneering an open-source model at the
              intersection of blockchain and neuropsychiatry. Our mission is to
              create a decentralized, distributed, and open ecosystem that
              utilizes blockchain to capitalize drug development efforts in
              high-impact areas across psychiatry.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Key Focus Areas
            </h3>
            <ul className="list-none pl-0 mb-6 grid gap-2">
              {[
                "Cutting-edge research in neuroscience, psychiatry, and psychology",
                "Breakthroughs in mental health treatment",
                "Advances in biohacking and personal optimization",
                "DeSci and Open Science News",
                "Innovation in neuroimaging and brain-computer interfaces",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <span className="text-yellow-500">•</span> {item}
                </li>
              ))}
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Join Our Mission
            </h3>
            <p className="text-gray-700 mb-3 leading-relaxed">
              We&apos;re actively seeking contributors with expertise in:
            </p>
            <ul className="list-none pl-0 mb-6 grid gap-2">
              {[
                "Software Engineering",
                "Computational Neuroscience & Psychiatry",
                "Pharmaceutical Development",
                "Hardware Development",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <span className="text-yellow-500">•</span> {item}
                </li>
              ))}
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              How Elata News Works
            </h3>

            <p className="text-md font-medium text-gray-800 leading-relaxed mb-6">
              Elata News implements System 4 of Stafford Beer&apos;s cybernetic
              framework for organizational management, specifically adapted for
              Decentralized Autonomous Organizations (DAOs). In Beer&apos;s
              model, System 4 serves as the &quot;outside and future&quot;
              sensing organ - monitoring the environment and planning for
              adaptation.{" "}
              <Link
                href="https://kelsienabben.substack.com/p/aligning-the-concept-of-decentralized"
                target="_blank"
                className="text-blue-600 hover:text-blue-800 underline decoration-2 decoration-blue-200 hover:decoration-blue-500 transition-all"
              >
                This project applies this principle to the DAO&apos;s
                decision-making process.
              </Link>
            </p>

            <p className="text-md font-medium text-gray-800 leading-relaxed mb-6">
              The overall intent of this project is to{" "}
              <Link
                href="https://kelsienabben.substack.com/p/governatooorr-guardrails-practical"
                target="_blank"
                className="text-blue-600 hover:text-blue-800 underline decoration-2 decoration-blue-200 hover:decoration-blue-500 transition-all"
              >
                automate as much of the DAO&apos;s System 4 process as possible
                with AI.
              </Link>
            </p>

            <p className="text-md font-medium text-gray-800 leading-relaxed mb-6">
              All news on this site is automatically aggregated and curated by
              feeding scraping relevant sources with a LLM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

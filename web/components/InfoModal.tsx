"use client";

import Link from "next/link";
import { FaTimes, FaDiscord } from "react-icons/fa";
import Image from "next/image";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-cream1 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray2 scrollbar-hide">
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
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Elata Biosciences Logo"
                width={32}
                height={32}
                className="h-8 w-auto object-contain hover:opacity-90 transition-opacity"
              />
              <h2 className="text-3xl font-bold font-montserrat text-offBlack">
                About Elata News
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-gray3 hover:text-offBlack transition-colors duration-200 p-2 hover:bg-gray2/30 rounded-lg"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          <div className="space-y-8">
            <div className="prose-spacing">
              <p className="text-base font-sf-pro text-gray3 leading-relaxed">
                Elata Biosciences is a DAO pioneering an open-source model at the
                intersection of blockchain and neuropsychiatry. Our mission is to
                create a decentralized, distributed, and open ecosystem that
                utilizes blockchain to capitalize drug development efforts in
                high-impact areas across psychiatry.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold font-montserrat text-offBlack mb-4">
                Key Focus Areas
              </h3>
              <ul className="space-y-3">
                {[
                  "Cutting-edge research in neuroscience, psychiatry, and psychology",
                  "Breakthroughs in mental health treatment",
                  "Advances in biohacking and personal optimization",
                  "DeSci and Open Science News",
                  "Innovation in neuroimaging and brain-computer interfaces",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-gray3 font-sf-pro"
                  >
                    <span className="text-elataGreen font-bold text-lg leading-none mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold font-montserrat text-offBlack mb-4">
                Join Our Mission
              </h3>
              <p className="text-gray3 font-sf-pro mb-4 leading-relaxed">
                We&apos;re actively seeking contributors with expertise in:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "Software Engineering",
                  "Computational Neuroscience & Psychiatry",
                  "Pharmaceutical Development",
                  "Raspberry Pi & Arduino Development",
                  "Computer Vision",
                  "Computational Biology",
                  "Precision Medicine",
                  "Cryptography",
                  "Smart Contract Development",
                  "Zero Knowledge Proofs",
                  "UI/UX Design",
                  "Digital Art",
                  "Marketing & Community Management",
                  "Business Development",
                  "Legal & Compliance",
                  "Rust Programming",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-gray3 font-sf-pro text-sm"
                  >
                    <span className="text-elataGreen font-bold leading-none mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold font-montserrat text-offBlack mb-4">
                How Elata News Works
              </h3>

              <div className="space-y-4 text-gray3 font-sf-pro leading-relaxed">
                <p>
                  Elata News implements System 4 of Stafford Beer&apos;s cybernetic
                  framework for organizational management, specifically adapted for
                  Decentralized Autonomous Organizations (DAOs). In Beer&apos;s
                  model, System 4 serves as the &quot;outside and future&quot;
                  sensing organ - monitoring the environment and planning for
                  adaptation.{" "}
                  <Link
                    href="https://kelsienabben.substack.com/p/aligning-the-concept-of-decentralized"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-elataGreen hover:text-offBlack underline decoration-2 decoration-elataGreen/30 hover:decoration-offBlack transition-all font-medium"
                  >
                    This project applies this principle to the DAO&apos;s
                    decision-making process.
                  </Link>
                </p>

                <p>
                  The overall intent of this project is to{" "}
                  <Link
                    href="https://kelsienabben.substack.com/p/governatooorr-guardrails-practical"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-elataGreen hover:text-offBlack underline decoration-2 decoration-elataGreen/30 hover:decoration-offBlack transition-all font-medium"
                  >
                    automate as much of the DAO&apos;s System 4 process as possible
                    with AI.
                  </Link>
                </p>

                <p>
                  All news on this site is automatically aggregated and curated by
                  feeding scraping relevant sources with a LLM.
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-gray2/50">
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-lg mx-auto">
                <Link
                  href="https://discord.gg/4CZ7RCwEvb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-offBlack hover:bg-gray3 text-white px-6 py-3 rounded-none font-medium font-sf-pro transition-all duration-300 hover:shadow-lg transform hover:scale-105 min-w-[200px] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-elataGreen/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <FaDiscord className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="relative z-10">Join Community</span>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-elataGreen group-hover:w-full transition-all duration-300 ease-out" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

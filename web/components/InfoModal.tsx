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
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
              <FaTimes 
                className="text-2xl"
              />
            </button>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg font-medium text-gray-800 leading-relaxed">
              Elata Biosciences is a DAO funding and supporting early-stage R&D
              on novel small-molecule psychiatric medicines. Our stakeholders guide
              research priorities, participate in governance, and contribute to
              advancing mental health treatment.
            </p>

            <div className="my-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-700 mb-2 leading-relaxed">
                Elata News automates system 4 (intelligence gathering from external environment) of{' '}
                <Link
                  href="https://kelsienabben.substack.com/p/aligning-the-concept-of-decentralized"
                  target="_blank"
                  className="text-blue-600 hover:text-blue-800 underline decoration-2 decoration-blue-200 hover:decoration-blue-500 transition-all"
                >
                  Stafford Beer&apos;s Cybernetic Model of Governance
                </Link>
                {' '}as it applies to Elata DAO.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Using GPT-4, we automatically aggregate and curate critical developments across multiple disciplines.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Key Focus Areas</h3>
            <ul className="list-none pl-0 mb-6 grid gap-2">
              {[
                "Cutting-edge research in neuroscience",
                "Breakthroughs in mental health treatment",
                "Advances in biohacking and personal optimization",
                "Developments in computational psychiatry",
                "Innovation in neuroimaging and brain-computer interfaces"
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-gray-700">
                  <span className="text-yellow-500">•</span> {item}
                </li>
              ))}
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Join Our Mission</h3>
            <p className="text-gray-700 mb-3 leading-relaxed">
              We&apos;re actively seeking contributors with expertise in:
            </p>
            <ul className="list-none pl-0 mb-6 grid gap-2">
              {[
                "Software Engineering",
                "Computational Neuroscience & Psychiatry",
                "Pharmaceutical Development",
                "Hardware Development"
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-gray-700">
                  <span className="text-yellow-500">•</span> {item}
                </li>
              ))}
            </ul>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-100">
              <p className="text-gray-800 mb-0 leading-relaxed">
                Our vision is to bootstrap our DAO through open-source contributions in computational neuroscience,
                brain imaging, AI applications in medicine, and modern bioinformatics tools. Post-token launch,
                we&apos;ll channel these capabilities into funding early-stage R&D for innovative psychiatric medicines
                and advancing precision psychiatry.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client'

interface InfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">About Elata News</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="prose prose-lg">
            <p className="text-gray-600 mb-4">
              Elata News is your gateway to the latest developments in neuroscience, mental health technology, and biohacking innovations.
            </p>

            <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
            <p className="text-gray-600 mb-4">
              We aggregate and curate the most important news across multiple disciplines, including:
            </p>
            <ul className="list-disc pl-5 mb-4 text-gray-600">
              <li>Cutting-edge research in neuroscience</li>
              <li>Breakthroughs in mental health treatment</li>
              <li>Advances in biohacking and personal optimization</li>
              <li>Developments in computational psychiatry</li>
              <li>Innovation in neuroimaging and brain-computer interfaces</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 
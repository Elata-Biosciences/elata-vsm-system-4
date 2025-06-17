/**
 * @fileoverview Header Component - Main navigation and branding interface
 * 
 * @description The primary navigation component featuring:
 * - Glass morphism design with backdrop blur effects
 * - Responsive branding with logo and company link
 * - Enhanced call-to-action button with micro-interactions
 * - Sticky positioning for persistent navigation
 * - Accessibility compliance with proper ARIA labels
 * 
 * **Design Features:**
 * - Glass morphism effect with cream1/80 background and backdrop-blur-md
 * - Subtle animations on logo hover (shimmer effect, scale transform)
 * - Enhanced Discord button with gradient overlay and rotating icon
 * - Responsive design adapting to mobile and desktop viewports
 * 
 * **Performance Optimizations:**
 * - Server-side rendering compatible (no client-side state)
 * - Optimized image loading with Next.js Image component
 * - CSS transforms using transform-gpu for hardware acceleration
 * - Efficient hover effects with proper transition timing
 * 
 * @author wkyleg.eth
 * @version 2.0.0
 * @since 2024
 */

import Link from "next/link";
import Image from "next/image";
import { FaDiscord } from "react-icons/fa";

/**
 * Header Component - Sticky navigation with branding and community access
 * 
 * @description The main header component that provides:
 * 
 * **Branding Section:**
 * - Elata logotype with hover animations (shimmer effect, subtle scaling)
 * - External link to main company website (elata.bio)
 * - Proper SEO attributes and accessibility labels
 * 
 * **Call-to-Action Section:**
 * - Discord community button with enhanced interactions
 * - Gradient overlay effect on hover (elataGreen accent)
 * - Rotating Discord icon animation (12° rotation)
 * - Animated underline that grows from left to right
 * 
 * **Layout & Styling:**
 * - Sticky positioning (top-0 z-50) for persistent navigation
 * - Glass morphism design with backdrop blur and transparency
 * - Responsive padding and spacing for mobile/desktop
 * - Shadow and border effects for visual depth
 * 
 * **Accessibility Features:**
 * - Proper ARIA labels for screen readers
 * - Semantic HTML structure with header element
 * - Keyboard navigation support
 * - High contrast ratios for text readability
 * 
 * @returns {JSX.Element} Rendered header component
 * 
 * @example
 * ```typescript
 * // Used in layout.tsx or page components
 * <Header />
 * ```
 */
export default function Header(): JSX.Element {
  return (
    <header className="sticky top-0 z-50 bg-cream1/80 backdrop-blur-md text-offBlack px-4 py-4 sm:p-4 flex justify-between items-center shadow-lg border-b border-gray2/30 animate-fadeInUp">
      <Link
        href="https://elata.bio"
        className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-all duration-300 ease-out group"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Visit Elata's main website"
        title="Visit Elata.bio - Advancing Mental Health Research"
      >
        <div className="relative overflow-hidden rounded-lg">
          <Image
            src="/logotype.png"
            alt="Elata Biosciences Logo"
            width={120}
            height={32}
            className="h-6 sm:h-8 w-auto transition-all duration-300 ease-out group-hover:scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
        </div>
      </Link>

      {/* Join Community Button */}
      <Link
        href="https://discord.gg/VmkH5JfxMC"
        className="group relative inline-flex items-center gap-3 bg-offBlack hover:bg-gray3 text-white px-6 py-3 rounded-none font-medium font-sf-pro transition-all duration-300 ease-out hover:scale-105 transform-gpu shadow-md overflow-hidden"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join Elata's Discord Community"
        title="Join our active community on Discord"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-elataGreen/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <FaDiscord className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform duration-300" aria-hidden="true" />
        <span className="relative z-10">Join Community</span>
        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-elataGreen group-hover:w-full transition-all duration-300 ease-out" />
      </Link>
    </header>
  );
}

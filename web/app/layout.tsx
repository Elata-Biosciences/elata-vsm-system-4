/**
 * @fileoverview Root Layout Component - Next.js 13+ App Router Layout
 * 
 * @description The root layout component that wraps all pages in the application.
 * This component is responsible for:
 * - HTML document structure and metadata configuration
 * - Global font loading and CSS imports
 * - SEO optimization with structured metadata
 * - Viewport configuration for responsive design
 * - Analytics and tracking integration
 * 
 * **Next.js 13+ Features:**
 * - App Router layout system with nested layouts support
 * - Server Components by default for optimal performance
 * - Metadata API for SEO and social sharing optimization
 * - Font optimization with next/font integration
 * 
 * **Performance Considerations:**
 * - Preloaded fonts with display: swap for better loading experience
 * - Optimized metadata for search engines and social platforms
 * - Proper viewport configuration for mobile devices
 * - Minimal JavaScript bundle size with server components
 * 
 * @author wkyleg.eth
 * @version 2.0.0
 * @since 2024
 */

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

/**
 * Geist Sans font configuration
 * 
 * @description Loads the Geist Sans variable font with:
 * - Full weight range (100-900) for typography flexibility
 * - CSS variable (--font-geist-sans) for global access
 * - Optimized loading with Next.js font optimization
 * 
 * @see https://vercel.com/font/sans
 */
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

/**
 * Geist Mono font configuration
 * 
 * @description Loads the Geist Mono variable font for:
 * - Code snippets and technical content
 * - Monospace typography needs
 * - Consistent character spacing
 * 
 * @see https://vercel.com/font/mono
 */
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

/**
 * Viewport configuration for responsive design
 * 
 * @description Sets optimal viewport settings for:
 * - Mobile-first responsive design
 * - Prevents unwanted zooming on mobile devices
 * - Ensures consistent rendering across devices
 */
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

/**
 * Application metadata configuration
 * 
 * @description Comprehensive metadata setup for:
 * - SEO optimization with title, description, and keywords
 * - Social media sharing (Open Graph, Twitter Cards)
 * - Search engine directives and indexing preferences
 * - Mobile app integration and PWA support
 * - Brand consistency across platforms
 * 
 * **SEO Features:**
 * - Dynamic title template for consistent branding
 * - Rich descriptions optimized for search results
 * - Proper canonical URLs and alternate languages
 * - Structured data integration ready
 * 
 * **Social Sharing:**
 * - Open Graph tags for Facebook, LinkedIn sharing
 * - Twitter Card optimization for Twitter sharing
 * - High-quality preview images and descriptions
 * 
 * @type {Metadata}
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://news.elata.bio"),
  title: "Elata News",
  description: "Latest news and updates from Elata Biosciences",
  keywords: [
    "DeSci",
    "Neuroscience",
    "Computational Psychiatry",
    "Decentralized Science",
    "Biosciences",
    "Research",
    "Science",
    "Biology",
    "Mental Health",
    "Healthcare Innovation",
  ],
  openGraph: {
    title: "Elata Biosciences News",
    description: "Latest news and updates from Elata Biosciences",
    url: "https://news.elata.bio",
    siteName: "Elata Biosciences News",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Elata Biosciences Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elata Biosciences News",
    description: "Latest news and updates from Elata Biosciences",
    images: ["/logo.png"],
    creator: "@Elata_Bio", // Adding Twitter handle
    site: "@Elata_Bio",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://news.elata.bio",
  },
  authors: [{ name: "Elata Biosciences" }],
  category: "Science",
  creator: "Elata Biosciences",
  publisher: "Elata Biosciences",
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
};

/**
 * Root Layout Component
 * 
 * @description The root layout component that wraps all pages in the Next.js 13+ app.
 * This component establishes the fundamental HTML structure and global configurations:
 * 
 * **HTML Structure:**
 * - Sets the document language to English for accessibility
 * - Applies font variables to the body element for global typography
 * - Includes antialiased class for improved font rendering
 * 
 * **Global Integrations:**
 * - Vercel Analytics for performance and usage tracking
 * - Font loading with CSS variables for consistent typography
 * - Global CSS imports for styling foundation
 * 
 * **Performance Features:**
 * - Server-side rendering by default (no 'use client' directive)
 * - Optimized font loading with variable fonts
 * - Minimal JavaScript bundle for layout component
 * 
 * **Accessibility:**
 * - Proper lang attribute for screen readers
 * - Semantic HTML structure
 * - Font antialiasing for better readability
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} Root HTML structure with layout
 * 
 * @example
 * ```typescript
 * // This component is automatically used by Next.js App Router
 * // It wraps all pages in the application
 * ```
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Vercel Analytics for performance monitoring and user insights */}
        <Analytics />
        
        {/* Main application content - all pages render here */}
        {children}
      </body>
    </html>
  );
}

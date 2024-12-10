import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

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
        url: "/logo.jpeg",
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
    images: ["/logo.jpeg"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Analytics />
        {children}
      </body>
    </html>
  );
}

import { ErrorBoundary } from "@/components/ErrorBoundary";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import NewsCategories from "@/components/NewsCategories";
import { loadCurrentData } from "@/lib/data";
import type { Metadata } from "next";

// Make rendering of whole pages cached and update every 5 minutes
export const revalidate = 300;

export const dynamic = "force-static";  

// Add metadata for better SEO
export const metadata: Metadata = {
  title: "Elata Biosciences News",
  description:
    "Latest news and updates in neuroscience, mental health research, biohacking, and computational psychiatry from Elata Biosciences.",
    openGraph: {
      title: "Elata Biosciences News | Neuroscience & Mental Health Updates",
      description:
        "Latest news and updates in neuroscience, mental health research, biohacking, and computational psychiatry from Elata Biosciences.",
      url: "https://news.elata.bio",
      siteName: "Elata Biosciences News",
      images: [
        {
          url: "/og-image.jpg", // Make sure to add this image to your public folder
          width: 1200,
          height: 630,
          alt: "Elata Biosciences News",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    keywords:
      "neuroscience, mental health, biohacking, computational psychiatry, research news",

    twitter: {
      card: "summary_large_image",
      title: "Elata Biosciences News",
      description:
        "Latest news and updates in neuroscience, mental health research, biohacking, and computational psychiatry.",
      creator: "@Elata_Bio",
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
};

export default async function Home() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-neural-pattern">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <AsyncNewsContent />
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

async function AsyncNewsContent() {
  try {
    const data = await loadCurrentData();

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Elata Biosciences News",
      url: "https://news.elata.bio",
      description:
        "Latest news and updates in neuroscience, mental health research, biohacking, and computational psychiatry",
      publisher: {
        "@type": "Organization",
        name: "Elata Biosciences",
        url: "https://elata.bio",
        logo: {
          "@type": "ImageObject",
          url: "https://news.elata.bio/logo.jpeg"
        }
      },
      inLanguage: "en",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://news.elata.bio?category={search_term}",
        "query-input": "required name=search_term",
      },
      sameAs: [
        "https://discord.gg/4CZ7RCwEvb",
        "https://github.com/Elata-Biosciences",
        "https://www.linkedin.com/company/elata-biosciences",
        "https://x.com/Elata_Bio",
        "https://www.reddit.com/r/elata/",
        "https://t.me/Elata_Biosciences"
      ],
      dateModified: new Date().toISOString(),
    };

    return (
      <>
        <JsonLd data={jsonLd} />
        <NewsCategories initialData={data} />
      </>
    );
  } catch {
    return (
      <div className="text-red-500">
        Failed to load data. Please try again later.
      </div>
    );
  }
}

import { ErrorBoundary } from "@/components/ErrorBoundary";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import NewsCategories from "@/components/NewsCategories";
import { loadCurrentData } from "@/lib/data";

// Make rendering of whole pages cached and update every 5 minutes
export const revalidate = 300;

export const dynamic = "force-static";

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
          url: "https://news.elata.bio/logo.jpeg",
        },
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
        "https://t.me/Elata_Biosciences",
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

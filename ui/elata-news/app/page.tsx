import { ErrorBoundary } from "@/components/ErrorBoundary";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import NewsCategories from "@/components/NewsCategories";
import { loadCurrentData } from "@/lib/data";


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
      "name": "Elata Biosciences News",
      "url": "https://news.elata.bio",
      "description": "Latest news and updates in neuroscience, mental health research, biohacking, and computational psychiatry",
      "publisher": {
        "@type": "Organization",
        "name": "Elata Biosciences",
        "url": "https://elata.bio"
      },
      "inLanguage": "en",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://news.elata.bio?category={search_term}",
        "query-input": "required name=search_term"
      },
      "sameAs": [
        "https://discord.gg/4CZ7RCwEvb" // Assuming this is your Discord link based on the FaDiscord import
      ]
    }

    return (
      <>
        <JsonLd data={jsonLd} />
        <NewsCategories initialData={data.summary} />
      </>
    );
  } catch  {
    return (
      <div className="text-red-500">
        Failed to load data. Please try again later.
      </div>
    );
  }
}

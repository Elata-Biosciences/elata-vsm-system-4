import { ErrorBoundary } from "@/components/ErrorBoundary";
import Header from "@/components/Header";
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
    return <NewsCategories initialData={data.summary} />;
  } catch  {
    return (
      <div className="text-red-500">
        Failed to load data. Please try again later.
      </div>
    );
  }
}

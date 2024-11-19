import Header from "@/components/Header";
import NewsCategories from "@/components/NewsCategories";
import { loadCurrentData } from "@/lib/data";

export default async function Home() {
  const data = await loadCurrentData();

  return (
    <div className="min-h-screen flex flex-col bg-neural-pattern">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <NewsCategories initialData={data.summary} />
        </div>
      </main>
    </div>
  );
}

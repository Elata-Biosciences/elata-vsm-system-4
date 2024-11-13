import { promises as fs } from 'fs'
import path from 'path'
import Header from '@/components/Header'
import NewsCategories from '@/components/NewsCategories'
import type { NewsData } from '@/lib/types'

async function getData(): Promise<NewsData> {
  const jsonDirectory = path.join(process.cwd(), 'data')
  const fileContents = await fs.readFile(jsonDirectory + '/news-data.json', 'utf8')
  const data = JSON.parse(fileContents) as NewsData
  
  // Transform data to match expected format
  return data
}

export default async function Home() {
  const data = await getData()

  return (
    <div className="min-h-screen flex flex-col bg-neural-pattern">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <NewsCategories initialData={data.summary} />
        </div>
      </main>
    </div>
  )
}
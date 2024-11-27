import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://news.elata.bio',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]
} 
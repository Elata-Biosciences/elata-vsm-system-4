export interface Article {
  title: string
  description: string
  url: string
  name: string
  author: string
}

export interface NewsData {
  date: string
  summary: {
    research: Article[]
    industry: Article[]
    biohacking: Article[]
    computational: Article[]
    hardware: Article[]
    desci: Article[]
    offTopic: Article[]
  }
  timestamp: string
}

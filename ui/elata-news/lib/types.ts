export interface NewsItem {
  title: string;
  author: string;
  date: string;
  url: string;
  source: string;
}

export interface NewsData {
  categories: {
    [key: string]: NewsItem[];
  };
}

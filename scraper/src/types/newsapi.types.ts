export type Story = {
  title: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
  description: string;
  author: string;
};

export type NewsAPIResponse = {
  status: string;
  totalResults: number;
  articles: Story[];
};

# Elata News Platform

A Next.js-powered news aggregation platform for Elata Biosciences, focusing on neuroscience, mental health research, and computational psychiatry.

You may view the live platform at [news.elata.bio](https://news.elata.bio).

## Overview

This platform automatically aggregates and categorizes news from various sources into key areas:
- Research News
- Industry News
- Biohacking Mental Health
- Computational & Precision Psychiatry
- Hardware, Neuroimaging, BCIs
- DeSci, DAOs, Crypto
- Off Topic Curiosities

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Data Fetching**: Server-side with ISR (Incremental Static Regeneration)
- **Deployment**: [Vercel](https://vercel.com)

## Development Setup

1. Install dependencies:

```bash
npm install
```

2. Run the scraper in the sibling `scraper` directory to fetch the latest news data

```bash
cd ../scraper
npm run build
npm run start
```

3. Run the server in the `scrapper` directory to serve the json dump for this page

```bash
npm run serve
```

4. Run the Next.js development server, which will proxy the API requests to the scraper server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the platform.


## Project Structure

```
web/
├── app/               # Next.js App Router pages
├── components/        # React components
├── lib/               # Utility functions and data fetching
├── public/            # Static assets
└── styles/            # Global styles and Tailwind config
```

## Key Features

- **Static Generation**: Pages are statically generated with hourly revalidation
- **Category Filtering**: News items can be filtered by category
- **SEO Optimization**: Includes metadata, JSON-LD, and OpenGraph tags
- **Responsive Design**: Mobile-first approach using Tailwind CSS
- **Share Functionality**: Articles can be shared via URL or social media

## Deployment

The project is configured for deployment on Vercel:

1. Push to main branch
2. Vercel automatically builds and deploys
3. Static pages are generated at build time
4. ISR handles data revalidation every hour

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

Please ensure your PR:
- Follows the existing code style
- Includes appropriate tests
- Updates documentation as needed

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Elata Biosciences](https://elata.bio)

## Support

Join our [Discord community](https://discord.gg/4CZ7RCwEvb) for support and discussions.

import type { ScrapingOutput } from "@elata/shared-types";
import { processPageWithGPT } from "../lib/gptProcessor.js";
import { wait } from "../lib/utils.js";
import { CONFIG } from "./config.js";

/**
 * The limit per query for Reddit.
 */
const LIMIT_PER_QUERY = 10;

const REDDIT_USER_AGENT = "ElataNews (by /u/wkyleg)";

/**
 * The subreddits to scrape for.
 */
const SUBREDDITS = [
  "Biohackers",
  "Nootropics",
  "Longevity",
  "Transhumanism",
  "medicalschool",
  "Residency",
  "neurology",
  "Psycology",
  "PTSD",
  "ethereum",
  "solidity",
  "solana",
  "askpsychology",
  "AskPsychiatry",
  "mentalhealth",
  "ptsdrecovery",
  "Antipsychiatry",
  "PTSDCombat",
  "medicine",
  "Meditation",
  "Peptides_for_Women",
  "redlighttherapy",
  "BCI",
  "BrainTraining",
  "BrainFog",
  "NootropicsDiscussions",
  "Biohacking",
  "biohackingscience",
  "Supplements",
  "Psychiatry",
  "psychologystudents",
  "StudentNurse",
  "Nurse",
  "nursepractitioner",
  "SSRIs",
  "ADHD",
  "DrugNerds",
  "researchchemicals",
  "Peptides",
  "raypeat",
  "NutritionalPsychiatry",
  "MachineLearning",
  "DeSci",
  "bioinformatics",
  "pharmacy",
  "pharmaindustry",
  "pharma",
  "Ayurveda",
  "AyurvedaTreatments",
  "researchchemicals",
] as const;

/**
 * The filters to use for each subreddit.
 */
const SUBREDDIT_FILTERS = ["top", "new", "hot"] as const;

/**
 * The URL for a Reddit query.
 */
type RedditQueryUrl =
  `https://www.reddit.com/r/${(typeof SUBREDDITS)[number]}/${(typeof SUBREDDIT_FILTERS)[number]}.json?limit=${number}`;

/**
 * The name of a Reddit source.
 */
type RedditSourceName = `r/${(typeof SUBREDDITS)[number]}`;

/**
 * Get a Reddit query URL.
 * @param subreddit - The subreddit to scrape.
 * @param filter - The filter to use.
 * @returns The Reddit query URL.
 */
const getRedditQueryUrl = (
  subreddit: (typeof SUBREDDITS)[number],
  filter: (typeof SUBREDDIT_FILTERS)[number]
): RedditQueryUrl =>
  `https://www.reddit.com/r/${subreddit}/${filter}.json?limit=${LIMIT_PER_QUERY}`;

/**
 * Get a Reddit scraping source.
 * @param subreddit - The subreddit to scrape.
 * @param filter - The filter to use.
 * @returns The Reddit scraping source.
 */
const getRedditScrapingSource = (
  subreddit: (typeof SUBREDDITS)[number],
  filter: (typeof SUBREDDIT_FILTERS)[number]
): { url: RedditQueryUrl; name: RedditSourceName } => {
  return {
    url: getRedditQueryUrl(subreddit, filter),
    name: `r/${subreddit}`,
  };
};

/**
 * The sources to scrape for from Reddit
 */
const REDDIT_SOURCES = SUBREDDITS.flatMap((subreddit) =>
  SUBREDDIT_FILTERS.map((filter) => getRedditScrapingSource(subreddit, filter))
);

/**
 * Load Reddit posts from the API.
 * @returns The Reddit posts.
 */
export const loadRedditPosts = async () => {
  const results: ScrapingOutput[] = [];
  for (const source of REDDIT_SOURCES) {
    try {
      const response = await fetch(source.url, {
        headers: {
          "User-Agent": REDDIT_USER_AGENT,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      const processedData = await processPageWithGPT(
        JSON.stringify(data),
        source.url,
        source.name
      );

      results.push(processedData);
    } catch (error) {
      console.error(`Error fetching data from ${source.url}:`, error);
    } finally {
      // Wait for 1.5 times the delay between sources to Reddit doesn't rate limit us
      await wait(CONFIG.SCRAPPING.DELAY_BETWEEN_SOURCES * 1.5);
    }
  }

  return results;
};

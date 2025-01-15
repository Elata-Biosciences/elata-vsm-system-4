import dotenv from "dotenv";
dotenv.config();

export const CONFIG = {
  DISCORD: {
    TOKEN: String(process.env.DISCORD_TOKEN) || "",
    NEWS_FEED_CHANNEL_ID: String(process.env.NEWS_FEED_CHANNEL_ID) || "",
    ARTICLES_PER_CATEGORY: Number(process.env.DISCORD_ARTICLES_PER_CATEGORY) || 5,
  },
  TWITTER: {
    TOKEN: String(process.env.TWITTER_TOKEN) || "",
    DELAY_BETWEEN_REQUESTS:
      Number(process.env.TWITTER_DELAY_BETWEEN_REQUESTS) || 100_000,
  },
  NEWS_API: {
    KEY: String(process.env.NEWS_API_KEY) || "",
  },
  OPENAI: {
    KEY: String(process.env.OPENAI_KEY) || "",
    ORGANIZATION: String(process.env.OPENAI_ORGANIZATION) || "",
    PROJECT: String(process.env.OPENAI_PROJECT) || "",
  },
  SCRAPPING: {
    MODEL:
      process.env.SCRAPPING_MODEL && process.env.SCRAPPING_MODEL !== ""
        ? String(process.env.SCRAPPING_MODEL)
        : "gpt-4o-mini",
    DELAY_BETWEEN_SOURCES:
      Number(process.env.SCRAPPING_DELAY_BETWEEN_SOURCES) || 2_000, // Default 2 seconds delay between sources
    SOURCE_TIMEOUT_SECONDS:
      Number(process.env.SCRAPPING_SOURCE_TIMEOUT) || 60_000, // Default 1 minute timeout per source
    IDLE_TIMEOUT_SECONDS: Number(process.env.SCRAPPING_IDLE_TIMEOUT) || 30_000, // Default 30 seconds timeout for idle browser
    SHUTOFF_TIMEOUT_LENGTH_MILLISECONDS:
      Number(process.env.SCRAPPING_SHUTOFF_TIMEOUT) || 60_000, // Default 60 seconds timeout for shutting off browser
  },
  SUMMARIZATION: {
    MODEL: String(process.env.SUMMARIZATION_MODEL) || "gpt-4o",
    ARTICLES_PER_CATEGORY: Number(process.env.ARTICLES_PER_CATEGORY) || 16,
  },
  SERVER: {
    PORT: Number(process.env.SERVER_PORT) || 2_345,
  },
  NEXT: {
    PORT: Number(process.env.NEXT_PORT) || 3_000,
  },
} as const;

// Warn if config is not set correctly
Object.entries(CONFIG).map(([key, value]) => {
  // If any nested leaf is not a string or a number print a warning
  if (typeof value !== "string" && typeof value !== "number") {
    // Check if there's a second layer nested object
    if (typeof value === "object" && value !== null) {
      Object.entries(value).map(([subKey, subValue]) => {
        if (typeof subValue !== "string" && typeof subValue !== "number") {
          console.warn(`${subKey} is not set correctly in ${key}`);
        }
        if (subValue === "") {
          console.warn(`${subKey} is not set correctly in ${key}`);
        }
      });
    } else {
      console.warn(`Invalid key in config: ${key}`);
    }
  } else if (typeof value === "string" && value === "") {
    // If it's a string, make sure that the value is not an empty string
    console.warn(`${key} is not set correctly in config`);
  }
});

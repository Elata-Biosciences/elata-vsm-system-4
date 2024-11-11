import dotenv from 'dotenv';
dotenv.config();

export const config = {
  discord: {
    token: process.env.DISCORD_TOKEN || "",
    newsFeedChannelId: process.env.NEWS_FEED_CHANNEL_ID || "",
  },
  newsApi: {
    key: process.env.NEWS_API_KEY || "",
  },
  openai: {
    key: process.env.OPENAI_KEY,
    organization: process.env.OPENAI_ORGANIZATION || "",
    project: process.env.OPENAI_PROJECT || "",
    model: process.env.OPENAI_MODEL || "gpt-4-mini",
  },
}; 
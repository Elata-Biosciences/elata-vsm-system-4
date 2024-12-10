import OpenAI from "openai";
import { CONFIG } from "../config/config.js";

export const openAIClient = new OpenAI({
  apiKey: CONFIG.OPENAI.KEY,
  organization: CONFIG.OPENAI.ORGANIZATION,
  project: CONFIG.OPENAI.PROJECT,
});

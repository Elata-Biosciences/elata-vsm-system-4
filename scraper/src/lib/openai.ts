import OpenAI from "openai";
import { config } from "../config/config.js";

export const openAIClient = new OpenAI({
  apiKey: config.openai.key,
  organization: config.openai.organization,
  project: config.openai.project,
});

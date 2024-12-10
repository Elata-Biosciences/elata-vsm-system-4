import { openAIClient } from "./openai.js";
import { ELATA_SCRAPPING_TASK_PROMPT } from "../config/prompt.js";
import type { ScrapingOutput } from "@elata/shared-types";
import { ScrapingOutputSchema } from "@elata/shared-types";
import { zodResponseFormat } from "openai/helpers/zod.js";
import { CONFIG } from "../config/config.js";

/**
 * Processes the content from a source and returns a CSV of the most relevant articles.
 * @param {string} content - The content to process
 * @param {string} sourceUrl - The URL of the source
 * @param {string} sourceName - The name of the source
 * @returns {Promise<ScrapingOutput>} - The processed content
 */
export async function processPageWithGPT(
  content: string,
  sourceUrl: string,
  sourceName: string
): Promise<ScrapingOutput> {
  console.log(`Extracting articles from ${sourceUrl}`);
  try {
    const userPrompt = `
    Content from ${sourceName} (${sourceUrl}):
    
    ${content}
    `;

    console.log("User prompt:");
    console.log(userPrompt);

    const response = await openAIClient.chat.completions.create({
      model: CONFIG.SCRAPPING.MODEL,
      messages: [
        {
          role: "system",
          content: ELATA_SCRAPPING_TASK_PROMPT,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: zodResponseFormat(
        ScrapingOutputSchema,
        "ScrapingOutput"
      ),
    });

    console.log(response.choices[0].message.content);

    const messageContent = response.choices[0].message.content;
    console.log(messageContent);

    // Parse the JSON string into an object before passing to Zod
    const parsedContent =
      typeof messageContent === "string"
        ? JSON.parse(messageContent)
        : messageContent;

    return ScrapingOutputSchema.parse(parsedContent);
  } catch (error) {
    console.error("GPT processing error:", error);
    return {
      sourceUrl,
      sourceName,
      articles: [],
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

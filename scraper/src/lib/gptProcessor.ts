import { openAIClient } from "./openai.js";
import { ELATA_SCRAPPING_TASK_PROMPT } from "../config/prompt.js";
import { config } from "../config/config.js";

export type GPTProcessingResult = {
  sourceUrl: string;
  sourceName: string;
  analysis: string;
  timestamp: string;
};

/**
 * Processes the content from a source and returns a CSV of the most relevant articles.
 * @param {string} content - The content to process
 * @param {string} sourceUrl - The URL of the source
 * @param {string} sourceName - The name of the source
 * @returns {Promise<{sourceUrl: string, sourceName: string, analysis: string, timestamp: string}>} - The processed content
 */
export async function processPageWithGPT(
  content: string,
  sourceUrl: string,
  sourceName: string
): Promise<GPTProcessingResult> {
  console.log(`Extracting articles from ${sourceUrl}`);
  try {
    const response = await openAIClient.chat.completions.create({
      model: config.openai.model,
      messages: [
        {
          role: "system",
          content: `${ELATA_SCRAPPING_TASK_PROMPT}\n\nContent from ${sourceName} (${sourceUrl}):\n\n${content}`,
        },
      ],
    });

    console.log(response.choices[0].message.content);

    return {
      sourceUrl,
      sourceName,
      analysis: response.choices[0].message.content ?? "",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("GPT processing error:", error);
    return {
      sourceUrl,
      sourceName,
      analysis: "",
      timestamp: new Date().toISOString(),
    };
  }
}

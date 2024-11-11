import { Client, GatewayIntentBits, TextChannel } from "discord.js";
import { STOP_DELIMITER } from "../config/prompt.js";


export const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds],
});

/**
 * Sends the summary to the Discord channel
 * @param {Channel} channel - The Discord channel to send the summary to
 * @param {string} summary - The summary to send
 * @returns {Promise<void>}
 */
export const postSummaryToDiscord = async (
  channel: TextChannel,
  summary: string
): Promise<void> => {
  const summaries = summary.split(STOP_DELIMITER);
  console.log(`Sending ${summaries.length} summaries to Discord...`);
  channel.send("Here are the top stories from the past 24 hours:");
  summaries.map((s) => {
    try {
      if (s) channel.send(s);
    } catch (error) {
      console.error("Error sending summary", error);
    }
  });
};

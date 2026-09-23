import { ActivityType } from "discord.js";
import type { BotEvent } from "../types";
import config from "../config";
import logger from "../function/logger";

const event: BotEvent<"clientReady"> = async (client, readyClient) => {
    readyClient.user.setActivity({
        name: "/ping | check bot latency",
        type: ActivityType.Playing,
    });
    logger.success(`${readyClient.user.tag} is Ready!`);
    if (!config.pushcommand) return;

    await readyClient.application.fetch();
    if (config.pushGlobal) {
        logger.debug("Pushing Global Commands...");
        await readyClient.application.commands.set(client.commandsArray);
        logger.success("Global commands pushed successfully");
    } else {
        for (const guildId of config.guildPushCommand) {
            try {
                const guild = await client.guilds.fetch(guildId);
                await guild.commands.set(client.commandsArray);
                logger.debug(`Pushed commands to Guild "${guild.name}" "${guild.id}"`);
            } catch (error) {
                logger.warning(`Can't push commands to Guild "${guildId}": ${String(error)}`);
            }
        }
    }
};

export = event;

const { ActivityType } = require("discord.js");

const config = require("../config");
const logger = require("../function/logger");

/**
 * @param {import("discord.js").Client} client
 */
module.exports = (client) => {
    client.user.setActivity({
        name: "/ping | check bot latency",
        type: ActivityType.Playing,
    });

    logger.success(`${client.user.tag} is Ready!`);

    if (!config.pushcommand) return;
    (async () => {
        await client.application.fetch();
        if (config.pushGlobal) {
            logger.debug("Pushing Global Commands...");
            await client.application.commands.set(client.commandsArray);
            logger.success("Global commands pushed successfully");
        } else {
            for (const guildId of config.guildPushCommand) {
                try {
                    const guild = await client.guilds.fetch(guildId);
                    await guild.commands.set(client.commandsArray);
                    logger.debug(`Pushed commands to Guild "${guild.name}" "${guild.id}"`);
                } catch {
                    logger.warning(`Can't push commands to Guild "${guildId}"`);
                }
            }
        }
    })();
};
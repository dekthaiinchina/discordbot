const { InteractionType, MessageFlags } = require("discord.js");

const logger = require("../function/logger");

/**
 * @param {import("discord.js").Client} client
 * @param {import("discord.js").Interaction} interaction
 */
module.exports = async (client, interaction) => {
    if (interaction.type !== InteractionType.ApplicationCommand) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
        return interaction.reply({
            content: "This command was not found",
            flags: MessageFlags.Ephemeral,
        });
    }

    logger.debug(`${interaction.user.tag} (${interaction.user.id}) > /${interaction.commandName}`);

    try {
        await command.run(client, interaction);
    } catch (error) {
        logger.error(error);

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: "An error occurred while running the command",
                flags: MessageFlags.Ephemeral,
            });
        } else {
            await interaction.reply({
                content: "An error occurred while running the command",
                flags: MessageFlags.Ephemeral,
            });
        }
    }
};
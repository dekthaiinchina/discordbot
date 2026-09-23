import type { Command } from "../../types";
import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from "discord.js";

import loadCommands from "../../handlers/command";
import config from "../../config";

const command: Command = {
    data: new SlashCommandBuilder()
        .setName("reload")
        .setDescription("Reloads all commands in the bot | รีโหลดทุกคำสั่ง")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async run(client, interaction) {
        const developerId = config.developerId || "";

        if (interaction.user.id !== developerId) {
            return interaction.reply({
                content: "You are not the developer! | คุณไม่ใช่ผู้พัฒนาบอท",
                flags: MessageFlags.Ephemeral,
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const { loaded: reloadedCount, errors } = loadCommands(client, true);

        const embed = new EmbedBuilder()
            .setTitle("Reload All Completed")
            .setColor(errors.length ? 0xFEE75C : 0x57F287)
            .setDescription(errors.length
                ? "Reload failed; the previous commands remain active."
                : `Successfully reloaded **${reloadedCount}** commands.`)
            .setTimestamp();

        if (errors.length) {
            embed.addFields({
                name: "Errors",
                value: `\`\`\`${errors.slice(0, 5).join("\n")}\`\`\``,
            });
        }
        await interaction.editReply({ embeds: [embed] });
    },
};
export = command;

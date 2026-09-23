import type { Command } from "../../types";
import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder } from "discord.js";

const command: Command = {
    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Delete messages in a channel | ลบข้อความในช่องแชท")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("Number of messages to delete (1-100) | จำนวนข้อความที่จะลบ (1-100)")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async run(client, interaction) {
        const amount = interaction.options.getInteger("amount", true);
        const channel = interaction.channel;
        if (!interaction.inGuild() || !channel || !("bulkDelete" in channel)) {
            return interaction.reply({
                content: "This command requires a server channel that supports bulk deletion",
                flags: MessageFlags.Ephemeral,
            });
        }
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({
                content: "You do not have permission to use this command",
                flags: MessageFlags.Ephemeral,
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        try {
            const messages = await channel.bulkDelete(amount, true);
            const embed = new EmbedBuilder()
                .setColor(0x2ecc71)
                .setTitle("Purge Complete")
                .addFields(
                    {
                        name: "Deleted Messages",
                        value: `${messages.size}`,
                        inline: true,
                    },
                    {
                        name: "Moderator",
                        value: `${interaction.user.tag}`,
                        inline: true,
                    }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            await interaction.editReply({
                content: "The message cannot be deleted (the message may be older than 14 days)",
            });
        }
    },
};
export = command;

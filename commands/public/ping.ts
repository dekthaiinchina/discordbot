import type { Command } from "../../types";
import { SlashCommandBuilder, MessageFlags, EmbedBuilder } from "discord.js";

const command: Command = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Check Bot latency | เช็คความหน่วงบอท"),

    async run(client, interaction) {

        const ping = calTimeSnowflake(interaction.id);
        const apiPing = Math.round(client.ws.ping);

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle("Bot latency!")
            .setDescription("Latency information")
            .addFields(
                {
                    name: "Interaction",
                    value: `${ping}ms`,
                    inline: true
                },
                {
                    name: "WebSocket",
                    value: `${apiPing}ms`,
                    inline: true
                }
            )
            .setFooter({
                text: interaction.client.user.username,
                iconURL: interaction.client.user.displayAvatarURL(),
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral,
        });
    },
};

function calTimeSnowflake(snowflake: string): number {
    const milliseconds = BigInt(snowflake) >> 22n;
    return Math.abs(Date.now() - (Number(milliseconds) + 1420070400000));
}
export = command;

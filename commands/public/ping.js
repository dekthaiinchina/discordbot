const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Check Bot latency | เช็คความหน่วงบอท"),

    /**
     * @param {import("discord.js").Client} client
     * @param {import("discord.js").Interaction} interaction
     */
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
                text: client.user.username,
                iconURL: client.user.displayAvatarURL(),
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral,
        });
    },
};

function calTimeSnowflake(snowflake) {
    const milliseconds = BigInt(snowflake) >> 22n;
    return Math.abs(Date.now() - (Number(milliseconds) + 1420070400000));
}
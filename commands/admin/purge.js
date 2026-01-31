const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder } = require("discord.js");

module.exports = {
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

    /**
     * @param {import("discord.js").Client} client
     * @param {import("discord.js").Interaction} interaction
     */
    async run(client, interaction) {
        const amount = interaction.options.getInteger("amount");
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({
                content: "You do not have permission to use this command",
                flags: MessageFlags.Ephemeral,
            });
        }

        try {
            const messages = await interaction.channel.bulkDelete(amount, true);
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

            await interaction.reply({
                embeds: [embed],
                flags: MessageFlags.Ephemeral,
            });
        } catch (error) {
            await interaction.reply({
                content: "The message cannot be deleted (the message may be older than 14 days)",
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
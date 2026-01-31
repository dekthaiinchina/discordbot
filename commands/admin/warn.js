const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Issue a warning to a user | แจ้งเตือนผู้ทำผิด")
        .addUserOption(option =>
            option
                .setName("target")
                .setDescription("The user to warn | แจ้งเตือนผู้ใช้")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("The reason for the warning | ระบุเหตุผลของการแจ้งเตือน")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    /**
     * @param {import("discord.js").Client} client
     * @param {import("discord.js").ChatInputCommandInteraction} interaction
     */
    async run(client, interaction) {
        const targetUser = interaction.options.getUser("target", true);
        const reason = interaction.options.getString("reason") ?? "No reason provided | ไม่ระบุเหตุผล";
        
        if (targetUser.id === client.user.id) {
            return interaction.reply({
                content: "I cannot warn myself!",
                flags: MessageFlags.Ephemeral,
            });
        }

        if (targetUser.id === interaction.user.id) {
            return interaction.reply({
                content: "You cannot warn yourself!",
                flags: MessageFlags.Ephemeral,
            });
        }

        const warnEmbed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle("Official Guild Warning")
            .setDescription(`You have received a warning in **${interaction.guild.name}**`)
            .addFields(
                {
                    name: "Reason",
                    value: reason
                },
                {
                    name: "Moderator",
                    value: interaction.user.tag
                }
            )
            .setFooter({
                text: client.user.username,
                iconURL: client.user.displayAvatarURL(),
            })
            .setTimestamp();

        let dmStatus = "DM sent successfully";

        try {
            await targetUser.send({
                embeds: [warnEmbed],
            });
        } catch {
            dmStatus = "Could not DM (User has DMs disabled)";
        }

        const successEmbed = new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle("Warning Issued | แจ้งเตือนสำเร็จ")
            .addFields(
                {
                    name: "Target",
                    value: targetUser.tag,
                    inline: true
                },
                {
                    name: "Reason",
                    value: reason,
                    inline: true
                },
                {
                    name: "DM Status",
                    value: dmStatus
                }
            )
            .setTimestamp();

        await interaction.reply({
            embeds: [successEmbed],
            flags: MessageFlags.Ephemeral,
        });
    },
};
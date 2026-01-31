const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("Show information about a user | ดูข้อมูลผู้ใช้งาน")
        .addUserOption(option =>
            option
                .setName("target")
                .setDescription("The user to check")
        ),

    /**
     * @param {import("discord.js").Client} client
     * @param {import("discord.js").ChatInputCommandInteraction} interaction
     */
    async run(client, interaction) {
        const user = interaction.options.getUser("target") ?? interaction.user;
        let member = null;
        try {
            member = await interaction.guild.members.fetch(user.id);
        } catch {
            member = null;
        }

        const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`;
        const joinedAt = member?.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : "Not in server";
        const roles = member ? member.roles.cache.filter(role => role.id !== interaction.guild.id).map(role => role.toString()).join(" ") || "No Roles" : "No Roles";
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(`${user.username}'s Information`)
            .setThumbnail(user.displayAvatarURL({ size: 512 }))
            .addFields(
                {
                    name: "User",
                    value: user.tag,
                    inline: true
                },
                {
                    name: "ID",
                    value: `\`${user.id}\``,
                    inline: true
                },
                {
                    name: "Account Created",
                    value: createdAt,
                    inline: true
                },
                {
                    name: "Joined Server",
                    value: joinedAt,
                    inline: true
                },
                member
                    ? {
                        name: `Roles [${member.roles.cache.size - 1}]`,
                        value: roles,
                        inline: true
                    }
                    : {
                        name: "Roles",
                        value: "User is not in this server",
                        inline: true
                    }
            )
            .setFooter({
                text: `Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();

        if (user.bot) {
            embed.setDescription("**This user is a bot**");
        }

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral,
        });
    },
};
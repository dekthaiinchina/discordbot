const { EmbedBuilder, MessageFlags } = require("discord.js");

const config = require("../config");

/**
 * @param {import("discord.js").Client} client
 * @param {import("discord.js").GuildMember} member
 */
module.exports = async (client, member) => {
    const autoRoleId = config.autoRoleId || "";
    const logChannelId = config.logChannelId || "";
    try {
        const role = member.guild.roles.cache.get(autoRoleId);
        if (role) {
            await member.roles.add(role);
        }
    } catch (err) {
        console.error("Auto-role error:", err);
    }

    const channel = member.guild.channels.cache.get(logChannelId);
    if (!channel) return;

    const createdAt = `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`;
    const embed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle("Member Joined")
        .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
        .addFields(
            {
                name: "User",
                value: member.user.tag,
                inline: true
            },
            {
                name: "ID",
                value: `\`${member.user.id}\``,
                inline: true
            },
            {
                name: "Account Created",
                value: createdAt,
                inline: true
            },
            {
                name: "Auto Role",
                value: `<@&${autoRoleId}>`,
                inline: true
            }
        )
        .setFooter({ text: `Members: ${member.guild.memberCount}` })
        .setTimestamp();

    channel.send({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
    });
};
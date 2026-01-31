const { EmbedBuilder, MessageFlags } = require("discord.js");

const config = require("../config");

/**
 * @param {import("discord.js").Client} client
 * @param {import("discord.js").GuildMember} member
 */
module.exports = async (client, member) => {
    const logChannelId = config.logChannelId || "";
    const channel = member.guild.channels.cache.get(logChannelId);
    if (!channel) return;

    const joinedAt = member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : "Unknown";
    const embed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle("Member Left")
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
                name: "Joined Server",
                value: joinedAt,
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
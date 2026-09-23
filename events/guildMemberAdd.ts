import type { BotEvent } from "../types";
import { EmbedBuilder } from "discord.js";

import config from "../config";

const event: BotEvent<"guildMemberAdd"> = async (client, member) => {
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
    if (!channel?.isSendable()) return;

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

    await channel.send({
        embeds: [embed],
    });
};
export = event;

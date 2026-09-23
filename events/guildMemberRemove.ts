import type { BotEvent } from "../types";
import { EmbedBuilder } from "discord.js";

import config from "../config";

const event: BotEvent<"guildMemberRemove"> = async (client, member) => {
    const logChannelId = config.logChannelId || "";
    const channel = member.guild.channels.cache.get(logChannelId);
    if (!channel?.isSendable()) return;

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

    await channel.send({
        embeds: [embed],
    });
};
export = event;

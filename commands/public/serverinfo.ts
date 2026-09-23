import type { Command } from "../../types";
import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";

const command: Command = {
    data: new SlashCommandBuilder()
        .setName("serverinfo")
        .setDescription("Show information about the server | ดูข้อมูลเซิร์ฟเวอร์"),

    async run(client, interaction) {
        const { guild } = interaction;
        if (!guild) {
            return interaction.reply({
                content: "This command can only be used in a server",
                flags: MessageFlags.Ephemeral,
            });
        }

        const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`;
        const owner = await guild.fetchOwner();
        const members = guild.members.cache;

        const humans = members.filter(m => !m.user.bot).size;
        const bots = members.filter(m => m.user.bot).size;

        const channels = guild.channels.cache;
        const textChannels = channels.filter(c => c.isTextBased()).size;
        const voiceChannels = channels.filter(c => c.isVoiceBased()).size;
        const rolesCount = guild.roles.cache.size - 1;
        const verificationLevels = {
            0: "None",
            1: "Low",
            2: "Medium",
            3: "High",
            4: "Very High",
        };

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(`${guild.name} Information`)
            .setThumbnail(guild.iconURL({ size: 512 }))
            .addFields(
                {
                    name: "Server Name",
                    value: guild.name,
                    inline: true,
                },
                {
                    name: "Server ID",
                    value: `\`${guild.id}\``,
                    inline: true,
                },
                {
                    name: "Owner",
                    value: owner.user.tag,
                    inline: true,
                },

                {
                    name: "Created On",
                    value: createdAt,
                    inline: true,
                },

                {
                    name: "Members",
                    value: `Humans: **${humans}**\n Bots: **${bots}**\n Total: **${guild.memberCount}**`,
                    inline: true,
                },
                {
                    name: "Channels",
                    value: `Text: **${textChannels}**\n Voice: **${voiceChannels}**\n Total: **${channels.size}**`,
                    inline: true,
                },
                {
                    name: "Roles",
                    value: `**${rolesCount}** roles`,
                    inline: true,
                },
                {
                    name: "Verification Level",
                    value: verificationLevels[guild.verificationLevel],
                    inline: true,
                },
                {
                    name: "Boosts",
                    value: `Level **${guild.premiumTier}**\n Boosts: **${guild.premiumSubscriptionCount ?? 0}**`,
                    inline: true,
                }
            )
            .setFooter({
                text: `Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral,
        });
    },
};

export = command;

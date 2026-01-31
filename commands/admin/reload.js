const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");

const fs = require("node:fs");
const path = require("node:path");
const config = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reload")
        .setDescription("Reloads all commands in the bot | รีโหลดทุกคำสั่ง")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {import("discord.js").Client} client
     * @param {import("discord.js").ChatInputCommandInteraction} interaction
     */
    async run(client, interaction) {
        const developerId = config.developerId || "";

        if (interaction.user.id !== developerId) {
            return interaction.reply({
                content: "You are not the developer! | คุณไม่ใช่ผู้พัฒนาบอท",
                flags: MessageFlags.Ephemeral,
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const commandsPath = path.join(process.cwd(), "commands");

        let reloadedCount = 0;
        const errors = [];

        const reloadFiles = (dir) => {
            for (const file of fs.readdirSync(dir)) {
                const fullPath = path.join(dir, file);

                const stat = fs.lstatSync(fullPath);
                if (stat.isDirectory()) {
                    reloadFiles(fullPath);
                    continue;
                }

                if (!file.endsWith(".js")) continue;
                try {
                    delete require.cache[require.resolve(fullPath)];
                    
                    const command = require(fullPath);
                    if (!command?.data?.name) {
                        throw new Error("Missing command data or name");
                    }

                    client.commands.set(command.data.name, command);
                    reloadedCount++;
                } catch (err) {
                    errors.push(`${file}: ${err.message}`);
                }
            }
        };

        reloadFiles(commandsPath);

        const embed = new EmbedBuilder()
            .setTitle("Reload All Completed")
            .setColor(errors.length ? 0xFEE75C : 0x57F287)
            .setDescription(`Successfully reloaded **${reloadedCount}** commands.`)
            .setTimestamp();

        if (errors.length) {
            embed.addFields({
                name: "Errors",
                value: `\`\`\`${errors.slice(0, 5).join("\n")}\`\`\``,
            });
        }
        await interaction.editReply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral,
        });
    },
};
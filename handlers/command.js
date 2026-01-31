const { Collection } = require("discord.js");

const fs = require("fs");
const path = require("path");
const logger = require("../function/logger");

/**
 * @param {import("discord.js").Client} client
 */
module.exports = (client) => {
    client.commands = new Collection();
    client.commandsArray = [];

    const commandsPath = path.join(__dirname, "..", "commands");
    try {
        const folders = fs.readdirSync(commandsPath);
        for (const folder of folders) {
            const folderPath = path.join(commandsPath, folder);

            const files = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));
            for (const file of files) {
                const filePath = path.join(folderPath, file);
                
                const command = require(filePath);
                if (!command?.data?.name) {
                    logger.warning(`Invalid command file: /commands/${folder}/${file}`);
                    continue;
                }

                client.commands.set(command.data.name, command);
                client.commandsArray.push(command.data.toJSON());
                
                logger.debug(`Loaded Command ${command.data.name}`);
            }
        }
    } catch (error) {
        logger.danger(error);
    }
};
const fs = require("fs");
const path = require("path");
const logger = require("../function/logger");

/**
 * @param {import("discord.js").Client} client
 */
module.exports = (client) => {
    client.events = [];

    const eventsPath = path.join(__dirname, "..", "events");
    try {
        const files = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));
        for (const file of files) {
            const filePath = path.join(eventsPath, file);
            
            const event = require(filePath);
            const eventName = file.replace(".js", "");
            if (typeof event !== "function") {
                logger.warning(`Invalid event file: ${file}`);
                continue;
            }

            client.events.push(eventName);
            client.on(eventName, (...args) => event(client, ...args));

            logger.debug(`Loaded Event ${eventName}`);
        }
    } catch (error) {
        logger.danger(error);
    }
};
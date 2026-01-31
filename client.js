const { Client } = require("discord.js");

const fs = require("fs");
const config = require("./config");
const logger = require("./function/logger");

const client = new Client({
    intents: config.intents,
});

const handlers = fs.readdirSync("./handlers");
for (const fileName of handlers) {
    logger.debug(`Loaded Handler ${fileName}`);
    require(`./handlers/${fileName}`)(client);
}

logger.info("Logging in...");
client.login(config.token);
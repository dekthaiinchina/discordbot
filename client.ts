import { BotClient } from "./bot";
import config from "./config";
import logger from "./function/logger";
import loadCommands from "./handlers/command";
import loadEvents from "./handlers/events";

const client = new BotClient({ intents: config.intents });
loadCommands(client);
loadEvents(client);

logger.info("Logging in...");
client.login(config.token).catch(error => {
    logger.error(error);
    client.destroy();
    process.exitCode = 1;
});

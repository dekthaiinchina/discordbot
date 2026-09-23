import type { ClientEvents } from "discord.js";
import type { BotClient } from "../bot";
import type { BotEvent } from "../types";
import logger from "../function/logger";
import clientReady from "../events/clientReady";
import guildMemberAdd from "../events/guildMemberAdd";
import guildMemberRemove from "../events/guildMemberRemove";
import interactionCreate from "../events/interactionCreate";

function loadEvents(client: BotClient): void {
    function register<K extends keyof ClientEvents>(name: K, event: BotEvent<K>): void {
        client.on(name, (...args: ClientEvents[K]) => {
            // Starting a promise also catches synchronous throws from event handlers.
            void Promise.resolve().then(() => event(client, ...args)).catch(error => logger.error(error));
        });
        client.events.push(name);
        logger.debug(`Loaded Event ${name}`);
    }

    // Explicit registration lets TypeScript verify event names and payloads together.
    register("clientReady", clientReady);
    register("guildMemberAdd", guildMemberAdd);
    register("guildMemberRemove", guildMemberRemove);
    register("interactionCreate", interactionCreate);
}

export = loadEvents;

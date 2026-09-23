import { Client, Collection, type ClientEvents, type RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
import type { Command } from "./types";

export class BotClient extends Client {
    commands = new Collection<string, Command>();
    commandsArray: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
    events: (keyof ClientEvents)[] = [];
}

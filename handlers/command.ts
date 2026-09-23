import { readdirSync } from "node:fs";
import path from "node:path";
import { SlashCommandBuilder } from "discord.js";
import type { BotClient } from "../bot";
import type { Command } from "../types";
import logger from "../function/logger";

interface LoadResult {
    loaded: number;
    errors: string[];
}

function isCommand(value: unknown): value is Command {
    return typeof value === "object" && value !== null
        && "data" in value && value.data instanceof SlashCommandBuilder
        && typeof value.data.name === "string" && value.data.name.length > 0
        && "run" in value && typeof value.run === "function";
}

// CommonJS cache eviction deliberately reloads compiled modules, never TypeScript sources.
function loadCommands(client: BotClient, reload = false): LoadResult {
    const result: LoadResult = { loaded: 0, errors: [] };
    const commandsPath = path.join(__dirname, "..", "commands");
    const commands = new Map<string, Command>();

    function visit(directory: string): void {
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
            const filePath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                visit(filePath);
                continue;
            }
            if (!entry.isFile() || !entry.name.endsWith(".js")) continue;
            try {
                if (reload) delete require.cache[require.resolve(filePath)];
                const command: unknown = require(filePath);
                if (!isCommand(command)) throw new Error("Missing command builder, name, or run function");
                command.data.toJSON(); // Validate before replacing the active command set.
                if (commands.has(command.data.name)) throw new Error(`Duplicate command: ${command.data.name}`);
                commands.set(command.data.name, command);
            } catch (error) {
                result.errors.push(`${entry.name}: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }

    try {
        visit(commandsPath);
    } catch (error) {
        result.errors.push(error instanceof Error ? error.message : String(error));
    }

    // A failed reload keeps the working collection intact.
    if (result.errors.length) {
        for (const error of result.errors) logger.error(error);
        if (!reload) throw new Error("Could not load commands");
        return result;
    }
    client.commands.clear();
    for (const [name, command] of commands) {
        client.commands.set(name, command);
        logger.debug(`Loaded Command ${name}`);
    }
    client.commandsArray = [...commands.values()].map(command => command.data.toJSON());
    result.loaded = commands.size;
    return result;
}

export = loadCommands;

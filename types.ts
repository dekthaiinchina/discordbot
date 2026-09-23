import type {
    ChatInputCommandInteraction,
    ClientEvents,
    GatewayIntentBits,
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import type { BotClient } from "./bot";

export interface BotConfig {
    version: string;
    token: string;
    pushcommand: boolean;
    pushGlobal: boolean;
    guildPushCommand: string[];
    developerId: string;
    autoRoleId: string;
    logChannelId: string;
    shard: number | "auto";
    intents: GatewayIntentBits[];
}

export interface Command {
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
    run(client: BotClient, interaction: ChatInputCommandInteraction): Promise<unknown>;
}

export type BotEvent<K extends keyof ClientEvents> = (
    client: BotClient,
    ...args: ClientEvents[K]
) => void | Promise<unknown>;

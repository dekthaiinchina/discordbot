import { GatewayIntentBits } from "discord.js";
import { version } from "./package.json";
import type { BotConfig } from "./types";

const baseConfig: Omit<BotConfig, "intents"> = {
    version,
    token: process.env.DISCORD_TOKEN ?? "",
    pushcommand: true,
    pushGlobal: true,
    guildPushCommand: [],
    developerId: "",
    autoRoleId: "",
    logChannelId: "",
    shard: 1,
};

const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
];

const config = {
    development: {
        ...baseConfig,
        intents,
    },
    production: {
        ...baseConfig,
        intents,
    },
};

const selectedConfig: BotConfig = config[process.env.NODE_ENV === "development" ? "development" : "production"];
export = selectedConfig;

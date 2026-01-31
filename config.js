const { GatewayIntentBits } = require("discord.js");

const baseConfig = {
    version: require("./package.json").version,
    token: "",
    pushcommand: true,
    pushGlobal: true,
    guildPushCommand: "",
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

module.exports = config[process.env.NODE_ENV === "development" ? "development" : "production"];

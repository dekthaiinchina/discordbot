const { ShardingManager } = require("discord.js");

const path = require("path");
const config = require("./config");
const logger = require("./function/logger");

const manager = new ShardingManager(
    path.join(__dirname, "client.js"),
    {
        token: config.token,
        totalShards: config.shard === "auto" ? "auto" : config.shard,
        respawn: true,
        shardArgs: process.argv.slice(2),
    }
);

manager.on("shardCreate", shard => {
    logger.debug(`Launched Shard ${shard.id + 1} of ${manager.totalShards}`);
});

manager.spawn({
    amount: manager.totalShards,
    delay: 10000,
    timeout: -1,
});
import { ShardingManager } from "discord.js";

import path from "path";
import config from "./config";
import logger from "./function/logger";

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
}).catch(error => {
    logger.error(error);
    process.exitCode = 1;
});

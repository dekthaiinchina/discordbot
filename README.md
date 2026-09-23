# Discord Bot

A Discord.js v14 bot written in strict TypeScript, with five slash commands, member events, sharding, and command reloading. TypeScript compiles to CommonJS JavaScript in `dist/`.

## Requirements

- Node.js 22.12 or newer (Node.js 24 is used by Docker)
- npm
- A [Discord bot token](https://discord.com/developers/applications)

## Setup

```bash
npm ci
```

Edit `config.ts` to configure the bot. Set `DISCORD_TOKEN` in the process environment before starting; the default configuration reads it automatically. On Bash:

```bash
export DISCORD_TOKEN='your-bot-token'
npm run dev
```

Do not commit tokens. `.env` is ignored by Git, but the application does not automatically load `.env` files.

The relevant configuration fields are:

```typescript
const baseConfig: Omit<BotConfig, "intents"> = {
    version,
    token: process.env.DISCORD_TOKEN ?? "",
    pushcommand: true,
    pushGlobal: true,
    guildPushCommand: ["YOUR_GUILD_ID"],
    developerId: "YOUR_DEVELOPER_ID",
    autoRoleId: "AUTO_ROLE_ID",
    logChannelId: "LOG_CHANNEL_ID",
    shard: 1, // Or "auto"
};
```

`guildPushCommand` must be an array of complete guild IDs. It is used when `pushGlobal` is false. Empty role and channel IDs disable those optional features. Configure a channel that supports sending messages for member logs. Enable the privileged Guild Members and Message Content intents in the Discord developer portal, since this bot requests them.

## Commands and scripts

| Script | Purpose |
| --- | --- |
| `npm run typecheck` | Check application and test types without emitting files |
| `npm run build` | Remove generated `dist/` files and compile TypeScript |
| `npm run dev` | Build and start with development logging |
| `npm run prod` | Build and start in production mode |
| `npm start` | Start an already compiled production build |
| `npm test` | Clean build and offline tests using Node's test runner |

Development mode builds once; restart it after source changes. For production, install development dependencies in the build environment, run `npm run build`, and use `npm start` with production dependencies in the runtime environment.

| Slash command | Behavior |
| --- | --- |
| `/ping` | Show interaction and WebSocket latency |
| `/serverinfo` | Show server details; requires a guild |
| `/userinfo [target]` | Show account and available server membership details |
| `/purge <amount>` | Delete 1–100 messages; requires Manage Messages and a supported guild channel |
| `/reload` | Reload compiled command modules in the current shard; restricted to `developerId` |

`/reload` reads JavaScript under `dist/commands/`. After editing a `.ts` command, run `npm run build` before invoking it. A failed reload keeps the previous active command collection. Successful reloads also refresh the in-memory command registration data. Reload does not push updated slash-command schemas to Discord or update other shards; restart the bot to deploy schema changes and update every shard. Rebuilding while running can briefly remove `dist/`, so wait for the build to finish before reloading. Restart after changing shared helpers, event handlers, or configuration.

## Docker

The Docker build compiles TypeScript in a build stage and installs only production dependencies in the runtime stage.

```bash
docker build -t discord-bot .
docker run -d --name my-discord-bot -e DISCORD_TOKEN discord-bot
```

Set `DISCORD_TOKEN` in the host environment first. Configuration edits require rebuilding the image. The container runs as the unprivileged `node` user in production mode.

## Project structure

```text
commands/
  admin/{purge,reload}.ts
  public/{ping,serverinfo,userinfo}.ts
events/
  clientReady.ts
  guildMemberAdd.ts
  guildMemberRemove.ts
  interactionCreate.ts
function/logger.ts
handlers/
  command.ts
  events.ts
bot.ts                   # Client with typed command collections
client.ts                # Client startup and login
config.ts                # Typed configuration
index.ts                 # Sharding manager
types.ts                # Shared command, event, and configuration contracts
tests/bot.test.ts         # Offline behavior tests
tsconfig.json
MIGRATION_PLAN.md
MIGRATION_REPORT.md
```

## Adding a command

Create a `.ts` file below `commands/`, then rebuild. The loader discovers compiled `.js` command modules recursively.

```typescript
import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types";

const command: Command = {
    data: new SlashCommandBuilder()
        .setName("example")
        .setDescription("Example command"),
    async run(client, interaction) {
        await interaction.reply("Hello!");
    },
};

export = command;
```

Use `interaction.isChatInputCommand()` when routing slash commands and check nullable guild/channel state in command implementations. The shared command interface supplies the chat-input interaction type automatically.

## Adding an event

Create an event file using the event's exact Discord name:

```typescript
// events/messageCreate.ts
import type { BotEvent } from "../types";

const event: BotEvent<"messageCreate"> = async (client, message) => {
    if (message.author.bot) return;
    // Handle the typed message here.
};

export = event;
```

Import it in `handlers/events.ts` and add `register("messageCreate", messageCreate)` alongside the existing registrations. This explicit registry checks event names and payload types at compile time. Event failures are caught and logged by the registry.

## Logging and troubleshooting

The logger supports `debug`, `info`, `warning`, `danger`, `error`, and `success`; `debug` only prints in development. Member join events optionally assign a role, and join/leave events send embeds to the configured channel.

If commands do not appear, check the bot's `applications.commands` scope and command deployment configuration. If an operation fails, check the bot's permissions and role hierarchy. `/purge` filters out messages older than 14 days. Member counts in `/serverinfo` use the member cache and may not include every member.

The offline suite makes no Discord requests. A real token and test guild are needed to verify login, shard spawning, command registration, permissions, and member events against Discord.

## Migration documentation

See [the migration plan](MIGRATION_PLAN.md) for the initial review and ordered steps, and [the completion report](MIGRATION_REPORT.md) for implementation details, verification results, and remaining limitations.

## Dependencies and metadata

Runtime dependencies: `discord.js`, `colors`, and `cross-env`. Development dependencies: TypeScript and Node.js type declarations. `package-lock.json` records the exact installed versions.

Author: **dekthaiinchina**. Package metadata declares MIT; no standalone license file is included.

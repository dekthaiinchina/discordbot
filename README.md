# Discord Bot

A feature-rich Discord bot built with Discord.js v14 featuring slash commands, event handling, sharding support, and modular architecture.

## Features

- ✨ Slash Commands with categorization (Public & Admin)
- 🔄 Event-driven architecture
- 🚀 Sharding support for scalability
- 📝 Custom logger with color-coded output
- 🐳 Docker support for easy deployment
- ⚙️ Environment-based configuration (Development/Production)
- 🔒 Permission-based admin commands

## Prerequisites

- Node.js 20 LTS or higher
- npm or yarn
- A Discord Bot Token ([Get one here](https://discord.com/developers/applications))

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd discordbot
```

2. Install dependencies:
```bash
npm install
```

3. Configure the bot:

Edit `config.js` and add your bot configuration:

```javascript
const baseConfig = {
    token: "YOUR_BOT_TOKEN_HERE",
    pushcommand: true,              // Auto-deploy commands on startup
    pushGlobal: true,                // Deploy commands globally (false for specific guilds)
    guildPushCommand: "",            // Guild IDs for command deployment (if pushGlobal is false)
    developerId: "YOUR_DEVELOPER_ID",
    autoRoleId: "AUTO_ROLE_ID",      // Role ID to assign to new members
    logChannelId: "LOG_CHANNEL_ID",  // Channel ID for logs
    shard: 1,                        // Number of shards (use "auto" for automatic)
};
```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run prod
```

### Using Docker

1. Build the Docker image:
```bash
docker build -t discord-bot .
```

2. Run the container:
```bash
docker run -d --name my-discord-bot discord-bot
```

## Project Structure

```
discordbot/
├── commands/
│   ├── admin/          # Admin-only commands
│   │   ├── purge.js    # Bulk delete messages
│   │   ├── warn.js     # Warn users
│   │   └── reload.js   # Reload commands
│   └── public/         # Public commands
│       ├── ping.js     # Check bot latency
│       ├── serverinfo.js  # Display server information
│       └── userinfo.js    # Display user information
├── events/
│   ├── clientReady.js        # Bot ready event
│   ├── guildMemberAdd.js     # New member join event
│   ├── guildMemberRemove.js  # Member leave event
│   └── interactionCreate.js  # Handle slash commands
├── function/
│   └── logger.js       # Custom logging utility
├── handlers/
│   ├── command.js      # Command loader
│   └── events.js       # Event loader
├── client.js           # Client initialization
├── index.js            # Sharding manager entry point
├── config.js           # Bot configuration
├── package.json
└── Dockerfile
```

## Available Commands

### Public Commands
- `/ping` - Check bot latency (shows WebSocket and interaction latency)
- `/serverinfo` - Display server information
- `/userinfo` - Display user information

### Admin Commands (Requires Permissions)
- `/purge <amount>` - Delete 1-100 messages in a channel (Requires: Manage Messages)
- `/warn <user>` - Warn a user (Requires: Moderate Members)
- `/reload` - Reload bot commands (Developer only)

## Features in Detail

### Sharding
The bot uses Discord.js ShardingManager for horizontal scaling across multiple processes. Configure the number of shards in `config.js`:

```javascript
shard: "auto"  // Automatically determine shard count
// or
shard: 2       // Use specific number of shards
```

### Event System
Events are automatically loaded from the `events/` directory. Each event file exports a function that receives the client instance.

### Command Handler
Commands are organized into categories (admin/public) and automatically loaded on startup. The handler system supports:
- Automatic command registration
- Global or guild-specific deployment
- Permission checking
- Developer-only commands

### Logger
Custom color-coded logger with multiple levels:
- `logger.info()` - General information (cyan)
- `logger.success()` - Success messages (green)
- `logger.warning()` - Warnings (yellow)
- `logger.error()` - Errors (red)
- `logger.debug()` - Debug information (blue)

### Auto Role
Automatically assigns a role to new members when they join the server. Configure `autoRoleId` in `config.js`.

### Logging Channel
Member join/leave events are logged to a specified channel. Configure `logChannelId` in `config.js`.

## Configuration Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `token` | String | Discord bot token | Required |
| `pushcommand` | Boolean | Auto-deploy commands on startup | `true` |
| `pushGlobal` | Boolean | Deploy commands globally | `true` |
| `guildPushCommand` | String/Array | Guild IDs for command deployment | `""` |
| `developerId` | String | Developer user ID for restricted commands | Required |
| `autoRoleId` | String | Role ID to assign to new members | Optional |
| `logChannelId` | String | Channel ID for logging events | Optional |
| `shard` | Number/String | Number of shards or "auto" | `1` |

## Gateway Intents

The bot uses the following intents:
- `Guilds` - Access to guild information
- `GuildMembers` - Member join/leave events
- `GuildMessages` - Message-related events
- `MessageContent` - Access to message content
- `GuildMessageReactions` - Reaction events
- `DirectMessages` - DM support

## Creating Custom Commands

### Public Command Example
Create a new file in `commands/public/`:

```javascript
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("example")
        .setDescription("Example command"),

    async run(client, interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle("Example")
            .setDescription("This is an example command");

        await interaction.reply({ embeds: [embed] });
    },
};
```

### Admin Command Example
Create a new file in `commands/admin/`:

```javascript
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("adminexample")
        .setDescription("Admin command example")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async run(client, interaction) {
        // Command logic here
        await interaction.reply("Admin command executed!");
    },
};
```

## Creating Custom Events

Create a new file in `events/`:

```javascript
module.exports = (client) => {
    client.on("eventName", async (...args) => {
        // Event handler logic
    });
};
```

## Troubleshooting

### Bot not responding to commands
- Ensure the bot has the `applications.commands` scope
- Check if commands are deployed (set `pushcommand: true`)
- Verify the bot has necessary permissions in the server

### Missing permissions error
- Grant the bot appropriate role permissions
- Check channel-specific permission overrides
- Ensure the bot's role is higher than roles it needs to manage

### Sharding issues
- Use `"auto"` for shard count initially
- Ensure sufficient memory for multiple shards
- Check Discord API documentation for shard limits

## Dependencies

- **discord.js** (^14.25.1) - Discord API wrapper
- **colors** (^1.4.0) - Terminal color output
- **cross-env** (^10.1.0) - Cross-platform environment variables

## License

This project is unlicensed. Please add an appropriate license for your use case.

## Author

**dekthaiinchina**

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue in the repository.

---

**Note:** Remember to keep your bot token secure and never commit it to version control. Consider using environment variables or a `.env` file for sensitive information.

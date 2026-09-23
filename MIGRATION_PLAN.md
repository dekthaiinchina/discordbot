# JavaScript to TypeScript migration plan

## Review baseline

The project contains 15 CommonJS JavaScript files: a sharding entry point, a client entry point, configuration, five slash commands, four events, two loaders, and a logger. There is no compiler configuration, lockfile, or automated test suite.

Review findings to address during conversion:

- The interaction error handler calls `logger.error`, which does not exist.
- Handler startup and command reload depend on the current working directory.
- `guildPushCommand` is a string but is iterated as a list of guild IDs.
- Member log channels are not checked for message support, and ordinary messages use unsupported ephemeral flags.
- Guild commands assume non-null guilds, members, and channels; leave events can receive partial members.
- Login, shard startup, and asynchronous event failures can escape without structured error handling.
- Docker does not compile sources and currently starts development mode.
- The README advertises a `/warn` command that is not implemented.

## Ordered implementation

1. Add TypeScript and Node types as development dependencies, strict compiler settings, a lockfile, and build/typecheck/test scripts. Retain CommonJS runtime output in `dist/` to preserve cache-based reloads.
2. Introduce shared command/event/configuration contracts and a client subclass with initialized command collections. Treat dynamically required commands as unknown until validated.
3. Convert all 15 source files to TypeScript. Resolve runtime module paths relative to compiled files, and retain the sharding and reload behavior.
4. Correct the reviewed runtime issues with Discord type narrowing, typed event registration, supported message options, and explicit asynchronous error handling.
5. Update Docker to build TypeScript before installing the production runtime; update setup, configuration, extension examples, and reload instructions.
6. Run strict type checking, a clean build, and offline tests for module discovery, reloads, event dispatch, error responses, and guild/channel guards. Record the results and limitations in `MIGRATION_REPORT.md`.

## Acceptance criteria

- All application source is TypeScript, with no `any` escape hatches or suppressed compiler diagnostics.
- The build emits runnable CommonJS JavaScript into `dist/`.
- All five slash commands and four events remain available.
- Tests do not require a bot token or send Discord requests.
- Documentation distinguishes offline verification from a live Discord smoke test.

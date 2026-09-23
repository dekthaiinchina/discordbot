import assert from "node:assert/strict";
import { setImmediate } from "node:timers/promises";
import { writeFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";
import { Collection, MessageFlags, PermissionFlagsBits, PermissionsBitField, SlashCommandBuilder, type ChatInputCommandInteraction, type Client, type GuildMember, type Interaction, type PartialGuildMember } from "discord.js";
import { BotClient } from "../bot";
import config from "../config";
import logger from "../function/logger";
import loadCommands from "../handlers/command";
import loadEvents from "../handlers/events";
import interactionCreate from "../events/interactionCreate";
import clientReady from "../events/clientReady";
import guildMemberAdd from "../events/guildMemberAdd";
import guildMemberRemove from "../events/guildMemberRemove";
import purge from "../commands/admin/purge";
import serverinfo from "../commands/public/serverinfo";
import userinfo from "../commands/public/userinfo";
import reload from "../commands/admin/reload";
import ping from "../commands/public/ping";

// Discord objects normally come from the gateway. Fixtures provide just the members under test.
const user = {
    id: "123", tag: "tester", username: "tester", bot: false,
    createdTimestamp: 1700000000000, displayAvatarURL: () => "https://example.com/avatar.png",
};
function interaction(overrides: Record<string, unknown> = {}) {
    const replies: Record<string, unknown>[] = [];
    const edits: Record<string, unknown>[] = [];
    const followUps: Record<string, unknown>[] = [];
    const deferrals: Record<string, unknown>[] = [];
    const value = {
        id: "123456789123456789", user, client: { user }, commandName: "ping", guild: null,
        channel: null, memberPermissions: null, replied: false, deferred: false,
        isChatInputCommand: () => true, inGuild: () => false,
        options: { getUser: () => null, getInteger: () => 3 },
        reply: async (payload: Record<string, unknown>) => { replies.push(payload); },
        editReply: async (payload: Record<string, unknown>) => { edits.push(payload); },
        followUp: async (payload: Record<string, unknown>) => { followUps.push(payload); },
        deferReply: async (payload: Record<string, unknown>) => { deferrals.push(payload); },
        ...overrides,
    } as unknown as ChatInputCommandInteraction;
    return { value, replies, edits, followUps, deferrals };
}

function bot(): BotClient { return new BotClient({ intents: [] }); }

test("compiled commands load and reload from a different working directory", () => {
    const client = bot();
    const cwd = process.cwd();
    try {
        process.chdir(tmpdir());
        assert.equal(loadCommands(client).loaded, 5);
        assert.deepEqual([...client.commands.keys()].sort(), ["ping", "purge", "reload", "serverinfo", "userinfo"]);
        const previousPing = client.commands.get("ping");
        assert.equal(loadCommands(client, true).loaded, 5);
        assert.notEqual(client.commands.get("ping"), previousPing);
        assert.equal(client.commandsArray.length, 5);
        assert.deepEqual(client.commandsArray.map(data => data.name).sort(), [...client.commands.keys()].sort());
    } finally { process.chdir(cwd); }
});

test("invalid command reload leaves the active collection intact", () => {
    const client = bot();
    loadCommands(client);
    const previousPing = client.commands.get("ping");
    const file = path.join(__dirname, "..", "commands", "invalid-test-fixture.js");
    writeFileSync(file, 'module.exports = { data: { name: "invalid" } };');
    try {
        const result = loadCommands(client, true);
        assert.equal(result.loaded, 0);
        assert.equal(result.errors.length, 1);
        assert.equal(client.commands.get("ping"), previousPing);
        assert.equal(client.commandsArray.length, 5);
    } finally {
        delete require.cache[file];
        unlinkSync(file);
    }
});

test("event registry attaches all four events and catches asynchronous rejection", async t => {
    const client = bot();
    const errors: unknown[] = [];
    t.mock.method(logger, "error", (error: unknown) => errors.push(error));
    loadEvents(client);
    assert.deepEqual(client.events, ["clientReady", "guildMemberAdd", "guildMemberRemove", "interactionCreate"]);
    for (const name of client.events) assert.equal(client.listenerCount(name), 1);
    const failure = new Error("reply unavailable");
    client.emit("interactionCreate", interaction({ commandName: "missing", reply: async () => { throw failure; } }).value);
    await setImmediate();
    assert.deepEqual(errors, [failure]);
});

test("non-chat-input interactions are ignored", async () => {
    const fixture = interaction({ isChatInputCommand: () => false });
    await interactionCreate(bot(), fixture.value as Interaction);
    assert.equal(fixture.replies.length, 0);
});

test("unknown command receives an ephemeral response", async () => {
    const fixture = interaction();
    await interactionCreate(bot(), fixture.value);
    assert.equal(fixture.replies[0]?.flags, MessageFlags.Ephemeral);
    assert.equal(fixture.replies[0]?.content, "This command was not found");
});

for (const acknowledged of [false, true]) {
    test(`command failures use ${acknowledged ? "followUp" : "reply"} and log the original error`, async t => {
        const failure = new Error("command failed");
        const errors: unknown[] = [];
        t.mock.method(logger, "error", (error: unknown) => errors.push(error));
        const client = bot();
        client.commands.set("ping", {
            data: new SlashCommandBuilder().setName("ping").setDescription("test"),
            run: async () => { throw failure; },
        });
        const fixture = interaction({ deferred: acknowledged });
        await interactionCreate(client, fixture.value);
        assert.deepEqual(errors, [failure]);
        assert.equal(fixture.replies.length, acknowledged ? 0 : 1);
        assert.equal(fixture.followUps.length, acknowledged ? 1 : 0);
    });
}

test("serverinfo and purge reject direct messages safely", async () => {
    for (const command of [serverinfo, purge]) {
        const fixture = interaction();
        await command.run(bot(), fixture.value);
        assert.equal(fixture.replies[0]?.flags, MessageFlags.Ephemeral);
    }
});

test("userinfo supports direct messages", async () => {
    const fixture = interaction();
    await userinfo.run(bot(), fixture.value);
    assert.equal(fixture.replies[0]?.flags, MessageFlags.Ephemeral);
    assert.ok(fixture.replies[0]?.embeds);
});

test("purge enforces permissions before deleting messages", async () => {
    let deleted = false;
    const fixture = interaction({
        inGuild: () => true,
        channel: { bulkDelete: async () => { deleted = true; } },
        memberPermissions: new PermissionsBitField(),
    });
    await purge.run(bot(), fixture.value);
    assert.equal(deleted, false);
    assert.equal(fixture.replies[0]?.content, "You do not have permission to use this command");
});

test("purge defers and edits its response after deletion", async () => {
    const fixture = interaction({
        inGuild: () => true,
        memberPermissions: new PermissionsBitField(PermissionFlagsBits.ManageMessages),
        channel: { bulkDelete: async (amount: number, filterOld: boolean) => {
            assert.equal(amount, 3);
            assert.equal(filterOld, true);
            assert.equal(fixture.deferrals.length, 1);
            return new Collection([["1", {}]]);
        } },
    });
    await purge.run(bot(), fixture.value);
    assert.equal(fixture.deferrals[0]?.flags, MessageFlags.Ephemeral);
    assert.equal(fixture.edits.length, 1);
    assert.equal(fixture.edits[0]?.flags, undefined);
});

test("reload is developer-only and updates compiled commands", async () => {
    const previous = config.developerId;
    config.developerId = "developer";
    try {
        const denied = interaction();
        await reload.run(bot(), denied.value);
        assert.equal(denied.deferrals.length, 0);
        assert.equal(denied.replies.length, 1);
        const allowed = interaction({ user: { ...user, id: "developer" } });
        const client = bot();
        await reload.run(client, allowed.value);
        assert.equal(client.commands.size, 5);
        assert.equal(allowed.deferrals[0]?.flags, MessageFlags.Ephemeral);
        assert.equal(allowed.edits[0]?.flags, undefined);
    } finally { config.developerId = previous; }
});

test("ping creates an ephemeral latency embed", async () => {
    const fixture = interaction();
    await ping.run(bot(), fixture.value);
    assert.ok(fixture.replies[0]?.embeds);
    assert.equal(fixture.replies[0]?.flags, MessageFlags.Ephemeral);
});

test("member events skip unsendable channels and send ordinary messages", async () => {
    for (const sendable of [false, true]) {
        const sent: Record<string, unknown>[] = [];
        const member = {
            user, joinedTimestamp: null,
            roles: { add: async () => {} },
            guild: {
                memberCount: 1,
                roles: { cache: new Collection() },
                channels: { cache: new Collection([[config.logChannelId, {
                    isSendable: () => sendable,
                    send: async (payload: Record<string, unknown>) => { sent.push(payload); },
                }]]) },
            },
        } as unknown as GuildMember;
        await guildMemberAdd(bot(), member);
        const partialMember = { ...member, partial: true, pending: null } as unknown as PartialGuildMember;
        await guildMemberRemove(bot(), partialMember);
        assert.equal(sent.length, sendable ? 2 : 0);
        for (const payload of sent) assert.equal(payload.flags, undefined);
    }
});

test("guild command deployment uses complete IDs", async t => {
    const previous = { pushcommand: config.pushcommand, pushGlobal: config.pushGlobal, guildPushCommand: config.guildPushCommand };
    Object.assign(config, { pushcommand: true, pushGlobal: false, guildPushCommand: ["123456789", "987654321"] });
    const fetched: string[] = [];
    const client = bot();
    loadCommands(client);
    t.mock.method(client.guilds, "fetch", async (id: string) => {
        fetched.push(id);
        return { id, name: "test", commands: { set: async (commands: unknown) => assert.equal(commands, client.commandsArray) } };
    });
    const ready = { user: { tag: "bot", setActivity: () => {} }, application: { fetch: async () => {} } } as unknown as Client<true>;
    try {
        await clientReady(client, ready);
        assert.deepEqual(fetched, ["123456789", "987654321"]);
    } finally { Object.assign(config, previous); }
});

require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const chalk = require("chalk");
const boxen = require("boxen");
const gradient = require("gradient-string");
const figlet = require("figlet");

const connectDatabase = require("./database/database");
const messageCreate = require("./events/messageCreate");
const interactionCreate = require("./events/interactionCreate");
const GiveawayDraft = require("./database/models/GiveawayDraft");
const { startGiveawayManager } = require("./utils/giveawayManager");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// =====================================================
// BOT READY
// =====================================================

client.once("clientReady", () => {
    console.log(chalk.green(`✓ Logged in as ${client.user.tag}`));
});

// =====================================================
// MESSAGE CREATE
// =====================================================

client.on("messageCreate", async (message) => {
    await messageCreate(client, message);
});

// =====================================================
// INTERACTION CREATE
// =====================================================

client.on("interactionCreate", async (interaction) => {
    await interactionCreate(client, interaction);
});

// =====================================================
// START BOT
// =====================================================

async function startBot() {
    try {
        // ==========================================
        // CONNECT MONGODB
        // ==========================================

        await connectDatabase();
        console.log(chalk.green("✓ MongoDB connected successfully."));

        // ==========================================
        // REMOVE OLD UNIQUE INDEX
        // ==========================================

        try {
            await GiveawayDraft.collection.dropIndex("userId_1_guildId_1");
            console.log(chalk.green("✓ Old giveaway draft index removed."));
        } catch {
            console.log(chalk.yellow("ℹ No old giveaway draft index found."));
        }

        // ==========================================
        // GIVEAWAY INTERACTION CLIENT
        // ==========================================

        interactionCreate.setClient(client);

        // ==========================================
        // LOGIN DISCORD
        // ==========================================

        await client.login(process.env.TOKEN);

        // ==========================================
        // START GIVEAWAY MANAGER
        // ==========================================

        startGiveawayManager(client);

        // ==========================================
        // CapeX Startup Banner
        // ==========================================

        console.clear();

        console.log(
            gradient.atlas.multiline(
                figlet.textSync("CapeX", {
                    font: "ANSI Shadow",
                    horizontalLayout: "default",
                })
            )
        );

        console.log(
            boxen(
                `${chalk.green("● Status")}  Online\n` +
                    `${chalk.cyan("● Bot")}     Giveaway Bot\n` +
                    `${chalk.yellow("● Developer")} CapeX Dev`,
                {
                    padding: 1,
                    margin: 1,
                    borderStyle: "round",
                    borderColor: "cyan",
                }
            )
        );

        console.log(chalk.green.bold("✓ Giveaway system is ready.\n"));
    } catch (error) {
        console.error(chalk.red("✖ Failed to start bot:"), error);
        process.exit(1);
    }
}

startBot();
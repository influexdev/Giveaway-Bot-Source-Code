require("dotenv").config();

const {
    REST,
    Routes,
    SlashCommandBuilder
} = require("discord.js");

const commands = [

    // =========================
    // GCREATE
    // =========================
    new SlashCommandBuilder()
        .setName("gcreate")
        .setDescription("Create a new giveaway.")
        .toJSON(),

    // =========================
    // GEND
    // =========================
    new SlashCommandBuilder()
        .setName("gend")
        .setDescription("End an active giveaway.")
        .addStringOption(option =>
            option
                .setName("giveaway_id")
                .setDescription("The giveaway ID to end")
                .setRequired(false)
        )
        .toJSON(),

    // =========================
    // GDELETE
    // =========================
    new SlashCommandBuilder()
        .setName("gdelete")
        .setDescription("Delete an active giveaway.")
        .addStringOption(option =>
            option
                .setName("giveaway_id")
                .setDescription("The giveaway ID to delete")
                .setRequired(false)
        )
        .toJSON(),

    // =========================
    // GLIST
    // =========================
    new SlashCommandBuilder()
        .setName("glist")
        .setDescription("View all active giveaways.")
        .toJSON(),

    // =========================
    // GINFO
    // =========================
    new SlashCommandBuilder()
        .setName("ginfo")
        .setDescription("View information about a giveaway.")
        .addStringOption(option =>
            option
                .setName("giveaway_id")
                .setDescription("The giveaway ID")
                .setRequired(true)
        )
        .toJSON(),

    // =========================
    // GPING
    // =========================
    new SlashCommandBuilder()
        .setName("gping")
        .setDescription("Check the bot's latency.")
        .toJSON(),

    // =========================
    // GREROLL
    // =========================
    new SlashCommandBuilder()
        .setName("greroll")
        .setDescription("Reroll an ended giveaway.")
        .addStringOption(option =>
            option
                .setName("giveaway_id")
                .setDescription("The giveaway ID to reroll")
                .setRequired(true)
        )
        .toJSON(),

    // =========================
    // GPREFIX
    // =========================
    new SlashCommandBuilder()
        .setName("gprefix")
        .setDescription("Change the bot prefix for this server.")
        .addStringOption(option =>
            option
                .setName("prefix")
                .setDescription("The new prefix")
                .setRequired(true)
        )
        .toJSON(),

    // =========================
    // GINVITE
    // =========================
    new SlashCommandBuilder()
        .setName("ginvite")
        .setDescription("Get an invite link for the bot.")
        .toJSON(),
    // =========================
    // GSTATS
    // =========================
    new SlashCommandBuilder()
        .setName("gstats")
        .setDescription(
        "View giveaway statistics for this server."
    )
    .toJSON(),

    // =========================
    // BOT
    // =========================
    new SlashCommandBuilder()
        .setName("bot")
        .setDescription("View bot information.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("info")
                .setDescription("View bot information.")
    )
    .toJSON()

];

const rest = new REST({
    version: "10"
}).setToken(process.env.TOKEN);


async function deployCommands() {

    try {

        console.log(
            "Registering slash commands..."
        );

        await rest.put(
            Routes.applicationCommands(
                process.env.CLIENT_ID
            ),
            {
                body: commands
            }
        );

        console.log(
            "✅ Slash commands registered successfully!"
        );

        console.log(
            `📦 Registered ${commands.length} slash commands.`
        );

    } catch (error) {

        console.error(
            "❌ Failed to register slash commands:",
            error
        );

    }
}


deployCommands();
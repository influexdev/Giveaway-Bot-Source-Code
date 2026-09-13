const Giveaway = require("../database/models/Giveaway");
const { endGiveaway } = require("../utils/giveawayManager");

async function findGiveaway(messageOrInteraction, giveawayId) {
    const guildId = messageOrInteraction.guild.id;

    // If giveaway ID is provided, find exact giveaway
    if (giveawayId) {
        return await Giveaway.findOne({
            giveawayId,
            guildId
        });
    }

    // Otherwise find the latest active giveaway in the server
    return await Giveaway.findOne({
        guildId,
        ended: false
    }).sort({ createdAt: -1 });
}


// =========================
// PREFIX COMMAND
// =========================

async function execute(message, args, client) {
    const giveawayId = args[0];

    const giveaway = await findGiveaway(message, giveawayId);

    if (!giveaway) {
        return message.reply({
            content:
                "<:cross:1548585531301044304> No active giveaway found.\n\n" +
                "Use `.gend <giveawayId>` to end a specific giveaway."
        });
    }

    await endGiveaway(client, giveaway);

    return message.reply({
        content:
            `<:tick:1548589429235388446> Giveaway **${giveaway.giveawayId}** has been ended successfully.`
    });
}


// =========================
// SLASH COMMAND
// =========================

async function executeSlash(interaction) {
    const giveawayId =
        interaction.options.getString("giveaway_id");

    const giveaway = await findGiveaway(
        interaction,
        giveawayId
    );

    if (!giveaway) {
        return interaction.reply({
            content:
                "<:cross:1548585531301044304> No active giveaway found.",
            ephemeral: true
        });
    }

    await interaction.deferReply({
        ephemeral: true
    });

    await endGiveaway(
        interaction.client,
        giveaway
    );

    return interaction.editReply({
        content:
            `<:tick:1548589429235388446> Giveaway **${giveaway.giveawayId}** has been ended successfully.`
    });
}


module.exports = {
    name: "gend",
    description: "End an active giveaway.",
    execute,
    executeSlash
};
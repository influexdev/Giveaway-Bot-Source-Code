const {
    EmbedBuilder
} = require("discord.js");

const Giveaway =
    require("../database/models/Giveaway");

async function getActiveGiveaways(guildId) {

    return await Giveaway.find({
        guildId,
        ended: false
    }).sort({
        endTime: 1
    });
}


// =====================================================
// FORMAT GIVEAWAYS
// =====================================================

function createGiveawayEmbed(giveaways) {

    const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("<:giveaway:1548589044361855097> Active Giveaways")
        .setTimestamp();

    let description = "";

    giveaways.forEach((giveaway, index) => {

        description +=
            `**${index + 1}. ${giveaway.prize}**\n` +
            `<:info:1548590600813813781> ID: \`${giveaway.giveawayId}\`\n` +
            `<:stolen_emoji:1548592481216757842> Winners: **${giveaway.winnerCount}**\n` +
            `<:timer_clone:1548594414719471648> Ends: <t:${Math.floor(giveaway.endTime.getTime() / 1000)}:R>\n` +
            `<:stolen_emoji:1548594623457525771> Channel: <#${giveaway.channelId}>\n\n`;

    });

    embed.setDescription(description);

    embed.setFooter({
        text: `Total Active Giveaways: ${giveaways.length}`
    });

    return embed;
}


// =====================================================
// PREFIX COMMAND
// =====================================================

async function execute(message) {

    try {

        const giveaways =
            await getActiveGiveaways(
                message.guild.id
            );

        if (!giveaways.length) {

            return message.reply({
                content:
                    "<:cross:1548585531301044304> There are no active giveaways in this server."
            });

        }

        return message.reply({
            embeds: [
                createGiveawayEmbed(giveaways)
            ]
        });

    } catch (error) {

        console.error(
            "Glist prefix command error:",
            error
        );

        return message.reply(
            "<:cross:1548585531301044304> Something went wrong while fetching giveaways."
        );

    }

}


// =====================================================
// SLASH COMMAND
// =====================================================

async function executeSlash(interaction) {

    try {

        const giveaways =
            await getActiveGiveaways(
                interaction.guild.id
            );

        if (!giveaways.length) {

            return interaction.reply({
                content:
                    "<:cross:1548585531301044304> There are no active giveaways in this server.",
                ephemeral: true
            });

        }

        return interaction.reply({
            embeds: [
                createGiveawayEmbed(giveaways)
            ]
        });

    } catch (error) {

        console.error(
            "Glist slash command error:",
            error
        );

        return interaction.reply({
            content:
                "<:cross:1548585531301044304> Something went wrong while fetching giveaways.",
            ephemeral: true
        });

    }

}


module.exports = {

    name: "glist",

    description:
        "View all active giveaways.",

    execute,

    executeSlash

};
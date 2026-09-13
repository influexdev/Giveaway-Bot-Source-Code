const {
    EmbedBuilder
} = require("discord.js");

const Giveaway =
    require("../database/models/Giveaway");

async function findGiveaway(source, giveawayId) {

    if (!giveawayId) {
        return null;
    }

    return await Giveaway.findOne({
        guildId: source.guild.id,
        giveawayId: giveawayId
    });
}


// =====================================================
// CREATE INFO EMBED
// =====================================================

function createInfoEmbed(giveaway) {

    const endTimestamp =
        Math.floor(
            giveaway.endTime.getTime() / 1000
        );

    const status =
        giveaway.ended
            ? "<:stolen_emoji:1548591717429543012> Ended"
            : "<:stolen_emoji:1548591823860011079> Active";

    const participants =
        giveaway.participants
            ? new Set(giveaway.participants).size
            : 0;

    const embed =
        new EmbedBuilder()
            .setColor(
                giveaway.color || "#5865F2"
            )
            .setTitle(
                ` ${giveaway.title || "Giveaway"}`
            )
            .addFields(

                {
                    name: "<:giveaway:1548589044361855097> Prize",
                    value: giveaway.prize || "Not Set",
                    inline: true
                },

                {
                    name: "<:stolen_emoji:1548592481216757842> Winners",
                    value: String(
                        giveaway.winnerCount || 1
                    ),
                    inline: true
                },

                {
                    name: "<:icon_teams:1548592994939174962> Participants",
                    value: String(participants),
                    inline: true
                },

                {
                    name: "<:white_chart:1548594120002371635> Status",
                    value: status,
                    inline: true
                },

                {
                    name: "<:timer_clone:1548594414719471648> End Time",
                    value:
                        `<t:${endTimestamp}:F>\n` +
                        `<t:${endTimestamp}:R>`,
                    inline: true
                },

                {
                    name: "<:stolen_emoji:1548594623457525771> Channel",
                    value:
                        `<#${giveaway.channelId}>`,
                    inline: true
                },

                {
                    name: "<:stolen_emoji:1548611895047626772> Hosted By",
                    value:
                        `<@${giveaway.hostId}>`,
                    inline: true
                },

                {
                    name: "<:info:1548590600813813781> Giveaway ID",
                    value:
                        `\`${giveaway.giveawayId}\``,
                    inline: false
                }
            )
            .setTimestamp();

    if (giveaway.description) {

        embed.setDescription(
            giveaway.description
        );

    }

    if (giveaway.thumbnail) {

        embed.setThumbnail(
            giveaway.thumbnail
        );

    }

    embed.setFooter({
        text: "Giveaway Information"
    });

    return embed;
}


// =====================================================
// PREFIX COMMAND
// =====================================================

async function execute(message, args) {

    try {

        const giveawayId =
            args[0];

        if (!giveawayId) {

            return message.reply(
                "<:cross:1548585531301044304> Please provide a giveaway ID.\n\n" +
                `Example: \`${process.env.PREFIX || "."}ginfo GIVEAWAY_ID\``
            );

        }

        const giveaway =
            await findGiveaway(
                message,
                giveawayId
            );

        if (!giveaway) {

            return message.reply(
                "<:cross:1548585531301044304> Giveaway not found in this server."
            );

        }

        return message.reply({

            embeds: [
                createInfoEmbed(giveaway)
            ]

        });

    } catch (error) {

        console.error(
            "Ginfo prefix command error:",
            error
        );

        return message.reply(
            "Something went wrong while fetching giveaway information."
        );

    }

}


// =====================================================
// SLASH COMMAND
// =====================================================

async function executeSlash(interaction) {

    try {

        const giveawayId =
            interaction.options.getString(
                "giveaway_id"
            );

        if (!giveawayId) {

            return interaction.reply({

                content:
                    "<:cross:1548585531301044304>Please provide a giveaway ID.",

                ephemeral: true

            });

        }

        const giveaway =
            await findGiveaway(
                interaction,
                giveawayId
            );

        if (!giveaway) {

            return interaction.reply({

                content:
                    "<:cross:1548585531301044304> Giveaway not found in this server.",

                ephemeral: true

            });

        }

        return interaction.reply({

            embeds: [
                createInfoEmbed(giveaway)
            ]

        });

    } catch (error) {

        console.error(
            "<:cross:1548585531301044304> Ginfo slash command error:",
            error
        );

        return interaction.reply({

            content:
                "<:cross:1548585531301044304> Something went wrong while fetching giveaway information.",

            ephemeral: true

        });

    }

}


module.exports = {

    name: "ginfo",

    description:
        "View information about a giveaway.",

    execute,

    executeSlash

};
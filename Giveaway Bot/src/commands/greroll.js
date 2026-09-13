const {
    EmbedBuilder
} = require("discord.js");

const Giveaway =
    require("../database/models/Giveaway");


// =====================================================
// FIND GIVEAWAY
// =====================================================

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
// PICK RANDOM WINNERS
// =====================================================

function pickWinners(participants, winnerCount) {

    const uniqueParticipants = [
        ...new Set(participants)
    ];

    if (!uniqueParticipants.length) {
        return [];
    }

    const shuffled =
        [...uniqueParticipants].sort(
            () => Math.random() - 0.5
        );

    return shuffled.slice(
        0,
        Math.min(
            winnerCount,
            shuffled.length
        )
    );
}


// =====================================================
// REROLL GIVEAWAY
// =====================================================

async function rerollGiveaway(client, giveaway) {

    const participants =
        giveaway.participants || [];

    if (!participants.length) {
        return [];
    }

    const winners =
        pickWinners(
            participants,
            giveaway.winnerCount || 1
        );

    const channel =
        await client.channels.fetch(
            giveaway.channelId
        );

    if (!channel) {
        throw new Error(
            "Giveaway channel not found."
        );
    }

    const winnerText =
        winners
            .map(userId => `<@${userId}>`)
            .join(", ");

    const embed =
        new EmbedBuilder()
            .setColor(
                giveaway.color || "#5865F2"
            )
            .setTitle("🎲 Giveaway Rerolled!")
            .setDescription(
                `A new winner has been selected for **${giveaway.prize}**.`
            )
            .addFields(
                {
                    name: "<:giveaway:1548589044361855097> Prize",
                    value: giveaway.prize || "Unknown",
                    inline: true
                },
                {
                    name: "<:stolen_emoji:1548592481216757842> New Winner",
                    value: winnerText,
                    inline: false
                },
                {
                    name: "<:info:1548590600813813781> Giveaway ID",
                    value: `\`${giveaway.giveawayId}\``,
                    inline: false
                }
            )
            .setFooter({
                text: "Giveaway • Reroll"
            })
            .setTimestamp();

    if (giveaway.thumbnail) {
        embed.setThumbnail(
            giveaway.thumbnail
        );
    }

    await channel.send({
        content:
            `🎲 **Giveaway Reroll!**\n` +
            `<:stolen_emoji:1548592481216757842> New Winner: ${winnerText}`,
        embeds: [embed]
    });

    return winners;
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
                `<:cross:1548585531301044304> Please provide a giveaway ID.\n\n` +
                `Example: \`${process.env.PREFIX || "."}greroll GIVEAWAY_ID\``
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

        if (!giveaway.ended) {
            return message.reply(
                "<:cross:1548585531301044304> You can only reroll a giveaway after it has ended."
            );
        }

        const winners =
            await rerollGiveaway(
                message.client,
                giveaway
            );

        if (!winners.length) {
            return message.reply(
                "<:cross:1548585531301044304> This giveaway has no valid participants to reroll."
            );
        }

        return message.reply(
            `<:tick:1548589429235388446> Giveaway \`${giveaway.giveawayId}\` has been rerolled successfully.`
        );

    } catch (error) {

        console.error(
            "Greroll prefix command error:",
            error
        );

        return message.reply(
            "<:cross:1548585531301044304> Something went wrong while rerolling the giveaway."
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
                    "<:cross:1548585531301044304> Please provide a giveaway ID.",
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

        if (!giveaway.ended) {
            return interaction.reply({
                content:
                    "<:cross:1548585531301044304> You can only reroll a giveaway after it has ended.",
                ephemeral: true
            });
        }

        await interaction.deferReply({
            ephemeral: true
        });

        const winners =
            await rerollGiveaway(
                interaction.client,
                giveaway
            );

        if (!winners.length) {
            return interaction.editReply({
                content:
                    "<:cross:1548585531301044304> This giveaway has no valid participants to reroll."
            });
        }

        return interaction.editReply({
            content:
                `<:tick:1548589429235388446> Giveaway \`${giveaway.giveawayId}\` has been rerolled successfully.`
        });

    } catch (error) {

        console.error(
            "Greroll slash command error:",
            error
        );

        if (
            interaction.replied ||
            interaction.deferred
        ) {
            return interaction.editReply({
                content:
                    "<:cross:1548585531301044304> Something went wrong while rerolling the giveaway."
            }).catch(() => {});
        }

        return interaction.reply({
            content:
                "<:cross:1548585531301044304> Something went wrong while rerolling the giveaway.",
            ephemeral: true
        }).catch(() => {});
    }
}


module.exports = {
    name: "greroll",
    description: "Reroll an ended giveaway.",
    execute,
    executeSlash
};
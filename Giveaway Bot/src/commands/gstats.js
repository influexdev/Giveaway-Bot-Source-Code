const { EmbedBuilder } = require("discord.js");
const Giveaway = require("../database/models/Giveaway");

async function getStats(guildId) {
    const giveaways = await Giveaway.find({
        guildId
    });

    const total = giveaways.length;

    const active = giveaways.filter(
        giveaway => !giveaway.ended
    ).length;

    const ended = giveaways.filter(
        giveaway => giveaway.ended
    ).length;

    const totalParticipants = giveaways.reduce(
        (total, giveaway) => {
            const participants =
                giveaway.participants || [];

            return total + new Set(participants).size;
        },
        0
    );

    const totalWinners = giveaways.reduce(
        (total, giveaway) => {
            if (!giveaway.ended) return total;

            return total + (
                giveaway.winnerCount || 0
            );
        },
        0
    );

    const latestGiveaway =
        giveaways
            .sort(
                (a, b) =>
                    b.createdAt - a.createdAt
            )[0];

    return {
        total,
        active,
        ended,
        totalParticipants,
        totalWinners,
        latestGiveaway
    };
}

function createStatsEmbed(
    guild,
    stats
) {
    const embed =
        new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("<:stats_1:1548609064546730150> Giveaway Statistics")
            .setDescription(
                `Statistics for **${guild.name}**`
            )
            .addFields(
                {
                    name: "<:stolen_emoji:1548609267165306934> Total Giveaways",
                    value:
                        `\`${stats.total}\``,
                    inline: true
                },
                {
                    name: "<:stolen_emoji:1548591823860011079> Active",
                    value:
                        `\`${stats.active}\``,
                    inline: true
                },
                {
                    name: "<:stolen_emoji:1548591717429543012> Ended",
                    value:
                        `\`${stats.ended}\``,
                    inline: true
                },
                {
                    name: "<:icon_teams:1548592994939174962> Total Participants",
                    value:
                        `\`${stats.totalParticipants}\``,
                    inline: true
                },
                {
                    name: "<:stolen_emoji:1548592481216757842> Winners",
                    value:
                        `\`${stats.totalWinners}\``,
                    inline: true
                }
            );

    if (stats.latestGiveaway) {
        embed.addFields({
            name: "<:giveaway:1548589044361855097> Latest Giveaway",
            value:
                `**${stats.latestGiveaway.prize}**\n` +
                `🆔 \`${stats.latestGiveaway.giveawayId}\``,
            inline: false
        });
    } else {
        embed.addFields({
            name: "<:giveaway:1548589044361855097> Latest Giveaway",
            value:
                "No giveaways have been created yet.",
            inline: false
        });
    }

    embed
        .setFooter({
            text:
                "Giveaway Bot • Server Statistics"
        })
        .setTimestamp();

    return embed;
}

async function execute(message) {
    try {
        const stats =
            await getStats(
                message.guild.id
            );

        return message.reply({
            embeds: [
                createStatsEmbed(
                    message.guild,
                    stats
                )
            ]
        });

    } catch (error) {
        console.error(
            "Gstats prefix command error:",
            error
        );

        return message.reply(
            "<:cross:1548585531301044304> Something went wrong while fetching giveaway statistics."
        );
    }
}

async function executeSlash(interaction) {
    try {
        const stats =
            await getStats(
                interaction.guild.id
            );

        return interaction.reply({
            embeds: [
                createStatsEmbed(
                    interaction.guild,
                    stats
                )
            ]
        });

    } catch (error) {
        console.error(
            "Gstats slash command error:",
            error
        );

        return interaction.reply({
            content:
                "<:cross:1548585531301044304> Something went wrong while fetching giveaway statistics.",
            ephemeral: true
        });
    }
}

module.exports = {
    name: "gstats",
    description:
        "View giveaway statistics for this server.",
    execute,
    executeSlash
};
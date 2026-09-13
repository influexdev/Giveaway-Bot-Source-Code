const Giveaway = require("../database/models/Giveaway");
const { EmbedBuilder } = require("discord.js");

function parseDuration(duration) {
    const match = /^(\d+)\s*(s|m|h|d|w)$/i.exec(
        duration.trim()
    );

    if (!match) return null;

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();

    const multipliers = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
        w: 7 * 24 * 60 * 60 * 1000
    };

    return amount * multipliers[unit];
}


// =====================================================
// END GIVEAWAY
// =====================================================

async function endGiveaway(client, giveaway) {

    if (!giveaway || giveaway.ended) {
        return;
    }

    try {

        const channel =
            await client.channels.fetch(
                giveaway.channelId
            );

        if (!channel) {
            console.log(
                `Giveaway channel not found: ${giveaway.giveawayId}`
            );
            return;
        }


        // ==========================================
        // PICK WINNERS
        // ==========================================

        const participants = [
            ...new Set(giveaway.participants)
        ];

        let winners = [];

        if (participants.length > 0) {

            const shuffled =
                [...participants].sort(
                    () => Math.random() - 0.5
                );

            winners =
                shuffled.slice(
                    0,
                    Math.min(
                        giveaway.winnerCount,
                        participants.length
                    )
                );
        }


        // ==========================================
        // WINNER TEXT
        // ==========================================

        let winnerText;

        if (winners.length === 0) {

            winnerText =
                "<:dot:1548613485645144134> **No valid participants.**";

        } else {

            winnerText =
                winners
                    .map(userId => `<@${userId}>`)
                    .join(", ");
        }


        // ==========================================
        // GET GIVEAWAY MESSAGE
        // ==========================================

        let giveawayMessage = null;

        if (giveaway.messageId) {

            giveawayMessage =
                await channel.messages
                    .fetch(giveaway.messageId)
                    .catch(() => null);
        }


        // ==========================================
        // UPDATE GIVEAWAY EMBED
        // ==========================================

        if (giveawayMessage) {

            const endedEmbed =
                new EmbedBuilder()

                    .setColor(
                        giveaway.color || "#5865F2"
                    )

                    .setTitle(
                        `<:stolen_emoji:1548609267165306934> ${giveaway.title || "Giveaway"}`
                    )

                    .setDescription(
                        giveaway.description ||
                        "This giveaway has ended."
                    )

                    .addFields(
                        {
                            name: "<:giveaway:1548589044361855097> Prize",
                            value:
                                giveaway.prize,
                            inline: true
                        },
                        {
                            name: "<:stolen_emoji:1548592481216757842> Winners",
                            value:
                                winnerText,
                            inline: false
                        },
                        {
                            name: "<:stolen_emoji:1548611895047626772> Hosted By",
                            value:
                                `<@${giveaway.hostId}>`,
                            inline: true
                        }
                    )

                    .setFooter({
                        text:
                            "Giveaway • Ended"
                    });

            if (giveaway.thumbnail) {
                endedEmbed.setThumbnail(
                    giveaway.thumbnail
                );
            }


            await giveawayMessage.edit({
                embeds: [endedEmbed],
                components: []
            });
        }


        // ==========================================
        // SEND WINNER MESSAGE
        // ==========================================

        if (winners.length > 0) {

            await channel.send({
                content:
                    `<:stolen_emoji:1548609267165306934> **Giveaway Ended!**\n\n` +
                    `<:giveaway:1548589044361855097> Prize: **${giveaway.prize}**\n` +
                    `<:stolen_emoji:1548592481216757842> Winner${winners.length > 1 ? "s" : ""}: ${winnerText}`
            });

        } else {

            await channel.send({
                content:
                    `<:stolen_emoji:1548609267165306934> **Giveaway Ended!**\n` +
                    `<:giveaway:1548589044361855097> Prize: **${giveaway.prize}**\n` +
                    `No one entered the giveaway.`
            });
        }


        // ==========================================
        // MARK AS ENDED
        // ==========================================

        giveaway.ended = true;

        await giveaway.save();


        console.log(
            `Giveaway ended: ${giveaway.giveawayId}`
        );

    } catch (error) {

        console.error(
            `Failed to end giveaway ${giveaway.giveawayId}:`,
            error
        );
    }
}


// =====================================================
// CHECK EXPIRED GIVEAWAYS
// =====================================================

async function checkGiveaways(client) {

    try {

        const expiredGiveaways =
            await Giveaway.find({
                ended: false,
                endTime: {
                    $lte: new Date()
                }
            });


        for (const giveaway of expiredGiveaways) {

            await endGiveaway(
                client,
                giveaway
            );
        }

    } catch (error) {

        console.error(
            "Giveaway checker error:",
            error
        );
    }
}


// =====================================================
// START GIVEAWAY SYSTEM
// =====================================================

function startGiveawayManager(client) {

    console.log(
        "Giveaway manager started."
    );


    // Check immediately
    checkGiveaways(client);


    // Check every 5 seconds
    setInterval(() => {

        checkGiveaways(client);

    }, 5000);
}


module.exports = {
    parseDuration,
    endGiveaway,
    checkGiveaways,
    startGiveawayManager
};
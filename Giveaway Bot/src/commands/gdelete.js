const Giveaway = require("../database/models/Giveaway");

async function findGiveaway(source, giveawayId) {

    const guildId =
        source.guild.id;

    if (giveawayId) {

        return await Giveaway.findOne({
            giveawayId,
            guildId,
            ended: false
        });

    }

    return await Giveaway.findOne({
        guildId,
        ended: false
    }).sort({
        createdAt: -1
    });
}


// =====================================================
// PREFIX COMMAND
// =====================================================

async function execute(message, args) {

    try {

        const giveawayId =
            args[0] || null;

        const giveaway =
            await findGiveaway(
                message,
                giveawayId
            );

        if (!giveaway) {

            return message.reply(
                "<:cross:1548585531301044304> No active giveaway found."
            );

        }


        // =============================================
        // DELETE GIVEAWAY MESSAGE
        // =============================================

        try {

            const channel =
                await message.client.channels.fetch(
                    giveaway.channelId
                );

            if (channel && giveaway.messageId) {

                const giveawayMessage =
                    await channel.messages.fetch(
                        giveaway.messageId
                    ).catch(() => null);

                if (giveawayMessage) {

                    await giveawayMessage.delete()
                        .catch(() => {});

                }

            }

        } catch (error) {

            console.error(
                "<:cross:1548585531301044304> Failed to delete giveaway message:",
                error
            );

        }


        // =============================================
        // DELETE DATABASE ENTRY
        // =============================================

        await Giveaway.deleteOne({
            _id: giveaway._id
        });


        return message.reply({

            content:
                `<:delete:1548590273112580146> **Giveaway deleted successfully!**\n\n` +
                `<:giveaway:1548589044361855097> **Prize:** ${giveaway.prize}\n` +
                `<:info:1548590600813813781> **Giveaway ID:** \`${giveaway.giveawayId}\``

        });

    } catch (error) {

        console.error(
            "Gdelete prefix command error:",
            error
        );

        return message.reply(
            "Something went wrong while deleting the giveaway."
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


        const giveaway =
            await findGiveaway(
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


        // =============================================
        // DELETE GIVEAWAY MESSAGE
        // =============================================

        try {

            const channel =
                await interaction.client.channels.fetch(
                    giveaway.channelId
                );

            if (channel && giveaway.messageId) {

                const giveawayMessage =
                    await channel.messages.fetch(
                        giveaway.messageId
                    ).catch(() => null);

                if (giveawayMessage) {

                    await giveawayMessage.delete()
                        .catch(() => {});

                }

            }

        } catch (error) {

            console.error(
                "<:cross:1548585531301044304> Failed to delete giveaway message:",
                error
            );

        }


        // =============================================
        // DELETE DATABASE ENTRY
        // =============================================

        await Giveaway.deleteOne({
            _id: giveaway._id
        });


        return interaction.editReply({

            content:
                `<:delete:1548590273112580146> **Giveaway deleted successfully!**\n\n` +
                `<:giveaway:1548589044361855097> **Prize:** ${giveaway.prize}\n` +
                `<:info:1548590600813813781> **Giveaway ID:** \`${giveaway.giveawayId}\``

        });

    } catch (error) {

        console.error(
            "Gdelete slash command error:",
            error
        );


        if (
            interaction.replied ||
            interaction.deferred
        ) {

            return interaction.editReply({

                content:
                    "<:cross:1548585531301044304> Something went wrong while deleting the giveaway."

            }).catch(() => {});

        }


        return interaction.reply({

            content:
                "<:cross:1548585531301044304> Something went wrong while deleting the giveaway.",

            ephemeral: true

        }).catch(() => {});

    }

}


module.exports = {

    name: "gdelete",

    description:
        "Delete an active giveaway.",

    execute,

    executeSlash

};
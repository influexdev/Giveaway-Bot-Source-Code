const {
    EmbedBuilder
} = require("discord.js");


// =====================================================
// CREATE PING EMBED
// =====================================================

function createPingEmbed(botLatency, apiLatency) {

    return new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("<:pong:1548604730622873601> Pong!")
        .addFields(
            {
                name: "<:stolen_emoji:1548605132105588738> Bot Latency",
                value: `\`${botLatency}ms\``,
                inline: true
            },
            {
                name: "<:stolen_emoji:1548605261609046036> API Latency",
                value: `\`${apiLatency}ms\``,
                inline: true
            }
        )
        .setFooter({
            text: "Giveaway Bot"
        })
        .setTimestamp();
}


// =====================================================
// PREFIX COMMAND
// =====================================================

async function execute(message) {

    try {

        const start = Date.now();

        const reply = await message.reply({
            content: "<:stolen_emoji9:1548605394467815454> Pinging..."
        });

        const botLatency =
            Date.now() - start;

        const apiLatency =
            Math.round(
                message.client.ws.ping
            );

        const embed =
            createPingEmbed(
                botLatency,
                apiLatency
            );

        await reply.edit({
            content: null,
            embeds: [embed]
        });

    } catch (error) {

        console.error(
            "Gping prefix command error:",
            error
        );

        return message.reply(
            "<:cross:1548585531301044304> Something went wrong while checking bot latency."
        );

    }

}


// =====================================================
// SLASH COMMAND
// =====================================================

async function executeSlash(interaction) {

    try {

        const start = Date.now();

        await interaction.reply({
            content: "<:stolen_emoji9:1548605394467815454> Pinging..."
        });

        const botLatency =
            Date.now() - start;

        const apiLatency =
            Math.round(
                interaction.client.ws.ping
            );

        const embed =
            createPingEmbed(
                botLatency,
                apiLatency
            );

        return interaction.editReply({
            content: null,
            embeds: [embed]
        });

    } catch (error) {

        console.error(
            "Gping slash command error:",
            error
        );

    }

}


module.exports = {

    name: "gping",

    description:
        "Check the bot's latency.",

    execute,

    executeSlash

};
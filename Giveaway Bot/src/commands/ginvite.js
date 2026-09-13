const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

function createInviteEmbed(client) {
    const inviteURL =
        `https://discord.com/oauth2/authorize` +
        `?client_id=${client.user.id}` +
        `&scope=bot%20applications.commands` +
        `&permissions=8`;

    const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("<:stolen_emoji:1548596762678132776> Invite Giveaway Bot")
        .setDescription(
            " > Want to use this bot in another server?\n\n" +
            "Click the button below to invite the bot."
        )
        .addFields({
            name: "<:stolen_emoji:1548596978491986021> Invite Link",
            value: `[Click here to invite ${client.user.username}](${inviteURL})`
        })
        .setFooter({
            text: "Giveaway Bot • Invite"
        })
        .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel("Invite Bot")
            .setStyle(ButtonStyle.Link)
            .setURL(inviteURL)
    );

    return {
        embeds: [embed],
        components: [row]
    };
}

async function execute(message) {
    try {
        return message.reply(
            createInviteEmbed(message.client)
        );
    } catch (error) {
        console.error(
            "Ginvite prefix command error:",
            error
        );

        return message.reply(
            "<:cross:1548585531301044304> Something went wrong while creating the invite link."
        );
    }
}

async function executeSlash(interaction) {
    try {
        return interaction.reply(
            createInviteEmbed(interaction.client)
        );
    } catch (error) {
        console.error(
            "Ginvite slash command error:",
            error
        );

        return interaction.reply({
            content:
                "<:cross:1548585531301044304> Something went wrong while creating the invite link.",
            ephemeral: true
        });
    }
}

module.exports = {
    name: "ginvite",
    description: "Get an invite link for the bot.",
    execute,
    executeSlash
};
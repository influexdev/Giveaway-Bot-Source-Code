const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const GiveawayDraft = require("../database/models/GiveawayDraft");

function createEmbed(draft) {
    const embed = new EmbedBuilder()
        .setColor(draft.color || "#5865F2")
        .setTitle("<:giveaway:1548589044361855097> Giveaway")
        .addFields(
            {
                name: "Prize",
                value: draft.prize || "Not Set",
                inline: true
            },
            {
                name: "Winners",
                value: String(draft.winnerCount || 1),
                inline: true
            },
            {
                name: "Duration",
                value: draft.duration || "1h",
                inline: true
            }
        );

    if (draft.title) {
        embed.addFields({
            name: "Title",
            value: draft.title,
            inline: false
        });
    }

    if (draft.description) {
        embed.setDescription(draft.description);
    }

    if (draft.thumbnail) {
        embed.setThumbnail(draft.thumbnail);
    }

    return embed;
}

function createButtons() {
    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("gcreate_title")
            .setLabel("Title")
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId("gcreate_description")
            .setLabel("Description")
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId("gcreate_prize")
            .setLabel("Prize")
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId("gcreate_winners")
            .setLabel("Winner Count")
            .setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("gcreate_duration")
            .setLabel("Duration")
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId("gcreate_color")
            .setLabel("Color")
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId("gcreate_thumbnail")
            .setLabel("Thumbnail")
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId("gcreate_continue")
            .setLabel("Continue")
            .setStyle(ButtonStyle.Primary)
    );

    return [row1, row2];
}


// =========================
// PREFIX COMMAND
// =========================

async function execute(message) {
    // Create a completely NEW draft every time
    const draft = await GiveawayDraft.create({
        userId: message.author.id,
        guildId: message.guild.id,
        setupChannelId: message.channel.id,
        setupMessageId: "pending"
    });

    const setupMessage = await message.reply({
        embeds: [createEmbed(draft)],
        components: createButtons()
    });

    // Save this exact panel's message ID
    draft.setupMessageId = setupMessage.id;
    await draft.save();
}


// =========================
// SLASH COMMAND
// =========================

async function executeSlash(interaction) {
    // Create a completely NEW draft every time
    const draft = await GiveawayDraft.create({
        userId: interaction.user.id,
        guildId: interaction.guild.id,
        setupChannelId: interaction.channel.id,
        setupMessageId: "pending"
    });

    // Send the giveaway setup panel
    await interaction.reply({
        embeds: [createEmbed(draft)],
        components: createButtons()
    });

    // Get the exact interaction reply message
    const setupMessage = await interaction.fetchReply();

    // Save this exact panel's message ID
    draft.setupMessageId = setupMessage.id;
    await draft.save();
}


module.exports = {
    name: "gcreate",
    description: "Create a new giveaway.",

    // Prefix command
    execute,

    // Slash command
    executeSlash,

    // Helpers
    createEmbed,
    createButtons
};
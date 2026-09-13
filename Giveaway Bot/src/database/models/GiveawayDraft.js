const mongoose = require("mongoose");

const giveawayDraftSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },

        guildId: {
            type: String,
            required: true
        },

        setupChannelId: {
            type: String,
            required: true
        },

        setupMessageId: {
            type: String,
            required: true
        },

        title: {
            type: String,
            default: null
        },

        description: {
            type: String,
            default: null
        },

        prize: {
            type: String,
            default: "Not Set"
        },

        winnerCount: {
            type: Number,
            default: 1
        },

        duration: {
            type: String,
            default: "1h"
        },

        color: {
            type: String,
            default: "#5865F2"
        },

        thumbnail: {
            type: String,
            default: null
        },

        channelId: {
            type: String,
            default: null
        },

        completed: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "GiveawayDraft",
    giveawayDraftSchema
);
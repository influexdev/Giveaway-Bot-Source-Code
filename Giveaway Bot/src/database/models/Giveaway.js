const mongoose = require("mongoose");

const giveawaySchema = new mongoose.Schema(
    {
        giveawayId: {
            type: String,
            required: true,
            unique: true
        },

        guildId: {
            type: String,
            required: true
        },

        channelId: {
            type: String,
            required: true
        },

        messageId: {
            type: String,
            default: null
        },

        hostId: {
            type: String,
            required: true
        },

        title: {
            type: String,
            default: "Giveaway"
        },

        description: {
            type: String,
            default: null
        },

        prize: {
            type: String,
            required: true
        },

        winnerCount: {
            type: Number,
            default: 1
        },

        duration: {
            type: String,
            required: true
        },

        endTime: {
            type: Date,
            required: true
        },

        color: {
            type: String,
            default: "#5865F2"
        },

        thumbnail: {
            type: String,
            default: null
        },

        participants: {
            type: [String],
            default: []
        },

        ended: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Giveaway", giveawaySchema);
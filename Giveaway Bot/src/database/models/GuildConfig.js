const mongoose = require("mongoose");

const guildConfigSchema = new mongoose.Schema(
    {
        guildId: {
            type: String,
            required: true,
            unique: true
        },

        prefix: {
            type: String,
            default: "."
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "GuildConfig",
    guildConfigSchema
);
const { EmbedBuilder } = require("discord.js");
const GuildConfig = require("../database/models/GuildConfig");

async function getGuildConfig(guildId) {
    let config = await GuildConfig.findOne({ guildId });

    if (!config) {
        config = await GuildConfig.create({
            guildId,
            prefix: "."
        });
    }

    return config;
}

function createSuccessEmbed(prefix) {
    return new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("<:MekoPrefix:1548606606252572735> Prefix Updated")
        .setDescription(
            `The server prefix has been successfully changed to \`${prefix}\`.`
        )
        .addFields({
            name: "<:stolen_emoji:1548606953306194011> New Prefix",
            value: `\`${prefix}\``,
            inline: true
        })
        .setFooter({
            text: "Giveaway Bot • Server Configuration"
        })
        .setTimestamp();
}

async function execute(message, args) {
    try {
        if (!message.guild) return;

        const newPrefix = args.join(" ").trim();

        if (!newPrefix) {
            return message.reply(
                "<:cross:1548585531301044304> Please provide a new prefix.\n\n" +
                `Example: \`${process.env.PREFIX || "."}gprefix !\``
            );
        }

        if (newPrefix.length > 5) {
            return message.reply(
                "<:cross:1548585531301044304> The prefix cannot be longer than **5 characters**."
            );
        }

        if (/\s/.test(newPrefix)) {
            return message.reply(
                "<:cross:1548585531301044304> The prefix cannot contain spaces."
            );
        }

        const config = await getGuildConfig(
            message.guild.id
        );

        config.prefix = newPrefix;
        await config.save();

        return message.reply({
            embeds: [
                createSuccessEmbed(newPrefix)
            ]
        });

    } catch (error) {
        console.error(
            "Gprefix prefix command error:",
            error
        );

        return message.reply(
            "<:cross:1548585531301044304> Something went wrong while updating the prefix."
        );
    }
}

async function executeSlash(interaction) {
    try {
        if (!interaction.guild) return;

        const newPrefix =
            interaction.options
                .getString("prefix")
                .trim();

        if (newPrefix.length > 5) {
            return interaction.reply({
                content:
                    "<:cross:1548585531301044304> The prefix cannot be longer than **5 characters**.",
                ephemeral: true
            });
        }

        if (/\s/.test(newPrefix)) {
            return interaction.reply({
                content:
                    "<:cross:1548585531301044304> The prefix cannot contain spaces.",
                ephemeral: true
            });
        }

        const config = await getGuildConfig(
            interaction.guild.id
        );

        config.prefix = newPrefix;
        await config.save();

        return interaction.reply({
            embeds: [
                createSuccessEmbed(newPrefix)
            ]
        });

    } catch (error) {
        console.error(
            "Gprefix slash command error:",
            error
        );

        return interaction.reply({
            content:
                "<:cross:1548585531301044304> Something went wrong while updating the prefix.",
            ephemeral: true
        });
    }
}

module.exports = {
    name: "gprefix",
    description: "Change the giveaway bot prefix for this server.",
    execute,
    executeSlash
};
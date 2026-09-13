const {
    handlePrefixCommand
} = require("../handlers/commandHandler");

const GuildConfig =
    require("../database/models/GuildConfig");

module.exports = async (client, message) => {
    try {
        if (message.author.bot) return;
        if (!message.guild) return;

        const config =
            await GuildConfig.findOne({
                guildId: message.guild.id
            });

        // Default prefix for new servers
        const prefix =
            config?.prefix ||
            process.env.PREFIX ||
            ".";

        if (!message.content.startsWith(prefix)) {
            return;
        }

        await handlePrefixCommand(
            message,
            prefix
        );

    } catch (error) {
        console.error(
            "MessageCreate error:",
            error
        );
    }
};
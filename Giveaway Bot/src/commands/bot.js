const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];

    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (secs || parts.length === 0) {
        parts.push(`${secs}s`);
    }

    return parts.join(" ");
}

function getTotalUsers(client) {
    const users = new Set();

    for (const guild of client.guilds.cache.values()) {
        for (const member of guild.members.cache.values()) {
            if (!member.user.bot) {
                users.add(member.user.id);
            }
        }
    }

    return users.size;
}

function createBotInfoEmbed(client) {
    const inviteURL =
        `https://discord.com/oauth2/authorize` +
        `?client_id=${client.user.id}` +
        `&scope=bot%20applications.commands` +
        `&permissions=8`;

    const totalServers =
        client.guilds.cache.size;

    const totalUsers =
        getTotalUsers(client);

    const uptime =
        formatUptime(
            client.uptime || 0
        );

    const ping =
        Math.round(client.ws.ping);

    const embed =
        new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("<:stolen_emoji:1548585073308205086> Bot Information")
            .setThumbnail(
                client.user.displayAvatarURL({
                    size: 256
                })
            )
            .addFields(
                {
                    name: "Name",
                    value: client.user.username,
                    inline: true
                },
                {
                    name: "ID",
                    value: `\`${client.user.id}\``,
                    inline: true
                },
                {
                    name: "Total Servers",
                    value: `\`${totalServers}\``,
                    inline: true
                },
                {
                    name: "Users",
                    value:
                        `\`${totalUsers}\``,
                    inline: true
                },
                {
                    name: "Uptime",
                    value: `\`${uptime}\``,
                    inline: true
                },
                {
                    name: "Ping",
                    value: `\`${ping}ms\``,
                    inline: true
                }
            )
            .setFooter({
                text: "Giveaway Bot • Bot Information"
            })
            .setTimestamp();

    const row =
        new ActionRowBuilder().addComponents(
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

async function execute(message, args) {
    try {
        const subcommand =
            args[0]?.toLowerCase();

        if (subcommand !== "info") {
            return message.reply(
                `Unknown subcommand.\n\n` +
                `Use \`${process.env.PREFIX || "."}bot info\``
            );
        }

        return message.reply(
            createBotInfoEmbed(message.client)
        );

    } catch (error) {
        console.error(
            "Bot info prefix command error:",
            error
        );

        return message.reply(
            "Something went wrong while fetching bot information."
        );
    }
}

async function executeSlash(interaction) {
    try {
        return interaction.reply(
            createBotInfoEmbed(
                interaction.client
            )
        );

    } catch (error) {
        console.error(
            "Bot info slash command error:",
            error
        );

        return interaction.reply({
            content:
                "Something went wrong while fetching bot information.",
            ephemeral: true
        });
    }
}

module.exports = {
    name: "bot",
    description: "View bot information.",
    execute,
    executeSlash
};
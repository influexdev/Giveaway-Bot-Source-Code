const gcreate =
    require("../commands/gcreate");

const gend =
    require("../commands/gend");

const gdelete =
    require("../commands/gdelete");

const glist =
    require("../commands/glist");

const ginfo =
    require("../commands/ginfo");

const gping =
    require("../commands/gping");

const greroll =
    require("../commands/greroll");

const gprefix =
    require("../commands/gprefix");

const ginvite =
    require("../commands/ginvite");

const gstats =
    require("../commands/gstats");

const bot =
    require("../commands/bot");

const commands = new Map();

commands.set(
    gcreate.name,
    gcreate
);

commands.set(
    gend.name,
    gend
);

commands.set(
    gdelete.name,
    gdelete
);

commands.set(
    glist.name,
    glist
);

commands.set(
    ginfo.name,
    ginfo
);

commands.set(
    gping.name,
    gping
);

commands.set(
    greroll.name,
    greroll
);

commands.set(
    gprefix.name,
    gprefix
);

commands.set(
    ginvite.name,
    ginvite
);

commands.set(
    gstats.name,
    gstats
);

commands.set(
    bot.name,
    bot
);

async function handlePrefixCommand(
    message,
    prefix
) {
    if (message.author.bot) return;

    if (!prefix) return;

    if (!message.content.startsWith(prefix)) {
        return;
    }

    const content =
        message.content.slice(
            prefix.length
        ).trim();

    if (!content) return;

    const args =
        content.split(/\s+/);

    const commandName =
        args.shift()?.toLowerCase();

    if (!commandName) return;

    const command =
        commands.get(commandName);

    if (!command) return;

    try {
        await command.execute(
            message,
            args
        );

    } catch (error) {
        console.error(
            `Error in ${commandName}:`,
            error
        );

        await message.reply({
            content:
                "Something went wrong while executing this command."
        }).catch(() => {});
    }
}


module.exports = {
    handlePrefixCommand,
    commands
};
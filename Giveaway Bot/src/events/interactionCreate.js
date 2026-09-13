const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType
} = require("discord.js");

const GiveawayDraft =
    require("../database/models/GiveawayDraft");

const Giveaway =
    require("../database/models/Giveaway");

const gcreate =
    require("../commands/gcreate");

const gend =
    require("../commands/gend");

const glist =
    require("../commands/glist");

const ginfo =
    require("../commands/ginfo");    

const gping =
    require("../commands/gping");

const greroll =
    require("../commands/greroll");

const {
    parseDuration
} = require("../utils/giveawayManager");

const gdelete =
    require("../commands/gdelete");


// =====================================================
// SLASH COMMANDS
// =====================================================

const commands = {
    gcreate: gcreate,
    gend: gend,
    gdelete: gdelete,
    glist: glist,
    ginfo: ginfo,
    gping: gping,
    greroll: greroll
};


// =====================================================
// MAIN INTERACTION HANDLER
// =====================================================

module.exports = async (client, interaction) => {

    // =================================================
    // SLASH COMMAND
    // =================================================

    if (interaction.isChatInputCommand()) {

        const command =
            commands[interaction.commandName];

        if (!command) {

            return interaction.reply({
                content:
                    "<:cross:1548585531301044304> This command does not exist.",
                ephemeral: true
            });

        }

        try {

            if (command.executeSlash) {

                await command.executeSlash(
                    interaction
                );

            } else {

                await interaction.reply({
                    content:
                        "<:cross:1548585531301044304> This command is not configured correctly.",
                    ephemeral: true
                });

            }

        } catch (error) {

            console.error(
                `Slash command error (${interaction.commandName}):`,
                error
            );

            if (
                interaction.replied ||
                interaction.deferred
            ) {

                await interaction.followUp({
                    content:
                        "<:cross:1548585531301044304> Something went wrong while running this command.",
                    ephemeral: true
                }).catch(() => {});

            } else {

                await interaction.reply({
                    content:
                        "<:cross:1548585531301044304> Something went wrong while running this command.",
                    ephemeral: true
                }).catch(() => {});

            }

        }

        return;
    }


    // =================================================
    // ONLY BUTTONS BELOW
    // =================================================

    if (!interaction.isButton()) return;


    // =================================================
    // FINAL GIVEAWAY ENTER BUTTON
    // =================================================

    if (
        interaction.customId ===
        "giveaway_enter"
    ) {

        await handleGiveawayEntry(
            interaction
        );

        return;
    }


    // =================================================
    // ONLY GIVEAWAY SETUP BUTTONS
    // =================================================

    if (
        !interaction.customId.startsWith(
            "gcreate_"
        )
    ) {

        return;
    }


    // =================================================
    // FIND USER'S SPECIFIC DRAFT
    // =================================================

    const draft =
        await GiveawayDraft.findOne({

            userId:
                interaction.user.id,

            guildId:
                interaction.guild.id,

            setupMessageId:
                interaction.message.id,

            completed:
                false

        });


    if (!draft) {

        return interaction.reply({

            content:
                "<:cross:1548585531301044304> This giveaway setup could not be found or has already been completed.",

            ephemeral: true

        });

    }


    const action =
        interaction.customId.replace(
            "gcreate_",
            ""
        );


    // =================================================
    // TITLE
    // =================================================

    if (action === "title") {

        await interaction.reply({

            content:
                "**What title would you like to use for the giveaway?**\n" +
                "Please send the title in chat.",

            ephemeral: true

        });

        collectText(
            interaction,
            draft._id,
            "title"
        );

        return;
    }


    // =================================================
    // DESCRIPTION
    // =================================================

    if (action === "description") {

        await interaction.reply({

            content:
                "**What description would you like to use for the giveaway?**\n" +
                "Please send the description in chat.",

            ephemeral: true

        });

        collectText(
            interaction,
            draft._id,
            "description"
        );

        return;
    }


    // =================================================
    // PRIZE
    // =================================================

    if (action === "prize") {

        await interaction.reply({

            content:
                "**What prize would you like to give away?**\n" +
                "Please send the prize in chat.",

            ephemeral: true

        });

        collectText(
            interaction,
            draft._id,
            "prize"
        );

        return;
    }


    // =================================================
    // WINNER COUNT
    // =================================================

    if (action === "winners") {

        await interaction.reply({

            content:
                "**How many winners should this giveaway have?**\n" +
                "Please send a number between **1 and 100** in chat.",

            ephemeral: true

        });

        collectWinnerCount(
            interaction,
            draft._id
        );

        return;
    }


    // =================================================
    // DURATION
    // =================================================

    if (action === "duration") {

        await interaction.reply({

            content:
                "**How long should the giveaway last?**\n\n" +
                "Examples:\n" +
                "`30s` — 30 seconds\n" +
                "`1m` — 1 minute\n" +
                "`30m` — 30 minutes\n" +
                "`1h` — 1 hour\n" +
                "`1d` — 1 day\n" +
                "`1w` — 1 week\n\n" +
                "Please send the duration in chat.",

            ephemeral: true

        });

        collectDuration(
            interaction,
            draft._id
        );

        return;
    }


    // =================================================
    // COLOR
    // =================================================

    if (action === "color") {

        await interaction.reply({

            content:
                "**What color would you like to use for the giveaway embed?**\n" +
                "Please send a HEX color in chat.\n\n" +
                "Example: `#5865F2`",

            ephemeral: true

        });

        collectColor(
            interaction,
            draft._id
        );

        return;
    }


    // =================================================
    // THUMBNAIL
    // =================================================

    if (action === "thumbnail") {

        await interaction.reply({

            content:
                "**What thumbnail would you like to use for the giveaway?**\n" +
                "Please send an image URL in chat.\n\n" +
                "Send `none` if you do not want a thumbnail.",

            ephemeral: true

        });

        collectThumbnail(
            interaction,
            draft._id
        );

        return;
    }


    // =================================================
    // CONTINUE
    // =================================================

    if (action === "continue") {

        if (!draft.title) {

            return interaction.reply({

                content:
                    "<:cross:1548585531301044304> Please set a **Title** before continuing.",

                ephemeral: true

            });

        }


        if (
            !draft.prize ||
            draft.prize === "Not Set"
        ) {

            return interaction.reply({

                content:
                    "<:cross:1548585531301044304> Please set a **Prize** before continuing.",

                ephemeral: true

            });

        }


        if (
            !parseDuration(
                draft.duration
            )
        ) {

            return interaction.reply({

                content:
                    "<:cross:1548585531301044304> Invalid duration. Please set a valid duration such as `30s`, `1m`, `30m`, `1h`, or `1d`.",

                ephemeral: true

            });

        }


        await interaction.reply({

            content:
                "**Where would you like to set up the giveaway?**\n" +
                "Please mention the channel where you want the giveaway panel to be sent.\n\n" +
                "Example: `#giveaways`",

            ephemeral: true

        });


        collectChannel(
            interaction,
            draft._id
        );

    }

};


// =====================================================
// TEXT INPUT
// =====================================================

function collectText(
    interaction,
    draftId,
    field
) {

    const channel =
        interaction.channel;


    const filter =
        message =>
            message.author.id ===
                interaction.user.id &&
            !message.author.bot;


    const collector =
        channel.createMessageCollector({

            filter,

            time: 60000,

            max: 1

        });


    collector.on(
        "collect",
        async message => {

            const value =
                message.content.trim();


            if (!value) {

                await message.reply({

                    content:
                        "<:cross:1548585531301044304> Please provide a valid value."

                });

                return;

            }


            const draft =
                await GiveawayDraft.findById(
                    draftId
                );


            if (
                !draft ||
                draft.completed
            ) {

                return;

            }


            draft[field] =
                value;


            await draft.save();


            await message
                .delete()
                .catch(() => {});


            await updateSetupMessage(
                draft
            );


            await interaction.followUp({

                content:
                    `<:tick:1548589429235388446> **${formatField(field)} updated successfully.**`,

                ephemeral: true

            });

        }
    );


    collector.on(
        "end",
        async collected => {

            if (
                collected.size === 0
            ) {

                await interaction
                    .followUp({

                        content:
                            "<:timer_clone:1548594414719471648> You took too long to respond. Please click the button again.",

                        ephemeral: true

                    })
                    .catch(() => {});

            }

        }
    );

}


// =====================================================
// WINNER COUNT
// =====================================================

function collectWinnerCount(
    interaction,
    draftId
) {

    const channel =
        interaction.channel;


    const filter =
        message =>
            message.author.id ===
                interaction.user.id &&
            !message.author.bot;


    const collector =
        channel.createMessageCollector({

            filter,

            time: 60000,

            max: 1

        });


    collector.on(
        "collect",
        async message => {

            const count =
                Number(
                    message.content.trim()
                );


            if (
                !Number.isInteger(count) ||
                count < 1 ||
                count > 100
            ) {

                await message.reply({

                    content:
                        "<:cross:1548585531301044304> Invalid winner count. Please provide a number between **1 and 100**."

                });

                return;

            }


            const draft =
                await GiveawayDraft.findById(
                    draftId
                );


            if (
                !draft ||
                draft.completed
            ) {

                return;

            }


            draft.winnerCount =
                count;


            await draft.save();


            await message
                .delete()
                .catch(() => {});


            await updateSetupMessage(
                draft
            );


            await interaction.followUp({

                content:
                    "<:tick:1548589429235388446> **Winner count updated successfully.**",

                ephemeral: true

            });

        }
    );

}


// =====================================================
// DURATION
// =====================================================

function collectDuration(
    interaction,
    draftId
) {

    const channel =
        interaction.channel;


    const filter =
        message =>
            message.author.id ===
                interaction.user.id &&
            !message.author.bot;


    const collector =
        channel.createMessageCollector({

            filter,

            time: 60000,

            max: 1

        });


    collector.on(
        "collect",
        async message => {

            const value =
                message.content
                    .trim()
                    .toLowerCase();


            if (
                !parseDuration(value)
            ) {

                await message.reply({

                    content:
                        "<:cross:1548585531301044304> Invalid duration.\n\n" +
                        "Examples: `30s`, `1m`, `30m`, `1h`, `1d`, `1w`"

                });

                return;

            }


            const draft =
                await GiveawayDraft.findById(
                    draftId
                );


            if (
                !draft ||
                draft.completed
            ) {

                return;

            }


            draft.duration =
                value;


            await draft.save();


            await message
                .delete()
                .catch(() => {});


            await updateSetupMessage(
                draft
            );


            await interaction.followUp({

                content:
                    "<:tick:1548589429235388446> **Duration updated successfully.**",

                ephemeral: true

            });

        }
    );

}


// =====================================================
// COLOR
// =====================================================

function collectColor(
    interaction,
    draftId
) {

    const channel =
        interaction.channel;


    const filter =
        message =>
            message.author.id ===
                interaction.user.id &&
            !message.author.bot;


    const collector =
        channel.createMessageCollector({

            filter,

            time: 60000,

            max: 1

        });


    collector.on(
        "collect",
        async message => {

            const value =
                message.content.trim();


            if (
                !/^#[0-9A-F]{6}$/i.test(
                    value
                )
            ) {

                await message.reply({

                    content:
                        "<:cross:1548585531301044304> Invalid HEX color.\n\n" +
                        "Example: `#5865F2`"

                });

                return;

            }


            const draft =
                await GiveawayDraft.findById(
                    draftId
                );


            if (
                !draft ||
                draft.completed
            ) {

                return;

            }


            draft.color =
                value;


            await draft.save();


            await message
                .delete()
                .catch(() => {});


            await updateSetupMessage(
                draft
            );


            await interaction.followUp({

                content:
                    "<:tick:1548589429235388446> **Color updated successfully.**",

                ephemeral: true

            });

        }
    );

}


// =====================================================
// THUMBNAIL
// =====================================================

function collectThumbnail(
    interaction,
    draftId
) {

    const channel =
        interaction.channel;


    const filter =
        message =>
            message.author.id ===
                interaction.user.id &&
            !message.author.bot;


    const collector =
        channel.createMessageCollector({

            filter,

            time: 60000,

            max: 1

        });


    collector.on(
        "collect",
        async message => {

            let value =
                message.content.trim();


            if (
                value.toLowerCase() ===
                "none"
            ) {

                value = null;

            } else {

                try {

                    new URL(value);

                } catch {

                    await message.reply({

                        content:
                            "<:cross:1548585531301044304> Invalid image URL. Please provide a valid URL or send `none`."

                    });

                    return;

                }

            }


            const draft =
                await GiveawayDraft.findById(
                    draftId
                );


            if (
                !draft ||
                draft.completed
            ) {

                return;

            }


            draft.thumbnail =
                value;


            await draft.save();


            await message
                .delete()
                .catch(() => {});


            await updateSetupMessage(
                draft
            );


            await interaction.followUp({

                content:
                    "<:tick:1548589429235388446> **Thumbnail updated successfully.**",

                ephemeral: true

            });

        }
    );

}


// =====================================================
// CHANNEL
// =====================================================

function collectChannel(
    interaction,
    draftId
) {

    const channel =
        interaction.channel;


    const filter =
        message =>
            message.author.id ===
                interaction.user.id &&
            !message.author.bot;


    const collector =
        channel.createMessageCollector({

            filter,

            time: 60000,

            max: 1

        });


    collector.on(
        "collect",
        async message => {

            const selectedChannel =
                message.mentions.channels.first();


            if (
                !selectedChannel ||
                selectedChannel.type !==
                    ChannelType.GuildText
            ) {

                await message.reply({

                    content:
                        "<:cross:1548585531301044304> Invalid channel. Please mention a valid text channel."

                });

                return;

            }


            const draft =
                await GiveawayDraft.findById(
                    draftId
                );


            if (
                !draft ||
                draft.completed
            ) {

                return;

            }


            draft.channelId =
                selectedChannel.id;


            await draft.save();


            await message
                .delete()
                .catch(() => {});


            // ======================================
            // CREATE END TIME
            // ======================================

            const durationMs =
                parseDuration(
                    draft.duration
                );


            const endTime =
                new Date(
                    Date.now() +
                    durationMs
                );


            // ======================================
            // CREATE GIVEAWAY ID
            // ======================================

            const giveawayId =
                `${interaction.guild.id}-${Date.now()}`;


            // ======================================
            // CREATE GIVEAWAY DATABASE ENTRY
            // ======================================

            const giveaway =
                await Giveaway.create({

                    giveawayId,

                    guildId:
                        interaction.guild.id,

                    channelId:
                        selectedChannel.id,

                    hostId:
                        interaction.user.id,

                    title:
                        draft.title ||
                        "Giveaway",

                    description:
                        draft.description ||
                        null,

                    prize:
                        draft.prize,

                    winnerCount:
                        draft.winnerCount,

                    duration:
                        draft.duration,

                    endTime,

                    color:
                        draft.color ||
                        "#5865F2",

                    thumbnail:
                        draft.thumbnail ||
                        null,

                    participants: [],

                    ended: false

                });


            // ======================================
            // GIVEAWAY EMBED
            // ======================================

            const giveawayEmbed =
                new EmbedBuilder()

                    .setColor(
                        draft.color ||
                        "#5865F2"
                    )

                    .setTitle(
                        draft.title ||
                        "<:giveaway:1548589044361855097> Giveaway"
                    )

                    .setDescription(
                        draft.description ||
                        "Click the button below to enter this giveaway!"
                    )

                    .addFields(

                        {
                            name:
                                "<:stolen_emoji:1548609267165306934> Prize",

                            value:
                                draft.prize ||
                                "Not Set",

                            inline: true
                        },

                        {
                            name:
                                "<:stolen_emoji:1548592481216757842> Winners",

                            value:
                                String(
                                    draft.winnerCount ||
                                    1
                                ),

                            inline: true
                        },

                        {
                            name:
                                "<:timer_clone:1548594414719471648> Duration",

                            value:
                                draft.duration ||
                                "1h",

                            inline: true
                        },

                        {
                            name:
                                "<:stolen_emoji:1548611895047626772> Hosted By",

                            value:
                                `<@${interaction.user.id}>`,

                            inline: true
                        }

                    )

                    // ==================================
                    // GIVEAWAY ID
                    // ==================================

                    .setFooter({

                        text:
                            `Giveaway ID: ${giveawayId}`

                    });


            if (
                draft.thumbnail
            ) {

                giveawayEmbed
                    .setThumbnail(
                        draft.thumbnail
                    );

            }


            // ======================================
            // ENTER BUTTON
            // ======================================

            const giveawayButton =
                new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()

                            .setCustomId(
                                "giveaway_enter"
                            )

                            .setLabel(
                                "Enter Giveaway"
                            )

                            .setStyle(
                                ButtonStyle.Primary
                            )

                    );


            // ======================================
            // SEND GIVEAWAY
            // ======================================

            try {

                const giveawayMessage =
                    await selectedChannel.send({

                        embeds: [
                            giveawayEmbed
                        ],

                        components: [
                            giveawayButton
                        ]

                    });


                giveaway.messageId =
                    giveawayMessage.id;


                await giveaway.save();


                draft.completed =
                    true;


                await draft.save();


                // ==================================
                // DISABLE SETUP BUTTONS
                // ==================================

                const disabledRows =
                    gcreate
                        .createButtons()
                        .map(row => {

                            row.components.forEach(
                                button => {

                                    button.setDisabled(
                                        true
                                    );

                                }
                            );

                            return row;

                        });


                const setupChannel =
                    await interaction.guild
                        .channels
                        .fetch(
                            draft.setupChannelId
                        );


                const setupMessage =
                    await setupChannel
                        .messages
                        .fetch(
                            draft.setupMessageId
                        );


                await setupMessage.edit({

                    components:
                        disabledRows

                });


                // ==================================
                // SUCCESS MESSAGE
                // ==================================

                await message.channel.send({

                    content:
                        `<:tick:1548589429235388446> **Giveaway created successfully!**\n\n` +
                        `<:stolen_emoji:1548609267165306934> **Prize:** ${draft.prize}\n` +
                        `<:stolen_emoji:1548592481216757842> **Winners:** ${draft.winnerCount}\n` +
                        `<:timer_clone:1548594414719471648> **Duration:** ${draft.duration}\n` +
                        `<:stolen_emoji:1548594623457525771> **Channel:** ${selectedChannel}\n` +
                        `<:info:1548590600813813781> **Giveaway ID:** \`${giveawayId}\`\n\n` +
                        `Use \`.gend ${giveawayId}\` to manually end this giveaway.`

                });


                console.log(
                    `Giveaway created: ${giveawayId}`
                );


            } catch (error) {

                console.error(
                    "Failed to create giveaway:",
                    error
                );


                await message.channel.send({

                    content:
                        "<:cross:1548585531301044304> I couldn't send the giveaway panel to that channel. Please make sure I have permission to send messages and embed links there."

                });

            }

        }
    );


    collector.on(
        "end",
        async collected => {

            if (
                collected.size === 0
            ) {

                await interaction
                    .followUp({

                        content:
                            "<:timer_clone:1548594414719471648> You took too long to select a channel. Please click **Continue** again.",

                        ephemeral: true

                    })
                    .catch(() => {});

            }

        }
    );

}


// =====================================================
// UPDATE SETUP PANEL
// =====================================================

async function updateSetupMessage(
    draft
) {

    try {

        const channel =
            await globalClient.channels.fetch(
                draft.setupChannelId
            );


        if (!channel) return;


        const message =
            await channel.messages.fetch(
                draft.setupMessageId
            );


        await message.edit({

            embeds: [
                gcreate.createEmbed(
                    draft
                )
            ],

            components:
                gcreate.createButtons()

        });

    } catch (error) {

        console.error(
            "Failed to update setup panel:",
            error
        );

    }

}


// =====================================================
// ENTER GIVEAWAY
// =====================================================

async function handleGiveawayEntry(
    interaction
) {

    const giveaway =
        await Giveaway.findOne({

            guildId:
                interaction.guild.id,

            messageId:
                interaction.message.id

        });


    if (!giveaway) {

        return interaction.reply({

            content:
                "<:cross:1548585531301044304> This giveaway could not be found.",

            ephemeral: true

        });

    }


    if (giveaway.ended) {

        return interaction.reply({

            content:
                "<:timer_clone:1548594414719471648> This giveaway has already ended.",

            ephemeral: true

        });

    }


    if (
        new Date() >=
        giveaway.endTime
    ) {

        return interaction.reply({

            content:
                "<:timer_clone:1548594414719471648> This giveaway has already ended.",

            ephemeral: true

        });

    }


    const userId =
        interaction.user.id;


    if (
        giveaway.participants.includes(
            userId
        )
    ) {

        return interaction.reply({

            content:
                "<:info:1548590600813813781> You are already participating in this giveaway.",

            ephemeral: true

        });

    }


    giveaway.participants.push(
        userId
    );


    await giveaway.save();


    await interaction.reply({

        content:
            "<:tick:1548589429235388446> **You have successfully entered the giveaway!**\n" +
            "Good luck! 🍀",

        ephemeral: true

    });

}


// =====================================================
// FORMAT FIELD
// =====================================================

function formatField(field) {

    const names = {

        title:
            "Title",

        description:
            "Description",

        prize:
            "Prize",

        winnerCount:
            "Winner Count",

        duration:
            "Duration",

        color:
            "Color",

        thumbnail:
            "Thumbnail"

    };


    return names[field] || field;

}


// =====================================================
// GLOBAL CLIENT
// =====================================================

let globalClient;


module.exports.setClient =
    client => {

        globalClient =
            client;

    };
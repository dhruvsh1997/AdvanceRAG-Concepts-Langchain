const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const config = require("../../config");

const roasts = [

    "Your brain is on airplane mode.",

    "You bring everyone so much joy... when you leave.",

    "You're proof that evolution can go backwards.",

    "You have something on your chin... no, the third one.",

    "Your secrets are always safe with me. I never listen."
];

module.exports = {

    data: new SlashCommandBuilder()

        .setName("roast")

        .setDescription("Roast a user")

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("Target user")
                .setRequired(true)
        ),

    async execute(interaction) {

        const user =
        interaction.options.getUser("user");

        const roast =
        roasts[Math.floor(Math.random() * roasts.length)];

        const embed =
        new EmbedBuilder()

            .setColor(config.bot.color)

            .setTitle("◈ Roast Machine")

            .setDescription(`

${user}

${config.emojis.reply}
\`${roast}\`
            `);

        await interaction.reply({
            embeds: [embed]
        });
    }
};
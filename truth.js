const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const config = require("../../config");

const truths = [

    "What is your biggest fear?",

    "Who was your first crush?",

    "What secret are you hiding?",

    "What is your most embarrassing moment?",

    "What is your worst habit?"
];

module.exports = {

    data: new SlashCommandBuilder()

        .setName("truth")

        .setDescription("Truth question"),

    async execute(interaction) {

        const truth =
        truths[Math.floor(Math.random() * truths.length)];

        const embed =
        new EmbedBuilder()

            .setColor(config.bot.color)

            .setTitle("◈ Truth")

            .setDescription(`

${config.emojis.reply}
\`${truth}\`
            `);

        await interaction.reply({
            embeds: [embed]
        });
    }
};
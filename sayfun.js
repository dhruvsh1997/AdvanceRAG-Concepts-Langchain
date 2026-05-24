const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const config = require("../../config");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("sayfun")

        .setDescription("Fun say command")

        .addStringOption(option =>
            option
                .setName("text")
                .setDescription("Message")
                .setRequired(true)
        ),

    async execute(interaction) {

        const text =
        interaction.options.getString("text");

        const embed =
        new EmbedBuilder()

            .setColor(config.bot.color)

            .setDescription(text);

        await interaction.reply({
            embeds: [embed]
        });
    }
};
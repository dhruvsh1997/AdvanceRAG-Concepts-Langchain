const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const config = require("../../config");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("slap")

        .setDescription("Slap someone")

        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("Target user")
                .setRequired(true)
        ),

    async execute(interaction) {

        const user =
        interaction.options.getUser("user");

        const embed =
        new EmbedBuilder()

            .setColor(config.bot.color)

            .setTitle("◈ Slap")

            .setDescription(`

${interaction.user}
slapped
${user}

${config.emojis.reply} Damage Critical.
            `);

        await interaction.reply({
            embeds: [embed]
        });
    }
};
const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const config = require("../../config");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("ship")

        .setDescription("Ship two users")

        .addUserOption(option =>
            option
                .setName("user1")
                .setDescription("First user")
                .setRequired(true)
        )

        .addUserOption(option =>
            option
                .setName("user2")
                .setDescription("Second user")
                .setRequired(true)
        ),

    async execute(interaction) {

        const user1 =
        interaction.options.getUser("user1");

        const user2 =
        interaction.options.getUser("user2");

        const percent =
        Math.floor(Math.random() * 101);

        const embed = new EmbedBuilder()

            .setColor(config.bot.color)

            .setTitle("◈ Ship Result")

            .setDescription(`

${user1}
♡
${user2}

${config.emojis.reply} Compatibility:
\`${percent}%\`
            `);

        await interaction.reply({
            embeds: [embed]
        });
    }
};
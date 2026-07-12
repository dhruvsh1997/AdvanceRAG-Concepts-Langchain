const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {

    customId: "chat_back",

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("🏆 Hussan • Level Up Setup")
            .setDescription("Choose which leveling system you want to configure.")
            .setFooter({ text: "Hussan Level System" });

        const row = new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId("level_chat")
                .setLabel("Chat Level")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("level_voice")
                .setLabel("Voice Level")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("level_close")
                .setLabel("Close")
                .setStyle(ButtonStyle.Danger)

        );

        await interaction.update({
            embeds: [embed],
            components: [row]
        });

    }

};
const {
    EmbedBuilder,
    ActionRowBuilder,
    ChannelSelectMenuBuilder,
    ChannelType
} = require("discord.js");

module.exports = {

    customId: "chat_channel",

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("💬 Hussan • Select Level Up Channel")
            .setDescription(
`Select the channel where level up messages will be sent.

After selecting a channel, you will automatically return to the Chat Level Setup panel.`
            );

        const row = new ActionRowBuilder().addComponents(

            new ChannelSelectMenuBuilder()
                .setCustomId("chat_level_channel")
                .setPlaceholder("Select a channel...")
                .addChannelTypes(ChannelType.GuildText)

        );

        await interaction.update({
            embeds: [embed],
            components: [row]
        });

    }

};
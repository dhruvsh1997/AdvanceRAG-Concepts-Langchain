const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {

    customId: "level_chat",

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("💬 Hussan • Chat Level Setup")
            .setDescription(
`**Level Up Channel**
> Not Configured

**XP Required**
> 100 XP

**Reward Roles**
> 0 Configured`
            )
            .setFooter({ text: "Hussan Level System" });

        const row1 = new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId("chat_channel")
                .setLabel("Set Channel")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("chat_xp")
                .setLabel("Set XP")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("chat_rewards")
                .setLabel("Reward Roles")
                .setStyle(ButtonStyle.Success)

        );

        const row2 = new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId("chat_back")
                .setLabel("Back")
                .setStyle(ButtonStyle.Secondary)

        );

        await interaction.update({
            embeds: [embed],
            components: [row1, row2]
        });

    }

};
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {

    customId: "chat_rewards",

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("🎁 Hussan • Chat Reward Roles")
            .setDescription(
`Configure reward roles for chat levels.

**Configured Roles**
> 0

Choose an option below.`
            );

        const row1 = new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId("reward_add")
                .setLabel("Add Role")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("reward_remove")
                .setLabel("Remove Role")
                .setStyle(ButtonStyle.Danger)

        );

        const row2 = new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId("reward_view")
                .setLabel("View Roles")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("reward_back")
                .setLabel("Back")
                .setStyle(ButtonStyle.Secondary)

        );

        await interaction.update({
            embeds: [embed],
            components: [row1, row2]
        });

    }

};
const {
    EmbedBuilder
} = require("discord.js");

module.exports = {

    customId: "chat_xp",

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("💬 Hussan • Set Chat XP")
            .setDescription(
`Send the XP required to level up.

Example:
100

Type **cancel** to cancel.`
            );

        await interaction.update({
            embeds: [embed],
            components: []
        });

        const filter = m => m.author.id === interaction.user.id;

        const collector = interaction.channel.createMessageCollector({
            filter,
            time: 60000,
            max: 1
        });

        collector.on("collect", async (msg) => {

            if (msg.content.toLowerCase() === "cancel") {

                await msg.delete().catch(() => {});

                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Red")
                            .setTitle("❌ Cancelled")
                    ],
                    components: []
                });

            }

            const xp = Number(msg.content);

            if (isNaN(xp) || xp <= 0) {

                await msg.delete().catch(() => {});

                return interaction.followUp({
                    content: "❌ Please send a valid number.",
                    ephemeral: true
                });

            }

            await msg.delete().catch(() => {});

            // TODO: Save XP to SQLite

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Green")
                        .setTitle("✅ XP Updated")
                        .setDescription(`Level XP set to **${xp} XP**.`)
                ],
                components: []
            });

            setTimeout(async () => {

                const {
                    EmbedBuilder,
                    ActionRowBuilder,
                    ButtonBuilder,
                    ButtonStyle
                } = require("discord.js");

                const embed = new EmbedBuilder()
                    .setColor("#5865F2")
                    .setTitle("💬 Hussan • Chat Level Setup")
                    .setDescription(
`**Level Up Channel**
> Not Configured

**XP Required**
> ${xp} XP

**Reward Roles**
> 0 Configured`
                    );

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

                await interaction.editReply({
                    embeds: [embed],
                    components: [row1, row2]
                });

            }, 1000);

        });

    }

};
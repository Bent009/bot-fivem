const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const servers =
    require("../../servers.json");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("serverlist")
        .setDescription(
            "Melihat daftar server"
        ),

    async execute(interaction) {

        const list =
            Object.entries(servers)
                .map(
                    ([key, data]) =>
                        `• \`${key}\` → ${data.name}`
                )
                .join("\n");

        const embed =
            new EmbedBuilder()
                .setTitle(
                    "📋 Daftar Server"
                )
                .setColor("#22c55e")
                .setDescription(
                    list ||
                    "Belum ada server"
                );

        await interaction.reply({
            embeds: [embed]
        });
    }
};
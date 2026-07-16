const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {

    name: "help",

    async execute(interaction) {

        const embed =
            new EmbedBuilder()

                .setColor("#008000")

                .setTitle(
                    "🤖 TON - BOT Help Center"
                )

                .setDescription(
                    "Selamat datang di pusat bantuan TON - BOT.\n\n" +
                    "📊 Total Commands: **27**\n\n" +
                    "Pilih kategori menggunakan tombol di bawah."
                )

                .addFields(

                    {
                        name: "🎵 Music",
                        value:
                            "Command musik dan audio."
                    },

                    {
                        name: "🎮 FiveM",
                        value:
                            "Informasi server dan player FiveM."
                    },

                    {
                        name: "🛠 Utility",
                        value:
                            "Utility dan informasi Discord."
                    },

                    {
                        name: "📖 About",
                        value:
                            "Informasi bot."
                    }

                );

        const row =
            new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            "help_music"
                        )
                        .setLabel(
                            "🎵 Music"
                        )
                        .setStyle(
                            ButtonStyle.Primary
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            "help_fivem"
                        )
                        .setLabel(
                            "🎮 FiveM"
                        )
                        .setStyle(
                            ButtonStyle.Success
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            "help_utility"
                        )
                        .setLabel(
                            "🛠 Utility"
                        )
                        .setStyle(
                            ButtonStyle.Secondary
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            "help_about"
                        )
                        .setLabel(
                            "📖 About"
                        )
                        .setStyle(
                            ButtonStyle.Danger
                        )

                );

        return interaction.reply({
            embeds: [embed],
            components: [row]
        });

    }

};
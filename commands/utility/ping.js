const {
    EmbedBuilder
} = require("discord.js");

module.exports = {

    name: "ping",

    async execute(interaction) {

        const sent =
            await interaction.reply({
                content: "🏓 Mengukur ping...",
                fetchReply: true
            });

        const botLatency =
            sent.createdTimestamp -
            interaction.createdTimestamp;

        const apiLatency =
            Math.round(
                interaction.client.ws.ping
            );

        const embed =
            new EmbedBuilder()

                .setColor("#57F287")

                .setTitle("🏓 Pong!")

                .addFields(
                    {
                        name: "Bot Latency",
                        value:
                            `${botLatency}ms`,
                        inline: true
                    },
                    {
                        name: "API Latency",
                        value:
                            `${apiLatency}ms`,
                        inline: true
                    }
                )

                .setTimestamp();

        return interaction.editReply({
            content: null,
            embeds: [embed]
        });

    }

};
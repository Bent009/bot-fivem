const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

function buildPlayerPage(data, page) {

    const {
        players,
        serverName
    } = data;

    const pageSize = 100;

    const totalPages =
        Math.ceil(
            players.length / pageSize
        );

    const start =
        page * pageSize;

    const end =
        start + pageSize;

    const chunk =
        players.slice(
            start,
            end
        );

    const list =
        chunk.map(
            (player, index) => {

                let pingIcon =
                    "🟢";

                if (
                    player.ping > 100
                ) {
                    pingIcon =
                        "🔴";
                } else if (
                    player.ping > 50
                ) {
                    pingIcon =
                        "🟡";
                }

                return `${start + index + 1}. ${pingIcon} [${player.id}] ${player.name} (${player.ping}ms)`;

            }
        ).join("\n");

    const embed =
        new EmbedBuilder()

            .setColor(
                "#2b2d31"
            )

            .setTitle(
                `👥 ${serverName}`
            )

            .setDescription(
                list || "Tidak ada player."
            )

            .addFields({
                name:
                    "📊 Statistik",
                value:
                    `Player Online: **${players.length}**`,
                inline: false
            })

            .setFooter({
                text:
                    `Halaman ${page + 1}/${totalPages}`
            })

            .setTimestamp();

    const row =
        new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()
                    .setCustomId("players_first")
                    .setLabel("⏮ First")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === 0),

                new ButtonBuilder()
                    .setCustomId("players_prev")
                    .setLabel("⬅️ Prev")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === 0),

                new ButtonBuilder()
                    .setCustomId("players_jump")
                    .setLabel("🔢 Jump")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("players_next")
                    .setLabel("➡️ Next")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page >= totalPages - 1),

                new ButtonBuilder()
                    .setCustomId("players_last")
                    .setLabel("⏭ Last")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page >= totalPages - 1)

            );

    return {
        embed,
        row
    };
}

module.exports = {
    buildPlayerPage
};
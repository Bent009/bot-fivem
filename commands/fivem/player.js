const {
    EmbedBuilder
} = require("discord.js");

const axios = require("axios");
const servers =
    require("../../servers.json");

const {
    buildPlayerPage
} = require(
    "../../utils/playerPagination"
);

const cache =
    new Map();

async function getPlayers(server) {

    if (server.address) {

        try {

            const res =
                await axios.get(
                    `http://${server.address}/players.json`,
                    {
                        timeout: 5000
                    }
                );

            return res.data;

        } catch (err) {

            console.log(
                `[DIRECT FAIL] ${server.name}`
            );

        }

    }

    if (server.code) {

        const res =
            await axios.get(
                `https://fivestats.io/api/servers/${server.code}/players`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${process.env.FIVESTATS_API_KEY}`
                    }
                }
            );

        return res.data;

    }

    throw new Error(
        "Server tidak memiliki address atau code."
    );

}

module.exports = {

    name: "player",

    async execute(interaction) {

        const serverKey =
            interaction.options.getString(
                "server",
                true
            );

        const keyword =
            interaction.options.getString(
                "nama",
                true
            );

        if (!servers[serverKey]) {

            return interaction.reply({
                content:
                    "❌ Server tidak ditemukan."
            });

        }

        await interaction.deferReply();

        try {

            const started =
                Date.now();

            const players =
                await getPlayers(
                    servers[serverKey]
                );

            const search =
                keyword.toLowerCase();

            const found =
                players.filter(player =>
                    player.name
                        .toLowerCase()
                        .includes(search)
                );

            if (!found.length) {

                return interaction.editReply({
                    content:
                        "❌ Player tidak ditemukan."
                });

            }

            const p1 = [];
            const p2 = [];
            const p3 = [];

            for (const player of found) {

                const name =
                    player.name.toLowerCase();

                if (
                    name.startsWith(search)
                ) {

                    p1.push(player);
                    continue;

                }

                const words =
                    name.split(
                        /[\s\-_=\[\]\(\)]+/
                    );

                if (
                    words.includes(search)
                ) {

                    p2.push(player);
                    continue;

                }

                p3.push(player);

            }

            const formatPlayer =
                (p) => {

                    let pingIcon =
                        "🟢";

                    if (p.ping > 100)
                        pingIcon = "🔴";
                    else if (p.ping > 50)
                        pingIcon = "🟡";

                    return `${pingIcon} \`${p.id}\` ${p.name} \`${p.ping}ms\``;

                };

            const embed =
                new EmbedBuilder()

                    .setColor(
                        "#1E5631"
                    )

                    .setTitle(
                        `👥 Hasil Pencarian: ${keyword.toUpperCase()}`
                    )

                    .setDescription(
                        `🏰 **Server:** ${servers[serverKey].name}\n` +
                        `📊 **Total Player Online:** ${players.length}\n` +
                        `🔍 **Total Ditemukan:** ${found.length}`
                    )

                    .addFields(
                        {
                            name:
                                "📋 Hasil Pencarian 1",
                            value:
                                p1.length
                                    ? p1.map(formatPlayer)
                                        .join("\n")
                                        .slice(
                                            0,
                                            1024
                                        )
                                    : "-",
                            inline: true
                        },
                        {
                            name:
                                "📋 Hasil Pencarian 2",
                            value:
                                p2.length
                                    ? p2.map(formatPlayer)
                                        .join("\n")
                                        .slice(
                                            0,
                                            1024
                                        )
                                    : "-",
                            inline: true
                        },
                        {
                            name:
                                "📋 Hasil Lanjutan",
                            value:
                                p3.length
                                    ? p3.map(formatPlayer)
                                        .join("\n")
                                        .slice(
                                            0,
                                            1024
                                        )
                                    : "-",
                            inline: true
                        }
                    )

                    .setFooter({
                        text:
                            `Pencarian selesai dalam ${Date.now() - started} ms`
                    })

                    .setTimestamp();

            return interaction.editReply({
                embeds: [embed]
            });

        } catch (err) {

            console.error(err);

            return interaction.editReply({
                content:
                    "❌ Gagal mengambil data player."
            });

        }

    }

};
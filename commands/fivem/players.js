const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const axios = require("axios");
const servers = require("../../servers.json");

const {
    buildPlayerPage
} = require(
    "../../utils/playerPagination"
);

const cache = new Map();

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

    name: "players",

    cache,

    async execute(interaction) {

        const serverKey =
            interaction.options.getString(
                "server",
                true
            );

        if (!servers[serverKey]) {

            return interaction.reply({
                content:
                    "❌ Server tidak ditemukan."
            });

        }

        console.log(
            "PLAYERS COMMAND",
            interaction.id
        );

        await interaction.deferReply();

        console.log(
            "DEFER SUCCESS",
            interaction.id
        );

        try {

            const players =
                await getPlayers(
                    servers[serverKey]
                );

            const cacheKey =
                `${interaction.guildId}_${interaction.user.id}`;

            cache.set(
                cacheKey,
                {
                    players,
                    serverName:
                        servers[serverKey].name
                }
            );

            setTimeout(() => {

                cache.delete(
                    cacheKey
                );

            }, 300000);

            const {
                embed,
                row
            } =
                buildPlayerPage(
                    {
                        players,
                        serverName:
                            servers[serverKey].name
                    },
                    0
                );

            return interaction.editReply({
                embeds: [embed],
                components: [row]
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
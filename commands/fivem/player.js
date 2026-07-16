const { EmbedBuilder } = require("discord.js");
const axios = require("axios");
const path = require("path");

// 1. PERBAIKAN PATH: Menggunakan process.cwd() agar aman dari masalah kedalaman folder (../) di Linux Azure
const servers = require(path.join(process.cwd(), "servers.json"));

// HAPUS REQUIRE "playerPagination" karena tidak dipakai sama sekali dan rawan memicu Crash Case-Sensitive di Linux.

const cache = new Map();

async function getPlayers(server) {
    let directError = "";

    // A. Coba jalur langsung (IP Server)
    if (server.address) {
        try {
            // Turunkan timeout menjadi 4 detik agar cepat pindah ke API cadangan jika diblokir
            const res = await axios.get(`http://${server.address}/players.json`, { timeout: 4000 });
            return res.data;
        } catch (err) {
            console.log(`[DIRECT FAIL] ${server.name} - ${err.message}`);
            directError = err.message;
        }
    }

    // B. Coba jalur cadangan (FiveStats API) jika jalur IP diblokir Firewall Azure
    if (server.code) {
        try {
            const res = await axios.get(`https://fivestats.io/api/servers/${server.code}/players`, {
                headers: {
                    // Mencegah crash jika .env di Azure belum diisi key ini
                    Authorization: `Bearer ${process.env.FIVESTATS_API_KEY || ''}` 
                },
                timeout: 5000
            });
            return res.data;
        } catch (err) {
            console.log(`[FIVESTATS FAIL] ${server.name} - ${err.message}`);
            throw new Error("Gagal mengambil data dari IP asli maupun dari FiveStats API.");
        }
    }

    throw new Error(`Server offline atau Firewall FiveM memblokir IP Azure. (Error Target: ${directError})`);
}

module.exports = {
    name: "player",
    async execute(interaction) {
        
        // 2. PINDAHKAN DEFER REPLY KE BARIS PALING PERTAMA!
        // Ini memastikan bot Anda punya waktu 15 menit, tidak peduli error apapun yang terjadi di bawahnya.
        await interaction.deferReply();

        try {
            const serverKey = interaction.options.getString("server", true);
            const keyword = interaction.options.getString("nama", true);

            if (!servers[serverKey]) {
                return interaction.editReply({
                    content: "❌ Server tidak ditemukan dalam daftar `servers.json`."
                });
            }

            const started = Date.now();
            const players = await getPlayers(servers[serverKey]);

            // Proteksi jika data yang kembali gagal diubah menjadi Array
            if (!Array.isArray(players)) {
                return interaction.editReply({ content: "❌ Format data balasan dari server FiveM tidak valid." });
            }

            const search = keyword.toLowerCase();
            const found = players.filter(player =>
                player.name.toLowerCase().includes(search)
            );

            if (!found.length) {
                return interaction.editReply({
                    content: "❌ Player tidak ditemukan."
                });
            }

            const p1 = [];
            const p2 = [];
            const p3 = [];

            for (const player of found) {
                const name = player.name.toLowerCase();

                if (name.startsWith(search)) {
                    p1.push(player);
                    continue;
                }

                const words = name.split(/[\s\-_=\[\]\(\)]+/);
                if (words.includes(search)) {
                    p2.push(player);
                    continue;
                }

                p3.push(player);
            }

            const formatPlayer = (p) => {
                let pingIcon = "🟢";
                if (p.ping > 100) pingIcon = "🔴";
                else if (p.ping > 50) pingIcon = "🟡";
                return `${pingIcon} \`${p.id}\` ${p.name} \`${p.ping}ms\``;
            };

            const embed = new EmbedBuilder()
                .setColor("#1E5631")
                .setTitle(`👥 Hasil Pencarian: ${keyword.toUpperCase()}`)
                .setDescription(
                    `🏰 **Server:** ${servers[serverKey].name}\n` +
                    `📊 **Total Player Online:** ${players.length}\n` +
                    `🔍 **Total Ditemukan:** ${found.length}`
                )
                .addFields(
                    {
                        name: "📋 Hasil Pencarian 1",
                        value: p1.length ? p1.map(formatPlayer).join("\n").slice(0, 1024) : "-",
                        inline: true
                    },
                    {
                        name: "📋 Hasil Pencarian 2",
                        value: p2.length ? p2.map(formatPlayer).join("\n").slice(0, 1024) : "-",
                        inline: true
                    },
                    {
                        name: "📋 Hasil Lanjutan",
                        value: p3.length ? p3.map(formatPlayer).join("\n").slice(0, 1024) : "-",
                        inline: true
                    }
                )
                .setFooter({
                    text: `Pencarian selesai dalam ${Date.now() - started} ms`
                })
                .setTimestamp();

            return interaction.editReply({
                embeds: [embed]
            });

        } catch (err) {
            console.error("[PLAYER CMD ERROR]", err);
            
            // 3. TAMPILKAN PESAN ERROR KE DISCORD
            // Jika bot gagal, Discord tidak akan diam saja memunculkan tulisan merah, melainkan akan membalas dengan info error spesifik.
            return interaction.editReply({
                content: `❌ **Gagal memproses permintaan:**\n\`${err.message}\``
            });
        }
    }
};
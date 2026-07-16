const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "panel",
    description: "Menampilkan panel kontrol inventaris",
    async execute(interaction) {
        // --- 1. MEMBUAT EMBED PROFESIONAL ---
        const embed = new EmbedBuilder()
            .setTitle("📦 TON - Inventory Management")
            .setDescription("Gunakan tombol di bawah ini untuk mengakses dan mengelola database inventaris secara real-time.")
            .setColor(0x2F5D50) // Warna Dark Green (Tema utama)
            .setThumbnail("https://symbolic-crimson-ittxjahisn.edgeone.app/TON_IMAGE.png") // Tambahkan logo di sini
            .setFooter({ text: "Sistem Inventaris TON - Terintegrasi Real-time" });

        // --- 2. MEMBAGI TOMBOL KE DALAM BEBERAPA ROW ---
        // Row 1: Informasi Utama
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel("Web Dashboard").setURL("https://ton.bentyaa.workers.dev/").setStyle(ButtonStyle.Link),
            new ButtonBuilder().setCustomId("btn_dashboard").setLabel("Dashboard").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("btn_stok").setLabel("Cari Stok").setStyle(ButtonStyle.Secondary)
        );

        // Row 2: Pengaturan & Log
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("btn_log").setLabel("Log Transaksi").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("btn_harga").setLabel("Katalog Harga").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("btn_setharga").setLabel("Set Harga").setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({ 
            embeds: [embed], 
            components: [row1, row2] 
        });
    }
};
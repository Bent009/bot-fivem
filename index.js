require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getFirestore } = require("firebase-admin/firestore");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// --- DUMMY WEB SERVER UNTUK AZURE ---
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot FiveM sedang berjalan dengan baik di Azure!');
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`Dummy server mendengarkan ping dari Azure di port ${port}`);
});
// ------------------------------------

// --- 1. INITIALIZATION ---
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.cert(serviceAccount)
});

const db = getFirestore();
const app = express();
app.use(express.json());
app.use(cors());

// --- 2. BOT CONFIGURATION ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Attaching database and cache to client for global access
client.db = db;
client.playersCache = new Map();

// --- 3. EVENT HANDLERS ---
const interactionHandler = require("./events/interactionCreate");

client.once("clientReady", (c) => {
    console.log(`[BOT] ✅ ${c.user.tag} telah online.`);
    console.log(`[DB] ✅ Firestore terkoneksi.`);
});

client.on("interactionCreate", interactionHandler);

client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.content.startsWith("!")) return;

    const embed = new EmbedBuilder()
        .setColor("#008000")
        .setTitle("⚠️ Perubahan Sistem")
        .setDescription("TON - BOT telah beralih ke **Slash Commands (/)**. Gunakan `/help` untuk melihat daftar perintah.")
        .setFooter({ text: "Gunakan command / agar bot lebih responsif." });

    await message.reply({ embeds: [embed] });
});

// --- 4. EXPRESS API (Inventory Report) ---
app.post("/api/report", async (req, res) => {
    try {
        const { channelId, embedData } = req.body;
        const channel = await client.channels.fetch(channelId);

        const embed = new EmbedBuilder()
            .setTitle(embedData.title || "Inventory Report")
            .setColor(embedData.color || "#22c55e")
            .addFields(embedData.fields || [])
            .setTimestamp();

        await channel.send({ embeds: [embed] });
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("[API ERROR]", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(3000, () => {
    console.log("[API] 🚀 Server berjalan di http://localhost:3000");
});

// --- 5. ERROR HANDLING (Pro Level) ---
process.on("unhandledRejection", (reason, promise) => {
    console.error("[CRITICAL] Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("[CRITICAL] Uncaught Exception:", err);
});

client.on('messageCreate', async (message) => {
    // 1. Abaikan jika /setpanel belum pernah dijalankan
    if (!client.stickyPanel) return;

    // 2. Cek apakah ada pesan (log web) masuk di channel yang sudah diset
    if (message.channel.id === client.stickyPanel.channelId) {
        
        // 3. Abaikan jika pesan tersebut adalah panel bot itu sendiri
        if (message.id === client.stickyPanel.messageId) return;

        // 4. Reset timer hitung mundur setiap kali ada log baru menumpuk
        if (client.stickyPanel.timer) {
            clearTimeout(client.stickyPanel.timer);
        }

        // 5. Mulai hitung mundur (misal 3 menit) sebelum memunculkan ulang panel
        client.stickyPanel.timer = setTimeout(async () => {
            try {
                // Hapus panel yang lama (yang sudah tertimbun)
                const oldMsg = await message.channel.messages.fetch(client.stickyPanel.messageId).catch(() => null);
                if (oldMsg) await oldMsg.delete();

                // Bangun ulang struktur panel
                const embed = new EmbedBuilder()
                    .setTitle("📦 TON - Inventory Management")
                    .setDescription("Gunakan tombol di bawah ini untuk mengakses dan mengelola database inventaris secara real-time.")
                    .setColor(0x2F5D50)
                    .setThumbnail("https://symbolic-crimson-ittxjahisn.edgeone.app/TON_IMAGE.png") // logo
                    .setFooter({ text: "Sistem Inventaris TON - Terintegrasi Real-time" });

                const row1 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setLabel("Web Dashboard").setURL("https://ton.bentyaa.workers.dev/").setStyle(ButtonStyle.Link),
                    new ButtonBuilder().setCustomId("btn_dashboard").setLabel("Dashboard").setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId("btn_stok").setLabel("Cari Stok").setStyle(ButtonStyle.Secondary)
                );
                const row2 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("btn_log").setLabel("Log Transaksi").setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("btn_harga").setLabel("Katalog Harga").setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId("btn_setharga").setLabel("Set Harga").setStyle(ButtonStyle.Danger)
                );

                // Kirim panel ke posisi paling bawah
                const newPanel = await message.channel.send({ embeds: [embed], components: [row1, row2] });
                
                // Perbarui ID ke panel yang baru
                client.stickyPanel.messageId = newPanel.id;
            } catch (error) {
                console.error("[STICKY PANEL ERROR]", error);
            }
        }, client.stickyPanel.cooldown);
    }
});

// --- 6. START BOT ---
client.login(process.env.TOKEN);
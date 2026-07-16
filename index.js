require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder, MessageFlags } = require("discord.js");
const { getFirestore } = require("firebase-admin/firestore");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// --- 1. INITIALIZATION FIREBASE ---
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.cert(serviceAccount)
});

const db = getFirestore();

// --- 2. EXPRESS WEB SERVER & API (PENGGANTI DUMMY SERVER) ---
const app = express();
app.use(cors()); // Membuka gerbang agar website TON bisa mengirim data
app.use(express.json());

// Menjawab ping dari Azure agar container tidak terbunuh
app.get('/', (req, res) => {
    res.send('Bot FiveM dan API Server berjalan dengan lancar di Azure!');
});

// --- 3. BOT CONFIGURATION ---
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

// --- 4. EVENT HANDLERS ---
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

// --- 5. EXPRESS API (Inventory Report) ---
app.post("/api/report", async (req, res) => {
    try {
        const { channelId, embedData } = req.body;
        const channel = await client.channels.fetch(channelId);

        const embed = new EmbedBuilder()
            .setTitle(embedData.title || "Inventory Report")
            .setColor(embedData.color || "#22c55e")
            .addFields(embedData.fields || [])
            .setTimestamp();

        // Mengakomodasi jika ada deskripsi tambahan dari frontend
        if (embedData.description) {
            embed.setDescription(embedData.description);
        }

        await channel.send({ embeds: [embed] });
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("[API ERROR]", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Menjalankan server Express di port Azure (menyatukan fungsi API & Dummy Server)
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`[API] 🚀 Server API & Azure Ping mendengarkan di port ${port}`);
});

// --- 6. ERROR HANDLING (Pro Level) ---
process.on("unhandledRejection", (reason, promise) => {
    console.error("[CRITICAL] Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("[CRITICAL] Uncaught Exception:", err);
});

// --- 7. START BOT ---
client.login(process.env.TOKEN);
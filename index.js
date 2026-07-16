require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder, MessageFlags } = require("discord.js");
const { getFirestore } = require("firebase-admin/firestore");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

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

// --- 6. START BOT ---
client.login(process.env.TOKEN);
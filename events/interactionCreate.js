const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const { buildLogPage } = require("../utils/logPagination");
const panelCommand = require("../commands/utility/panel");
const playerCommand = require("../commands/fivem/player"); // Mendaftarkan command player

// --- 1. KONFIGURASI TEMA & ITEM ---
const THEME = { 
    colors: { dashboard: 0x2F5D50 }, 
    footer: "Sistem Inventaris TON - Terintegrasi Real-time" 
};

// Gunakan HURUF KECIL untuk key agar sinkron dengan database
const itemConfig = {
    'uangmerah': { name: '💵 Uang Merah' }, 'uangkas': { name: '💰 Uang Kas' },
    'weed': { name: '🌿 Weed' }, 'meth': { name: '🧪 Meth' },
    'baggy': { name: '🛍 Baggy' }, 'opium': { name: '💊 Opium' },
    'cocaine': { name: '❄️ Cocaine' }, 'seed': { name: '🌱 Seed' },
    'bahanmeth': { name: '⚗️ Bahan Meth' }, 'opiumseed': { name: '🌻 Opium Seed' }
};

module.exports = async (interaction) => {
    const db = interaction.client.db;

    // --- 2. HANDLE BUTTONS ---
    if (interaction.isButton()) {
        // Navigasi Pagination
        if (interaction.customId === "log_next" || interaction.customId === "log_prev") {
            const logs = interaction.client.playersCache.get(`${interaction.user.id}_log`);
            if (!logs) return interaction.reply({ content: "❌ Sesi data habis.", flags: MessageFlags.Ephemeral });
            let page = Number(interaction.message.embeds[0].footer.text.split(" ")[1]) - 1;
            interaction.customId === "log_next" ? page++ : page--;
            const { embed, row } = buildLogPage(logs, page);
            return interaction.update({ embeds: [embed], components: [row] });
        }

        switch (interaction.customId) {
            case "btn_dashboard":
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                const snap = await db.collection("inventory").doc("stok_utama").get();
                const data = snap.data();
                
                const consolidated = {};
                for (const [key, val] of Object.entries(data)) {
                    const cleanKey = key.trim().toLowerCase();
                    const numberVal = Number(val);
                    if (!isNaN(numberVal)) {
                        consolidated[cleanKey] = (consolidated[cleanKey] || 0) + numberVal;
                    }
                }

                const fields = Object.entries(consolidated).map(([key, val]) => ({
                    name: itemConfig[key]?.name || key.toUpperCase(), 
                    value: val.toString(), 
                    inline: true
                }));

                const embed = new EmbedBuilder()
                    .setTitle("📦 STOK INVENTARIS TON")
                    .setColor(THEME.colors.dashboard)
                    .addFields(fields)
                    .setTimestamp()
                    .setFooter({ text: THEME.footer });

                return interaction.followUp({ embeds: [embed], flags: MessageFlags.Ephemeral });

            case "btn_harga":
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                const snapHarga = await db.collection("inventory").doc("item_config").get();
                const dataHarga = snapHarga.data();
                
                const excludedItems = ['uangmerah', 'uangkas'];
                const uniqueItems = {};
                for (const [key, val] of Object.entries(dataHarga)) {
                    const cleanKey = key.trim().toLowerCase();
                    if (excludedItems.includes(cleanKey)) continue;
                    uniqueItems[cleanKey] = val;
                }

                let desc = "💰 **KATALOG HARGA TERKINI**\n\n";
                for (const [key, val] of Object.entries(uniqueItems)) {
                    const price = val && typeof val === 'object' ? (val.price || 0) : val;
                    const config = itemConfig[key] || { name: key.toUpperCase(), emoji: '📦' };
                    desc += `${config.emoji || '📦'} **${config.name}**: $${price}\n`;
                }

                const embedHarga = new EmbedBuilder()
                    .setTitle("📜 Katalog Harga")
                    .setColor(THEME.colors.dashboard)
                    .setDescription(desc)
                    .setTimestamp()
                    .setFooter({ text: THEME.footer });

                return interaction.followUp({ embeds: [embedHarga], flags: MessageFlags.Ephemeral });

            case "btn_log":
                const logModal = new ModalBuilder().setCustomId("modal_log").setTitle("📑 Cari Log");
                logModal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("nama_target").setLabel("Nama pembeli / petugas").setStyle(TextInputStyle.Short).setRequired(true)));
                return interaction.showModal(logModal);

            case "btn_stok":
                const stokModal = new ModalBuilder().setCustomId("modal_stok").setTitle("🔍 Cari Stok");
                stokModal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("item_name").setLabel("Nama Item").setStyle(TextInputStyle.Short).setRequired(true)));
                return interaction.showModal(stokModal);

            case "btn_setharga":
                const priceModal = new ModalBuilder().setCustomId("modal_setharga").setTitle("⚙️ Set Harga");
                priceModal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("item_key").setLabel("Key Item (cth: weed)").setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("new_price").setLabel("Harga Baru").setStyle(TextInputStyle.Short).setRequired(true))
                );
                return interaction.showModal(priceModal);
        }
    }

    // --- 3. HANDLE MODAL SUBMITS ---
    if (interaction.isModalSubmit()) {
        try {
            switch (interaction.customId) {
                case "modal_stok":
                    const key = interaction.fields.getTextInputValue("item_name").toLowerCase();
                    const snap = await db.collection("inventory").doc("stok_utama").get();
                    const val = snap.data()[key] ?? "Tidak ditemukan";
                    return interaction.reply({ content: `🔍 Stok **${itemConfig[key]?.name || key.toUpperCase()}**: ${val}`, flags: MessageFlags.Ephemeral });

                case "modal_setharga":
                    const itemKey = interaction.fields.getTextInputValue("item_key").toLowerCase();
                    const newPrice = parseInt(interaction.fields.getTextInputValue("new_price"));
                    if (isNaN(newPrice)) return interaction.reply({ content: "❌ Harga harus angka!", flags: MessageFlags.Ephemeral });
                    await db.collection("inventory").doc("item_config").update({ [`${itemKey}.price`]: newPrice });
                    return interaction.reply({ content: `✅ Harga **${itemKey.toUpperCase()}** berhasil diubah ke $${newPrice}`, flags: MessageFlags.Ephemeral });

                case "modal_log":
                    const target = interaction.fields.getTextInputValue("nama_target");
                    const logSnap = await db.collection("transaction_logs").where("nama", "==", target).orderBy("timestamp", "desc").get();
                    if (logSnap.empty) return interaction.reply({ content: `❌ Tidak ditemukan log untuk: **${target}**`, flags: MessageFlags.Ephemeral });
                    const allLogs = logSnap.docs.map(doc => doc.data());
                    interaction.client.playersCache.set(`${interaction.user.id}_log`, allLogs);
                    const { embed, row } = buildLogPage(allLogs, 0);
                    return interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
            }
        } catch (err) {
            console.error("[MODAL ERROR]", err);
            return interaction.reply({ content: "❌ Terjadi kesalahan sistem.", flags: MessageFlags.Ephemeral });
        }
    }

    // --- 4. HANDLE SLASH COMMANDS ---
    if (!interaction.isChatInputCommand()) return;
    
    try {
        if (interaction.commandName === "panel") {
            return panelCommand.execute(interaction);
        } 
        else if (interaction.commandName === "player") {
            return playerCommand.execute(interaction);
        } 
        // Tambahkan command lain di sini jika ada
        else {
            return interaction.reply({ 
                content: "❌ Command ini belum disambungkan ke sistem handler.", 
                flags: MessageFlags.Ephemeral 
            });
        }
    } catch (error) {
        console.error("[COMMAND EXECUTION ERROR]", error);
        if (interaction.deferred || interaction.replied) {
            return interaction.editReply({ content: "❌ Terjadi kesalahan fatal saat mengeksekusi command." });
        } else {
            return interaction.reply({ content: "❌ Terjadi kesalahan fatal saat mengeksekusi command.", flags: MessageFlags.Ephemeral });
        }
    }
};
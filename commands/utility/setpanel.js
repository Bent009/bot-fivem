const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setpanel")
        .setDescription("Set panel agar otomatis turun (sticky) setelah ada log masuk")
        .addChannelOption(option => 
            option.setName("target_channel")
                .setDescription("Pilih channel brankas/log")
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName("waktu")
                .setDescription("Waktu jeda (dalam menit) sebelum panel dikirim ulang")
                .setRequired(true)
        ),
    async execute(interaction) {
        const channel = interaction.options.getChannel("target_channel");
        const waktu = interaction.options.getInteger("waktu");

        // Bangun Embed Panel
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

        try {
            // Kirim panel perdana ke channel
            const panelMsg = await channel.send({ embeds: [embed], components: [row1, row2] });
            
            // Simpan konfigurasi Sticky Panel ke memori client
            interaction.client.stickyPanel = {
                channelId: channel.id,
                messageId: panelMsg.id,
                cooldown: waktu * 60 * 1000, // Ubah parameter menit menjadi milidetik
                timer: null
            };

            await interaction.reply({ 
                content: `✅ Panel sukses di-set di ${channel}. Bot akan merefresh panel secara otomatis ${waktu} menit setelah ada log baru.`, 
                flags: MessageFlags.Ephemeral 
            });
        } catch (error) {
            console.error("[SETPANEL ERROR]", error);
            await interaction.reply({ 
                content: "❌ Gagal. Pastikan aku punya izin untuk mengirim pesan dan membaca history di channel tersebut.", 
                flags: MessageFlags.Ephemeral 
            });
        }
    }
};
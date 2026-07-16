// utils/logPagination.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

function buildLogPage(logs, page) {
    const logsPerPage = 5;
    const totalPages = Math.ceil(logs.length / logsPerPage);
    const start = page * logsPerPage;
    const end = start + logsPerPage;
    const pageLogs = logs.slice(start, end);

    let report = "WAKTU     | TIPE      | DETAIL\n";
    report += "-------------------------------------------\n";

    pageLogs.forEach(d => {
        let detail = d.detailItem ? d.detailItem.replace(/<[^>]*>/g, '') : "-";
        detail = detail.replace(/Terjual:-/g, ' | ').replace(/Total:/g, ' | Total:').replace(/Status:/g, ' | Status:');
        const time = d.waktuStr ? d.waktuStr.substring(13) : "N/A";
        report += `${time.padEnd(9)} | ${d.tipe.toUpperCase().padEnd(9)} | ${detail}\n`;
    });

    const embed = new EmbedBuilder()
        .setTitle("📑 Riwayat Transaksi")
        .setDescription(`\`\`\`${report}\`\`\``)
        .setFooter({ text: `Halaman ${page + 1} dari ${totalPages || 1}` })
        .setColor(0xA4B69A);

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("log_prev").setLabel("◀️").setStyle(ButtonStyle.Primary).setDisabled(page === 0),
        new ButtonBuilder().setCustomId("log_next").setLabel("▶️").setStyle(ButtonStyle.Primary).setDisabled(page >= totalPages - 1 || totalPages === 0)
    );

    return { embed, row };
}

module.exports = { buildLogPage };
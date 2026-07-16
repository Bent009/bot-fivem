const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const serversPath =
    path.join(
        __dirname,
        "..",
        "..",
        "servers.json"
    );

module.exports = {

    data: new SlashCommandBuilder()
        .setName("removeserver")
        .setDescription(
            "Hapus server"
        )
        .addStringOption(option =>
            option
                .setName("key")
                .setDescription(
                    "Key server"
                )
                .setRequired(true)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),

    async execute(interaction) {

        const key =
            interaction.options.getString("key");

        const servers =
            require("../../servers.json");

        if (!servers[key]) {

            return interaction.reply({
                content:
                    "❌ Server tidak ditemukan.",
                ephemeral: true
            });
        }

        delete servers[key];

        fs.writeFileSync(
            serversPath,
            JSON.stringify(
                servers,
                null,
                2
            )
        );

        await interaction.reply({
            content:
                `✅ Server \`${key}\` dihapus.`,
            ephemeral: true
        });
    }
};
const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const serversPath = path.join(
    __dirname,
    "..",
    "..",
    "servers.json"
);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addserver")
        .setDescription("Tambah server FiveM")
        .addStringOption(option =>
            option
                .setName("key")
                .setDescription("Key server")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("name")
                .setDescription("Nama server")
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("address")
                .setDescription("Domain:Port")
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName("code")
                .setDescription("CFX Endpoint")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),

    async execute(interaction) {

        const key =
            interaction.options.getString("key");

        const name =
            interaction.options.getString("name");

        const address =
            interaction.options.getString("address");

        const servers =
            require("../../servers.json");

        const code =
            interaction.options.getString(
                "code"
            );

        if (!address && !code) {

            return interaction.reply({
                content:
                    "❌ Address atau Code wajib diisi.",
                ephemeral: true
            });

        }

        servers[key] = {
            name
        };

        if (address)
            servers[key].address =
                address;

        if (code)
            servers[key].code =
                code;

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
                `✅ Server **${name}** berhasil ditambahkan.`,
            ephemeral: true
        });
    }
};
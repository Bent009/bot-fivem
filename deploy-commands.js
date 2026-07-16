require("dotenv").config(); // Memanggil dotenv agar bisa membaca file .env

const { REST, Routes, SlashCommandBuilder } = require("discord.js");
const config = require("./config.json");

const commands = [
    new SlashCommandBuilder().setName("help").setDescription("Menampilkan daftar command bot"),
    
    new SlashCommandBuilder().setName("players").setDescription("Melihat jumlah player online").addStringOption(option => option.setName("server").setDescription("Nama server").setRequired(true)),
    
    new SlashCommandBuilder().setName("player").setDescription("Mencari player").addStringOption(option => option.setName("server").setDescription("Nama server").setRequired(true)).addStringOption(option => option.setName("nama").setDescription("Nama player").setRequired(true)),
    
    new SlashCommandBuilder().setName("avatar").setDescription("Melihat avatar user").addUserOption(option => option.setName("user").setDescription("Target user").setRequired(false)),
    
    new SlashCommandBuilder().setName("ping").setDescription("Melihat latency bot"),
    
    new SlashCommandBuilder().setName("serverinfo").setDescription("Informasi server Discord"),
    
    new SlashCommandBuilder().setName("serverlist").setDescription("Melihat daftar server FiveM"),
    
    new SlashCommandBuilder().setName("addserver").setDescription("Menambahkan server FiveM").addStringOption(option => option.setName("key").setDescription("Key server").setRequired(true)).addStringOption(option => option.setName("name").setDescription("Nama server").setRequired(true)).addStringOption(option => option.setName("address").setDescription("Domain/IP:Port").setRequired(true)),
    
    new SlashCommandBuilder().setName("removeserver").setDescription("Menghapus server FiveM").addStringOption(option => option.setName("key").setDescription("Key server").setRequired(true)),
    
    // Command Panel Baru
    new SlashCommandBuilder().setName("panel").setDescription("Menampilkan panel kontrol interaktif ekosistem TON"),
].map(command => command.toJSON());

// Mengubah sumber token ke process.env.TOKEN
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("⏳ Register Slash Commands...");
        
        await rest.put(
            Routes.applicationCommands(config.clientId), 
            { body: commands }
        );
        
        console.log("✅ Slash Commands Berhasil Diregister");
    } catch (error) {
        console.error(error);
    }
})();
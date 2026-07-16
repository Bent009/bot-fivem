const {
    EmbedBuilder
} = require("discord.js");

module.exports = {

    name: "avatar",

    async execute(interaction) {

        const user =
            interaction.options.getUser(
                "user"
            ) ||
            interaction.user;

        const avatar =
            user.displayAvatarURL({
                size: 4096
            });

        const embed =
            new EmbedBuilder()

                .setColor(
                    "#5865F2"
                )

                .setTitle(
                    `🖼 Avatar ${user.username}`
                )

                .setImage(
                    avatar
                )

                .setTimestamp();

        return interaction.reply({
            embeds: [embed]
        });

    }

};
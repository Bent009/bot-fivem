const {
    EmbedBuilder
} = require("discord.js");

module.exports = {

    name: "serverinfo",

    async execute(interaction) {

        const guild =
            interaction.guild;

        const owner =
            await guild.fetchOwner();

        const embed =
            new EmbedBuilder()

                .setColor("#5865F2")

                .setTitle(
                    `📋 ${guild.name}`
                )

                .setThumbnail(
                    guild.iconURL({
                        dynamic: true
                    })
                )

                .addFields(

                    {
                        name: "👑 Owner",
                        value:
                            owner.user.tag,
                        inline: true
                    },

                    {
                        name: "👥 Members",
                        value:
                            guild.memberCount.toString(),
                        inline: true
                    },

                    {
                        name: "🚀 Boost Level",
                        value:
                            guild.premiumTier.toString(),
                        inline: true
                    },

                    {
                        name: "💎 Boost Count",
                        value:
                            guild.premiumSubscriptionCount?.toString() ||
                            "0",
                        inline: true
                    },

                    {
                        name: "📅 Created",
                        value:
                            `<t:${Math.floor(
                                guild.createdTimestamp /
                                1000
                            )}:F>`
                    }

                )

                .setFooter({
                    text:
                        `Server ID: ${guild.id}`
                })

                .setTimestamp();

        return interaction.reply({
            embeds: [embed]
        });

    }

};
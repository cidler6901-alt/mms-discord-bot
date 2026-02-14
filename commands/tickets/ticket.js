const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Open a help ticket'),

  async execute(interaction) {
    let category = interaction.guild.channels.cache.find(
      c => c.name === "Tickets" && c.type === 4
    );

    if (!category) {
      category = await interaction.guild.channels.create({
        name: "Tickets",
        type: ChannelType.GuildCategory
      });
    }

    const ch = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
      ]
    });

    ch.send(`🎟️ Ticket opened by ${interaction.user}\nStaff will assist you shortly.`);
    interaction.reply({ content: `✅ Ticket created: ${ch}`, ephemeral: true });
  }
};

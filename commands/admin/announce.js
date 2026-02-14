const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send an announcement')
    .addStringOption(o => o.setName('message').setDescription('Announcement text').setRequired(true)),

  async execute(interaction) {
    const member = interaction.member;
    const isAdmin =
      member.roles.cache.has(config.roles.admin) ||
      member.roles.cache.has(config.roles.owner) ||
      member.roles.cache.has(config.roles.moderator);

    if (!isAdmin) {
      return interaction.reply({ content: "❌ You don't have permission.", ephemeral: true });
    }

    const msg = interaction.options.getString('message');
    const ch = interaction.guild.channels.cache.get(config.announcementChannel);

    if (!ch) return interaction.reply("❌ Announcement channel not found.");

    ch.send(`📢 **ANNOUNCEMENT**\n\n${msg}`);
    interaction.reply({ content: "✅ Announcement sent!", ephemeral: true });
  }
};

const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason')),

  async execute(interaction) {
    const member = interaction.member;
    const isStaff =
      member.roles.cache.has(config.roles.moderator) ||
      member.roles.cache.has(config.roles.admin) ||
      member.roles.cache.has(config.roles.owner);

    if (!isStaff) return interaction.reply({ content: "❌ No permission", ephemeral: true });

    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || "No reason";

    const target = await interaction.guild.members.fetch(user.id);
    await target.kick(reason);

    interaction.reply(`👢 ${user.tag} kicked | Reason: ${reason}`);
  }
};

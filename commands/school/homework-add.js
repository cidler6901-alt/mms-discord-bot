const { SlashCommandBuilder } = require('discord.js');
const Homework = require('../../models/Homework');
const config = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('homework-add')
    .setDescription('Add homework')
    .addStringOption(o => o.setName('title').setDescription('Title').setRequired(true))
    .addStringOption(o => o.setName('due').setDescription('Due date').setRequired(true)),

  async execute(interaction) {
    const member = interaction.member;
    const isTeacher =
      member.roles.cache.has(config.roles.teacher) ||
      member.roles.cache.has(config.roles.admin) ||
      member.roles.cache.has(config.roles.owner);

    if (!isTeacher) return interaction.reply({ content: "❌ Teachers/Admin only", ephemeral: true });

    const title = interaction.options.getString('title');
    const due = interaction.options.getString('due');

    await Homework.create({ title, due });

    interaction.reply(`📚 Homework added: **${title}** (Due: ${due})`);
  }
};

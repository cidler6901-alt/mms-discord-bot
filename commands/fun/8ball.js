const { SlashCommandBuilder } = require('discord.js');

const replies = ["Yes", "No", "Maybe", "Ask again later", "Definitely", "Never"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the magic 8ball')
    .addStringOption(o => o.setName('question').setDescription('Question').setRequired(true)),

  async execute(interaction) {
    const r = replies[Math.floor(Math.random()*replies.length)];
    interaction.reply(`🎱 ${r}`);
  }
};

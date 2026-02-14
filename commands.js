const { SlashCommandBuilder } = require('discord.js');
const config = require('./config.json');

const commands = [
  new SlashCommandBuilder().setName('Ping').setDescription('Ping'),

  new SlashCommandBuilder().setName('verify').setDescription('Verify yourself'),

  new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send announcement')
    .addStringOption(o =>
      o.setName('message').setDescription('Message').setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Open a ticket')
];

module.exports = { commands, config };

module.exports = [
  {
    name: "ping",
    description: "Check bot latency",
    execute: async (interaction) => {
      await interaction.reply(`🏓 Pong! Latency: ${Date.now() - interaction.createdTimestamp}ms`);
    },
    permissions: "USER"
  },
  {
    name: "close",
    description: "Close a ticket or modmail",
    execute: async (interaction) => {
      if (!interaction.member.roles.cache.some(r => ["1471862618280038536","1471862614652092604","1471863675513077791"].includes(r.id))) {
        return interaction.reply({ content: "❌ Staff only.", ephemeral: true });
      }
      if (interaction.channel) await interaction.channel.delete();
    },
    permissions: "STAFF"
  }
];

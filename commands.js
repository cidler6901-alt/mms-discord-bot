const { SlashCommandBuilder } = require('discord.js');
const config = require('./config.json');

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Ping'),

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

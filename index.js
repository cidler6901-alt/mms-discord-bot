
require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, Routes, REST } = require('discord.js');
const express = require('express');
const config = require('./config.json');

const app = express();
app.get("/", (req,res)=>res.send("MMS Bot Online"));
app.listen(3000);

const client = new Client({
  intents:[
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Ping'),
  new SlashCommandBuilder().setName('verify').setDescription('Verify yourself'),
  new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send announcement')
    .addStringOption(o=>o.setName('message').setDescription('Message').setRequired(true)),
  new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Open a ticket')
];

const rest = new REST({version:'10'}).setToken(process.env.TOKEN);

(async()=>{
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands.map(c=>c.toJSON()) }
  );
  console.log("Commands deployed");
})();

client.on('ready',()=>{
  console.log(`MMS Bot online as ${client.user.tag}`);
});

client.on('guildMemberAdd', async member=>{
  const ch = member.guild.channels.cache.get(config.welcomeChannel);
  if(ch) ch.send(`Welcome ${member}! Please verify.`);
  const unverified = member.guild.roles.cache.get(config.roles.unverified);
  if(unverified) member.roles.add(unverified);
});

client.on('interactionCreate', async interaction=>{
  if(!interaction.isChatInputCommand()) return;

  const name = interaction.commandName;
  const member = interaction.member;

  if(name==='ping'){
    return interaction.reply('Pong!');
  }

  if(name==='verify'){
    const unverified = interaction.guild.roles.cache.get(config.roles.unverified);
    const verified = interaction.guild.roles.cache.get(config.roles.verified);
    const student = interaction.guild.roles.cache.get(config.roles.student);

    if(unverified) await member.roles.remove(unverified);
    if(verified) await member.roles.add(verified);
    if(student) await member.roles.add(student);

    return interaction.reply({content:"Verified!",ephemeral:true});
  }

  if(name==='announce'){
    const isStaff =
      member.roles.cache.has(config.roles.admin) ||
      member.roles.cache.has(config.roles.owner) ||
      member.roles.cache.has(config.roles.moderator);

    if(!isStaff) return interaction.reply({content:"No permission",ephemeral:true});

    const msg = interaction.options.getString('message');
    const ch = interaction.guild.channels.cache.get(config.announcementChannel);
    if(ch) ch.send(`📢 ANNOUNCEMENT\n\n${msg}`);
    return interaction.reply({content:"Sent",ephemeral:true});
  }

  if(name==='ticket'){
    const ch = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: 0
    });
    ch.send(`Ticket opened by ${interaction.user}`);
    return interaction.reply({content:`Ticket created: ${ch}`,ephemeral:true});
  }
});

client.login(process.env.TOKEN);

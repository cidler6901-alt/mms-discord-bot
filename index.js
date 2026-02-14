require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, ChannelType } = require('discord.js');
const express = require('express');
const { commands, config } = require('./commands.js');

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

const rest = new REST({version:'10'}).setToken(process.env.TOKEN);

(async()=>{
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, config.serverId),
    { body: commands.map(c=>c.toJSON()) }
  );
  console.log("✅ Slash commands deployed");
})();

client.on('ready',()=>{
  console.log(`🤖 MMS Bot online as ${client.user.tag}`);
});

/* ========== WELCOME SYSTEM ========== */
client.on('guildMemberAdd', async member=>{
  const ch = member.guild.channels.cache.get(config.welcomeChannel);
  if(ch) ch.send(`👋 Welcome ${member}! Please verify to access the server.`);

  const unverified = member.guild.roles.cache.get(config.roles.unverified);
  if(unverified) member.roles.add(unverified);
});

/* ========== COMMAND SYSTEM ========== */
client.on('interactionCreate', async interaction=>{
  if(!interaction.isChatInputCommand()) return;

  const name = interaction.commandName;
  const member = interaction.member;

  /* PING */
  if(name==='ping'){
    return interaction.reply('🏓 Pong!');
  }

  /* VERIFY */
  if(name==='verify'){
    const unverified = interaction.guild.roles.cache.get(config.roles.unverified);
    const verified = interaction.guild.roles.cache.get(config.roles.verified);
    const student = interaction.guild.roles.cache.get(config.roles.student);

    if(unverified) await member.roles.remove(unverified);
    if(verified) await member.roles.add(verified);
    if(student) await member.roles.add(student);

    return interaction.reply({content:"✅ You are now verified!",ephemeral:true});
  }

  /* ANNOUNCE */
  if(name==='announce'){
    const isStaff =
      member.roles.cache.has(config.roles.admin) ||
      member.roles.cache.has(config.roles.owner) ||
      member.roles.cache.has(config.roles.moderator);

    if(!isStaff) return interaction.reply({content:"❌ No permission",ephemeral:true});

    const msg = interaction.options.getString('message');
    const ch = interaction.guild.channels.cache.get(config.announcementChannel);

    if(ch) ch.send(`📢 **ANNOUNCEMENT**\n\n${msg}`);
    return interaction.reply({content:"✅ Announcement sent",ephemeral:true});
  }

  /* TICKET */
  if(name==='ticket'){
    const ch = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText
    });

    ch.send(`🎟️ Ticket opened by ${interaction.user}\nStaff will assist you.`);
    return interaction.reply({content:`✅ Ticket created: ${ch}`,ephemeral:true});
  }
});

client.login(process.env.TOKEN);

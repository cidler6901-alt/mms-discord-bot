
require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const cron = require('node-cron');
const express = require('express');
const Homework = require('./models/Homework');
const config = require('./config.json');

const app = express();
app.get("/", (req, res) => res.send("MMS Bot Online"));
app.listen(3000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

require('./handlers/commandHandler')(client);
require('./handlers/eventHandler')(client);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error", err));

cron.schedule('0 */6 * * *', async () => {
  const hw = await Homework.find();
  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  if (!guild) return;
  const ch = guild.channels.cache.get(config.announcementChannel);
  if (!ch) return;
  hw.forEach(h => {
    ch.send(`📚 Reminder: **${h.title}** due on **${h.due}**`);
  });
});

client.login(process.env.TOKEN);

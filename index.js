const cron = require('node-cron');
const Homework = require('./models/Homework');
const config = require('./config.json');

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

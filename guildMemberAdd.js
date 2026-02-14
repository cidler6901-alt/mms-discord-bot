
const config = require('../config.json');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const ch = member.guild.channels.cache.get(config.welcomeChannel);
    if (ch) ch.send(`Welcome ${member}! Please verify.`);
    const unverified = member.guild.roles.cache.get(config.roles.unverified);
    if (unverified) await member.roles.add(unverified);
  }
};

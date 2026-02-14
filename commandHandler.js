
const fs = require('fs');

module.exports = (client) => {
  const folders = fs.readdirSync('./commands');
  for (const folder of folders) {
    const files = fs.readdirSync(`./commands/${folder}`).filter(f => f.endsWith('.js'));
    for (const file of files) {
      const cmd = require(`../commands/${folder}/${file}`);
      client.commands.set(cmd.data.name, cmd);
    }
  }
};

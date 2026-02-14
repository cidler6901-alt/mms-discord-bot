
const fs = require('fs');

module.exports = (client) => {
  const files = fs.readdirSync('./events').filter(f => f.endsWith('.js'));
  for (const file of files) {
    const event = require(`../events/${file}`);
    client.on(event.name, (...args) => event.execute(...args, client));
  }
};


module.exports = {
  name: 'ready',
  execute(client) {
    console.log(`MMS Bot online as ${client.user.tag}`);
  }
};

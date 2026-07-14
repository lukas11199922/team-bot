const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

function baseEmbed(color = config.colors.primary) {
  return new EmbedBuilder().setColor(color).setTimestamp();
}

module.exports = { baseEmbed };

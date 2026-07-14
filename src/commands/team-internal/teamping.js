const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed } = require('../../utils/embeds');

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

module.exports = {
  data: new SlashCommandBuilder().setName('teamping').setDescription('Zeigt Bot-Status, Latenz und Uptime'),

  async execute(interaction) {
    const embed = baseEmbed()
      .setTitle('🏓 Pong!')
      .addFields(
        { name: 'API-Latenz', value: `${Math.round(interaction.client.ws.ping)} ms`, inline: true },
        { name: 'Uptime', value: formatUptime(interaction.client.uptime), inline: true },
        { name: 'Status', value: '🟢 Online', inline: true },
      );

    await interaction.reply({ embeds: [embed] });
  },
};

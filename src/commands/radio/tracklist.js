const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const { baseEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tracklist')
    .setDescription('Zeigt die zuletzt gespielten Songs (live aus dem Panel)'),

  async execute(interaction) {
    const rows = db
      .prepare('SELECT * FROM tracks WHERE guildId = ? ORDER BY createdAt DESC LIMIT 10')
      .all(interaction.guildId);

    const embed = baseEmbed().setTitle('🎶 Zuletzt gespielte Songs');

    if (rows.length === 0) {
      embed.setDescription('Aktuell wurden noch keine Songs über das On-Air-Panel eingetragen.');
    } else {
      embed.setDescription(
        rows.map((r) => `**${r.title}** – ${r.artist}  ·  <t:${Math.floor(r.createdAt / 1000)}:R>`).join('\n')
      );
    }

    await interaction.reply({ embeds: [embed] });
  },
};

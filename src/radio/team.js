const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed } = require('../../utils/embeds');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('team')
    .setDescription('Zeigt das Joystream-FM-Team (live aus dem Panel)'),

  async execute(interaction) {
    await interaction.guild.members.fetch();
    const teamRole = interaction.guild.roles.cache.get(config.roles.team);

    const embed = baseEmbed().setTitle('🎙️ Joystream-FM-Team');

    if (!teamRole || teamRole.members.size === 0) {
      embed.setDescription('Aktuell sind keine Team-Mitglieder hinterlegt (Team-Rolle in config.json prüfen).');
    } else {
      embed.setDescription(teamRole.members.map((m) => `• ${m}`).join('\n'));
      embed.setFooter({ text: `${teamRole.members.size} Team-Mitglied(er)` });
    }

    await interaction.reply({ embeds: [embed] });
  },
};

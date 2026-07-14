const { SlashCommandBuilder } = require('discord.js');
const { baseEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('teamhelp').setDescription('Übersicht aller Teambot-Befehle'),

  async execute(interaction) {
    const commands = [...interaction.client.commands.values()].sort((a, b) => a.data.name.localeCompare(b.data.name));

    const embed = baseEmbed()
      .setTitle('📖 Teambot — Befehlsübersicht')
      .setDescription(commands.map((c) => `**/${c.data.name}**\n${c.data.description}`).join('\n\n'));

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

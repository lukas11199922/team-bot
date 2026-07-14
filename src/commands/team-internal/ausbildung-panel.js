const { SlashCommandBuilder } = require('discord.js');
const { isTeamOrMod, denyNoPermission } = require('../../utils/permissions');
const { baseEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ausbildung-panel')
    .setDescription('Postet das Ausbildungs-Panel (Vorlagen) in diesen Channel'),

  async execute(interaction) {
    if (!isTeamOrMod(interaction.member)) return denyNoPermission(interaction);

    const embed = baseEmbed()
      .setTitle('🎓 Ausbildungs-Panel')
      .setDescription(
        'Hier findet ihr alle Vorlagen und Infos rund um die Ausbildung bei Joystream FM:\n\n' +
          '• Nutzt `/aufgabe erstellen`, um Azubis Aufgaben zuzuweisen\n' +
          '• Nutzt `/aufgabe liste`, um offene Aufgaben zu sehen\n' +
          '• Nutzt `/ausbildung`, um an einen Ausbildungstermin zu erinnern\n' +
          '• Bei Fragen wendet euch an euren Ausbilder oder das Team'
      );

    await interaction.channel.send({ embeds: [embed] });
    await interaction.reply({ content: '✅ Ausbildungs-Panel gepostet.', ephemeral: true });
  },
};

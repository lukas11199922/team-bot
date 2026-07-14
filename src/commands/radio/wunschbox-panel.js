const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { isTeamOrMod, denyNoPermission } = require('../../utils/permissions');
const { baseEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wunschbox-panel')
    .setDescription('Postet die Wunschbox in diesen Channel'),

  async execute(interaction) {
    if (!isTeamOrMod(interaction.member)) return denyNoPermission(interaction);

    const embed = baseEmbed()
      .setTitle('🎁 Wunschbox')
      .setDescription('Klicke auf den Button und schick uns deinen Songwunsch für die nächste Sendung!');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('wunschbox_open').setLabel('Songwunsch abgeben').setStyle(ButtonStyle.Primary).setEmoji('🎵')
    );

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Wunschbox-Panel gepostet.', ephemeral: true });
  },
};

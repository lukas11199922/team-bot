const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { isTeamOrMod, denyNoPermission } = require('../../utils/permissions');
const { baseEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-panel')
    .setDescription('Postet das Ticket-Panel in diesen Channel'),

  async execute(interaction) {
    if (!isTeamOrMod(interaction.member)) return denyNoPermission(interaction);

    const embed = baseEmbed()
      .setTitle('🎫 Support-Ticket')
      .setDescription('Hast du eine Frage oder ein Problem? Klick unten, um ein privates Ticket mit dem Team zu öffnen.');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_open').setLabel('Ticket öffnen').setStyle(ButtonStyle.Success).setEmoji('🎫')
    );

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Ticket-Panel gepostet.', ephemeral: true });
  },
};

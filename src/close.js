const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const { isTeamOrMod, denyNoPermission } = require('../../utils/permissions');
const { baseEmbed } = require('../../utils/embeds');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder().setName('close').setDescription('Schließt das aktuelle Ticket'),

  async execute(interaction) {
    const ticket = db.prepare('SELECT * FROM tickets WHERE channelId = ?').get(interaction.channel.id);

    if (!ticket) {
      return interaction.reply({ content: '❌ Dies ist kein Ticket-Channel.', ephemeral: true });
    }
    if (ticket.userId !== interaction.user.id && !isTeamOrMod(interaction.member)) {
      return denyNoPermission(interaction);
    }

    const embed = baseEmbed(config.colors.danger)
      .setTitle('🔒 Ticket wird geschlossen')
      .setDescription(`Geschlossen von ${interaction.user}. Dieser Channel wird in 5 Sekunden gelöscht.`);

    await interaction.reply({ embeds: [embed] });
    db.prepare('UPDATE tickets SET status = ? WHERE channelId = ?').run('geschlossen', interaction.channel.id);

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 5000);
  },
};

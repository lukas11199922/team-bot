const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const { isTeamOrMod, denyNoPermission } = require('../../utils/permissions');
const { baseEmbed } = require('../../utils/embeds');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unwarn')
    .setDescription('Entfernt eine bestimmte Verwarnung (Team/Mod)')
    .addIntegerOption((o) => o.setName('warn_id').setDescription('Die ID der Verwarnung (#Nummer)').setRequired(true)),

  async execute(interaction) {
    if (!isTeamOrMod(interaction.member)) return denyNoPermission(interaction);

    const warnId = interaction.options.getInteger('warn_id');
    const warn = db.prepare('SELECT * FROM warns WHERE id = ? AND guildId = ?').get(warnId, interaction.guildId);

    if (!warn) {
      return interaction.reply({ content: `❌ Keine Verwarnung mit der ID #${warnId} gefunden.`, ephemeral: true });
    }

    db.prepare('DELETE FROM warns WHERE id = ?').run(warnId);

    const embed = baseEmbed(config.colors.success)
      .setTitle('✅ Verwarnung entfernt')
      .setDescription(`Verwarnung **#${warnId}** von <@${warn.userId}> wurde entfernt.`);

    await interaction.reply({ embeds: [embed] });
  },
};

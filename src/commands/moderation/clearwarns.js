const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const { isTeamOrMod, denyNoPermission } = require('../../utils/permissions');
const { baseEmbed } = require('../../utils/embeds');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearwarns')
    .setDescription('Löscht ALLE Verwarnungen eines Users (Team/Mod)')
    .addUserOption((o) => o.setName('user').setDescription('User dessen Verwarnungen gelöscht werden sollen').setRequired(true)),

  async execute(interaction) {
    if (!isTeamOrMod(interaction.member)) return denyNoPermission(interaction);

    const user = interaction.options.getUser('user');
    const result = db.prepare('DELETE FROM warns WHERE guildId = ? AND userId = ?').run(interaction.guildId, user.id);

    const embed = baseEmbed(config.colors.success)
      .setTitle('🗑️ Verwarnungen gelöscht')
      .setDescription(`${result.changes} Verwarnung(en) von ${user} wurden gelöscht.`);

    await interaction.reply({ embeds: [embed] });
  },
};

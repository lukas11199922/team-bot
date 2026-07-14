const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const { isTeamOrMod, denyNoPermission } = require('../../utils/permissions');
const { baseEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warns')
    .setDescription('Zeigt die Verwarnungen eines Users (Team/Mod)')
    .addUserOption((o) => o.setName('user').setDescription('User dessen Verwarnungen angezeigt werden sollen').setRequired(true)),

  async execute(interaction) {
    if (!isTeamOrMod(interaction.member)) return denyNoPermission(interaction);

    const user = interaction.options.getUser('user');
    const rows = db
      .prepare('SELECT * FROM warns WHERE guildId = ? AND userId = ? ORDER BY createdAt DESC')
      .all(interaction.guildId, user.id);

    const embed = baseEmbed()
      .setTitle(`Verwarnungen von ${user.username}`)
      .setThumbnail(user.displayAvatarURL());

    if (rows.length === 0) {
      embed.setDescription('Keine Verwarnungen vorhanden. ✅');
    } else {
      embed.setDescription(
        rows
          .map((r) => `**#${r.id}** — ${r.reason}\n<t:${Math.floor(r.createdAt / 1000)}:f> von <@${r.moderatorId}>`)
          .join('\n\n')
      );
    }

    await interaction.reply({ embeds: [embed] });
  },
};

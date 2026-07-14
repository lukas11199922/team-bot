const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const { isTeamOrMod, denyNoPermission } = require('../../utils/permissions');
const { baseEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('notes')
    .setDescription('Zeigt interne Notizen zu einem User (Team/Mod)')
    .addUserOption((o) => o.setName('user').setDescription('User dessen Notizen angezeigt werden sollen').setRequired(true)),

  async execute(interaction) {
    if (!isTeamOrMod(interaction.member)) return denyNoPermission(interaction);

    const user = interaction.options.getUser('user');
    const rows = db
      .prepare('SELECT * FROM notes WHERE guildId = ? AND userId = ? ORDER BY createdAt DESC')
      .all(interaction.guildId, user.id);

    const embed = baseEmbed().setTitle(`📝 Notizen zu ${user.username}`);

    if (rows.length === 0) {
      embed.setDescription('Keine Notizen vorhanden.');
    } else {
      embed.setDescription(
        rows.map((r) => `**#${r.id}** — ${r.note}\n<t:${Math.floor(r.createdAt / 1000)}:f> von <@${r.authorId}>`).join('\n\n')
      );
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

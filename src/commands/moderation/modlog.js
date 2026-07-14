const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const { isTeamOrMod, denyNoPermission } = require('../../utils/permissions');
const { baseEmbed } = require('../../utils/embeds');

const TYPE_LABELS = {
  warn: '⚠️ Verwarnung',
  timeout: '🔇 Timeout',
  kick: '👢 Kick',
  ban: '🔨 Bann',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('modlog')
    .setDescription('Zeigt die letzten Mod-Aktionen (Team/Mod)')
    .addIntegerOption((o) => o.setName('anzahl').setDescription('Wie viele Einträge (Standard: 10)').setMinValue(1).setMaxValue(25)),

  async execute(interaction) {
    if (!isTeamOrMod(interaction.member)) return denyNoPermission(interaction);

    const anzahl = interaction.options.getInteger('anzahl') ?? 10;
    const rows = db
      .prepare('SELECT * FROM modlog WHERE guildId = ? ORDER BY createdAt DESC LIMIT ?')
      .all(interaction.guildId, anzahl);

    const embed = baseEmbed().setTitle('📋 Mod-Log — letzte Aktionen');

    if (rows.length === 0) {
      embed.setDescription('Keine Einträge vorhanden.');
    } else {
      embed.setDescription(
        rows
          .map(
            (r) =>
              `${TYPE_LABELS[r.type] ?? r.type} — <@${r.userId}>\n` +
              `Grund: ${r.reason ?? '–'} · von <@${r.moderatorId}> · <t:${Math.floor(r.createdAt / 1000)}:R>`
          )
          .join('\n\n')
      );
    }

    await interaction.reply({ embeds: [embed] });
  },
};

const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const { isTeamOrMod, denyNoPermission } = require('../../utils/permissions');
const { baseEmbed } = require('../../utils/embeds');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('aufgabe')
    .setDescription('Aufgaben für Azubis verwalten')
    .addSubcommand((sub) =>
      sub
        .setName('erstellen')
        .setDescription('Vergibt eine Aufgabe an einen Azubi')
        .addUserOption((o) => o.setName('azubi').setDescription('Der Azubi, der die Aufgabe bekommt').setRequired(true))
        .addStringOption((o) => o.setName('aufgabe').setDescription('Beschreibung der Aufgabe').setRequired(true))
    )
    .addSubcommand((sub) => sub.setName('liste').setDescription('Zeigt alle offenen Aufgaben')),

  async execute(interaction) {
    if (!isTeamOrMod(interaction.member)) return denyNoPermission(interaction);

    const sub = interaction.options.getSubcommand();

    if (sub === 'erstellen') {
      const azubi = interaction.options.getUser('azubi');
      const aufgabe = interaction.options.getString('aufgabe');

      const info = db
        .prepare('INSERT INTO tasks (guildId, azubiId, task, createdBy, createdAt) VALUES (?, ?, ?, ?, ?)')
        .run(interaction.guildId, azubi.id, aufgabe, interaction.user.id, Date.now());

      const embed = baseEmbed(config.colors.success)
        .setTitle('✅ Aufgabe vergeben')
        .setDescription(`Aufgabe **#${info.lastInsertRowid}** an ${azubi} vergeben.`)
        .addFields({ name: 'Aufgabe', value: aufgabe });

      await interaction.reply({ embeds: [embed] });
      await azubi.send(`📋 Du hast eine neue Aufgabe von ${interaction.user.tag} bekommen:\n${aufgabe}`).catch(() => {});
    } else {
      const rows = db
        .prepare("SELECT * FROM tasks WHERE guildId = ? AND status = 'offen' ORDER BY createdAt ASC")
        .all(interaction.guildId);

      const embed = baseEmbed().setTitle('📋 Offene Aufgaben');

      if (rows.length === 0) {
        embed.setDescription('Aktuell sind keine Aufgaben offen. 🎉');
      } else {
        embed.setDescription(
          rows.map((r) => `**#${r.id}** — <@${r.azubiId}>\n${r.task}`).join('\n\n')
        );
      }

      await interaction.reply({ embeds: [embed] });
    }
  },
};

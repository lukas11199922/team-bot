const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const { isTeamOrMod, denyNoPermission } = require('../../utils/permissions');
const { baseEmbed } = require('../../utils/embeds');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('note')
    .setDescription('Interne Team-Notiz zu einem User (Team/Mod)')
    .addUserOption((o) => o.setName('user').setDescription('User zu dem die Notiz gehört').setRequired(true))
    .addStringOption((o) => o.setName('text').setDescription('Notiz-Text').setRequired(true)),

  async execute(interaction) {
    if (!isTeamOrMod(interaction.member)) return denyNoPermission(interaction);

    const user = interaction.options.getUser('user');
    const text = interaction.options.getString('text');

    const info = db
      .prepare('INSERT INTO notes (guildId, userId, note, authorId, createdAt) VALUES (?, ?, ?, ?, ?)')
      .run(interaction.guildId, user.id, text, interaction.user.id, Date.now());

    const embed = baseEmbed(config.colors.info)
      .setTitle('📝 Notiz gespeichert')
      .setDescription(`Notiz **#${info.lastInsertRowid}** zu ${user} wurde gespeichert.`)
      .addFields({ name: 'Text', value: text });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

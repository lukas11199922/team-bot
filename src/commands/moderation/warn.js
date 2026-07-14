const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database');
const { isTeamOrMod, denyNoPermission } = require('../../utils/permissions');
const { baseEmbed } = require('../../utils/embeds');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Verwarnt einen User (Team/Mod)')
    .addUserOption((o) => o.setName('user').setDescription('Der zu verwarnende User').setRequired(true))
    .addStringOption((o) => o.setName('grund').setDescription('Grund der Verwarnung').setRequired(true)),

  async execute(interaction) {
    if (!isTeamOrMod(interaction.member)) return denyNoPermission(interaction);

    const user = interaction.options.getUser('user');
    const grund = interaction.options.getString('grund');
    const now = Date.now();

    const info = db
      .prepare('INSERT INTO warns (guildId, userId, reason, moderatorId, createdAt) VALUES (?, ?, ?, ?, ?)')
      .run(interaction.guildId, user.id, grund, interaction.user.id, now);
    db.prepare('INSERT INTO modlog (guildId, type, userId, moderatorId, reason, createdAt) VALUES (?, ?, ?, ?, ?, ?)').run(
      interaction.guildId, 'warn', user.id, interaction.user.id, grund, now
    );

    const embed = baseEmbed(config.colors.warning)
      .setTitle('⚠️ Verwarnung ausgesprochen')
      .setDescription(`${user} wurde verwarnt.`)
      .addFields(
        { name: 'Grund', value: grund },
        { name: 'Warn-ID', value: `#${info.lastInsertRowid}`, inline: true },
        { name: 'Von', value: `${interaction.user}`, inline: true },
      );

    await interaction.reply({ embeds: [embed] });

    await user.send({ content: `Du wurdest auf **${interaction.guild.name}** verwarnt.\nGrund: ${grund}` }).catch(() => {});
  },
};

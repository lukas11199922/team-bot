const { SlashCommandBuilder } = require('discord.js');
const { isMod, denyNoPermission } = require('../../utils/permissions');
const { baseEmbed } = require('../../utils/embeds');
const db = require('../../database');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kickt einen User vom Server (Team/Mod)')
    .addUserOption((o) => o.setName('user').setDescription('Der zu kickende User').setRequired(true))
    .addStringOption((o) => o.setName('grund').setDescription('Grund für den Kick').setRequired(false)),

  async execute(interaction) {
    if (!isMod(interaction.member)) return denyNoPermission(interaction);

    const user = interaction.options.getUser('user');
    const grund = interaction.options.getString('grund') ?? 'Kein Grund angegeben';

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: '❌ User nicht auf diesem Server gefunden.', ephemeral: true });
    if (!member.kickable) {
      return interaction.reply({ content: '❌ Ich kann diesen User nicht kicken (Rollen-Hierarchie).', ephemeral: true });
    }

    await user.send(`Du wurdest von **${interaction.guild.name}** gekickt.\nGrund: ${grund}`).catch(() => {});
    await member.kick(grund);

    db.prepare('INSERT INTO modlog (guildId, type, userId, moderatorId, reason, createdAt) VALUES (?, ?, ?, ?, ?, ?)').run(
      interaction.guildId, 'kick', user.id, interaction.user.id, grund, Date.now()
    );

    const embed = baseEmbed(config.colors.danger)
      .setTitle('👢 User gekickt')
      .setDescription(`${user.tag} wurde vom Server gekickt.`)
      .addFields({ name: 'Grund', value: grund });

    await interaction.reply({ embeds: [embed] });
  },
};

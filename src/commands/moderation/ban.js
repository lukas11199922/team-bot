const { SlashCommandBuilder } = require('discord.js');
const { isMod, denyNoPermission } = require('../../utils/permissions');
const { baseEmbed } = require('../../utils/embeds');
const db = require('../../database');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bannt einen User vom Server (Team/Mod)')
    .addUserOption((o) => o.setName('user').setDescription('Der zu bannende User').setRequired(true))
    .addStringOption((o) => o.setName('grund').setDescription('Grund für den Bann').setRequired(false))
    .addIntegerOption((o) =>
      o.setName('nachrichten_loeschen').setDescription('Nachrichten der letzten X Tage löschen (0-7)').setMinValue(0).setMaxValue(7)
    ),

  async execute(interaction) {
    if (!isMod(interaction.member)) return denyNoPermission(interaction);

    const user = interaction.options.getUser('user');
    const grund = interaction.options.getString('grund') ?? 'Kein Grund angegeben';
    const tage = interaction.options.getInteger('nachrichten_loeschen') ?? 0;

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (member && !member.bannable) {
      return interaction.reply({ content: '❌ Ich kann diesen User nicht bannen (Rollen-Hierarchie).', ephemeral: true });
    }

    await user.send(`Du wurdest von **${interaction.guild.name}** gebannt.\nGrund: ${grund}`).catch(() => {});
    await interaction.guild.members.ban(user.id, { deleteMessageSeconds: tage * 86400, reason: grund });

    db.prepare('INSERT INTO modlog (guildId, type, userId, moderatorId, reason, createdAt) VALUES (?, ?, ?, ?, ?, ?)').run(
      interaction.guildId, 'ban', user.id, interaction.user.id, grund, Date.now()
    );

    const embed = baseEmbed(config.colors.danger)
      .setTitle('🔨 User gebannt')
      .setDescription(`${user.tag} wurde vom Server gebannt.`)
      .addFields({ name: 'Grund', value: grund });

    await interaction.reply({ embeds: [embed] });
  },
};

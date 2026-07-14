const { SlashCommandBuilder } = require('discord.js');
const { isTeamOrMod, denyNoPermission } = require('../../utils/permissions');
const { baseEmbed } = require('../../utils/embeds');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('Hebt einen Timeout auf (Team/Mod)')
    .addUserOption((o) => o.setName('user').setDescription('User dessen Timeout aufgehoben werden soll').setRequired(true)),

  async execute(interaction) {
    if (!isTeamOrMod(interaction.member)) return denyNoPermission(interaction);

    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: '❌ User nicht auf diesem Server gefunden.', ephemeral: true });

    await member.timeout(null);

    const embed = baseEmbed(config.colors.success)
      .setTitle('🔊 Timeout aufgehoben')
      .setDescription(`Der Timeout von ${user} wurde aufgehoben.`);

    await interaction.reply({ embeds: [embed] });
  },
};

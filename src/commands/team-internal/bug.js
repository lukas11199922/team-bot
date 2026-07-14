const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { baseEmbed } = require('../../utils/embeds');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bug')
    .setDescription('Melde einen Bug oder ein technisches Problem (Team)')
    .addStringOption((o) => o.setName('beschreibung').setDescription('Was ist passiert?').setRequired(true)),

  async execute(interaction) {
    const beschreibung = interaction.options.getString('beschreibung');

    const embed = baseEmbed(config.colors.danger)
      .setTitle('🐛 Bug-Report')
      .setDescription(beschreibung)
      .setFooter({ text: `Gemeldet von ${interaction.user.tag}` });

    const channel =
      config.channels.bugReports && config.channels.bugReports !== 'BUG_CHANNEL_ID'
        ? await interaction.guild.channels.fetch(config.channels.bugReports).catch(() => null)
        : interaction.channel;

    if (channel && channel.type === ChannelType.GuildText) {
      await channel.send({ embeds: [embed] });
      await interaction.reply({ content: '✅ Danke, dein Bug-Report wurde weitergeleitet.', ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embed] });
    }
  },
};

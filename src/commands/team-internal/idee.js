const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { baseEmbed } = require('../../utils/embeds');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('idee')
    .setDescription('Reiche eine Idee fürs Radio ein (Team)')
    .addStringOption((o) => o.setName('idee').setDescription('Deine Idee').setRequired(true)),

  async execute(interaction) {
    const idee = interaction.options.getString('idee');

    const embed = baseEmbed(config.colors.info)
      .setTitle('💡 Neue Idee')
      .setDescription(idee)
      .setFooter({ text: `Eingereicht von ${interaction.user.tag}` });

    const channel =
      config.channels.ideen && config.channels.ideen !== 'IDEEN_CHANNEL_ID'
        ? await interaction.guild.channels.fetch(config.channels.ideen).catch(() => null)
        : interaction.channel;

    if (channel && channel.type === ChannelType.GuildText) {
      await channel.send({ embeds: [embed] });
      await interaction.reply({ content: '✅ Danke für deine Idee! Sie wurde ans Team weitergeleitet.', ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embed] });
    }
  },
};

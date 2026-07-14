const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { isTeamOrMod, denyNoPermission } = require('../../utils/permissions');
const { baseEmbed } = require('../../utils/embeds');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ankuendigung')
    .setDescription('Postet eine Ankündigung ins Team-Ankündigungs-Channel (Team)')
    .addStringOption((o) => o.setName('titel').setDescription('Titel der Ankündigung').setRequired(true))
    .addStringOption((o) => o.setName('text').setDescription('Inhalt der Ankündigung').setRequired(true)),

  async execute(interaction) {
    if (!isTeamOrMod(interaction.member)) return denyNoPermission(interaction);

    const titel = interaction.options.getString('titel');
    const text = interaction.options.getString('text');

    const embed = baseEmbed()
      .setTitle(`📢 ${titel}`)
      .setDescription(text)
      .setFooter({ text: `Verfasst von ${interaction.user.tag}` });

    const channel =
      config.channels.ankuendigung && config.channels.ankuendigung !== 'ANKUENDIGUNG_CHANNEL_ID'
        ? await interaction.guild.channels.fetch(config.channels.ankuendigung).catch(() => null)
        : interaction.channel;

    if (!channel || channel.type !== ChannelType.GuildText) {
      return interaction.reply({ content: '❌ Ankündigungs-Channel ist nicht korrekt konfiguriert.', ephemeral: true });
    }

    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: `✅ Ankündigung in ${channel} gepostet.`, ephemeral: true });
  },
};

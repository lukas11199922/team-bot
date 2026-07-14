const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { isTeamOrMod, denyNoPermission } = require('../../utils/permissions');
const { baseEmbed } = require('../../utils/embeds');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meeting')
    .setDescription('Team-Meetings verwalten')
    .addSubcommand((sub) =>
      sub
        .setName('planen')
        .setDescription('Lädt das Team zu einem Meeting ein')
        .addStringOption((o) => o.setName('datum').setDescription('Datum des Meetings').setRequired(true))
        .addStringOption((o) => o.setName('uhrzeit').setDescription('Uhrzeit des Meetings').setRequired(true))
        .addStringOption((o) => o.setName('thema').setDescription('Thema/Agenda').setRequired(false))
    )
    .addSubcommand((sub) =>
      sub
        .setName('protokoll')
        .setDescription('Schreibt ein Protokoll ins Protokoll-Channel')
        .addStringOption((o) => o.setName('text').setDescription('Inhalt des Protokolls').setRequired(true))
    ),

  async execute(interaction) {
    if (!isTeamOrMod(interaction.member)) return denyNoPermission(interaction);

    const sub = interaction.options.getSubcommand();

    if (sub === 'planen') {
      const datum = interaction.options.getString('datum');
      const uhrzeit = interaction.options.getString('uhrzeit');
      const thema = interaction.options.getString('thema');

      const embed = baseEmbed()
        .setTitle('📅 Team-Meeting')
        .addFields({ name: 'Termin', value: `${datum} um ${uhrzeit} Uhr` });
      if (thema) embed.addFields({ name: 'Thema', value: thema });

      const teamRoleMention = config.roles.team && config.roles.team !== 'TEAM_ROLLEN_ID_HIER_EINTRAGEN' ? `<@&${config.roles.team}>` : '@Team';

      await interaction.reply({ content: teamRoleMention, embeds: [embed] });
    } else {
      const text = interaction.options.getString('text');
      const embed = baseEmbed(config.colors.info)
        .setTitle('🗒️ Meeting-Protokoll')
        .setDescription(text)
        .setFooter({ text: `Verfasst von ${interaction.user.tag}` });

      const channel =
        config.channels.protokoll && config.channels.protokoll !== 'PROTOKOLL_CHANNEL_ID'
          ? await interaction.guild.channels.fetch(config.channels.protokoll).catch(() => null)
          : interaction.channel;

      if (!channel || channel.type !== ChannelType.GuildText) {
        return interaction.reply({ content: '❌ Protokoll-Channel ist nicht korrekt konfiguriert.', ephemeral: true });
      }

      await channel.send({ embeds: [embed] });
      await interaction.reply({ content: `✅ Protokoll in ${channel} gepostet.`, ephemeral: true });
    }
  },
};

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { baseEmbed } = require('../../utils/embeds');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('abwesenheit')
    .setDescription('Melde dem Team, dass du ausfällst (Team)')
    .addStringOption((o) => o.setName('von').setDescription('Ab wann (z. B. Datum)').setRequired(true))
    .addStringOption((o) => o.setName('bis').setDescription('Bis wann (z. B. Datum)').setRequired(true))
    .addStringOption((o) => o.setName('grund').setDescription('Grund (optional)').setRequired(false)),

  async execute(interaction) {
    const von = interaction.options.getString('von');
    const bis = interaction.options.getString('bis');
    const grund = interaction.options.getString('grund');

    const embed = baseEmbed(config.colors.warning)
      .setTitle('🌴 Abwesenheitsmeldung')
      .setDescription(`${interaction.user} fällt aus.`)
      .addFields({ name: 'Zeitraum', value: `${von} – ${bis}` });
    if (grund) embed.addFields({ name: 'Grund', value: grund });

    const channel =
      config.channels.abwesenheit && config.channels.abwesenheit !== 'ABWESENHEIT_CHANNEL_ID'
        ? await interaction.guild.channels.fetch(config.channels.abwesenheit).catch(() => null)
        : interaction.channel;

    if (channel && channel.type === ChannelType.GuildText) {
      await channel.send({ embeds: [embed] });
      await interaction.reply({ content: '✅ Deine Abwesenheit wurde gemeldet.', ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embed] });
    }
  },
};

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const db = require('../../database');
const { isTeamOrMod, denyNoPermission } = require('../../utils/permissions');
const { baseEmbed } = require('../../utils/embeds');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('onair')
    .setDescription('Steuert den Sende-Status')
    .addSubcommand((sub) =>
      sub
        .setName('start')
        .setDescription('Sendung starten — postet in "jetzt läuft"')
        .addStringOption((o) => o.setName('titel').setDescription('Titel/Thema der Sendung').setRequired(true))
        .addStringOption((o) => o.setName('song').setDescription('Aktuell laufender Song-Titel'))
        .addStringOption((o) => o.setName('artist').setDescription('Interpret des Songs'))
    )
    .addSubcommand((sub) => sub.setName('ende').setDescription('Sendung beenden')),

  async execute(interaction) {
    if (!isTeamOrMod(interaction.member)) return denyNoPermission(interaction);

    const sub = interaction.options.getSubcommand();
    const channel =
      config.channels.jetztLaeuft && config.channels.jetztLaeuft !== 'JETZT_LAEUFT_CHANNEL_ID'
        ? await interaction.guild.channels.fetch(config.channels.jetztLaeuft).catch(() => null)
        : null;

    if (sub === 'start') {
      const titel = interaction.options.getString('titel');
      const song = interaction.options.getString('song');
      const artist = interaction.options.getString('artist');

      if (song && artist) {
        db.prepare('INSERT INTO tracks (guildId, title, artist, postedBy, createdAt) VALUES (?, ?, ?, ?, ?)').run(
          interaction.guildId, song, artist, interaction.user.id, Date.now()
        );
      }

      const embed = baseEmbed(config.colors.success)
        .setTitle('🔴 Jetzt läuft')
        .setDescription(`**${titel}**`)
        .addFields({ name: 'Moderiert von', value: `${interaction.user}` });
      if (song) embed.addFields({ name: 'Aktueller Song', value: artist ? `${song} – ${artist}` : song });

      if (channel && channel.type === ChannelType.GuildText) {
        await channel.send({ embeds: [embed] });
        await interaction.reply({ content: '✅ Sendung gestartet und gepostet.', ephemeral: true });
      } else {
        await interaction.reply({ embeds: [embed] });
      }
    } else {
      const embed = baseEmbed(config.colors.info).setTitle('⏹️ Sendung beendet').setDescription(`Beendet von ${interaction.user}`);

      if (channel && channel.type === ChannelType.GuildText) {
        await channel.send({ embeds: [embed] });
        await interaction.reply({ content: '✅ Sendung beendet.', ephemeral: true });
      } else {
        await interaction.reply({ embeds: [embed] });
      }
    }
  },
};

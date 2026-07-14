const { SlashCommandBuilder, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { isTeamOrMod, denyNoPermission } = require('../../utils/permissions');
const { baseEmbed } = require('../../utils/embeds');
const config = require('../../../config.json');

const DATA_PATH = path.join(__dirname, '..', '..', '..', 'data', 'sendeplan.json');

function buildEmbed() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const embed = baseEmbed().setTitle('🗓️ Sendeplan');

  if (!data.eintraege || data.eintraege.length === 0) {
    embed.setDescription('Aktuell ist noch kein Sendeplan hinterlegt.');
  } else {
    embed.setDescription(
      data.eintraege
        .map((e) => `**${e.tag}** · ${e.zeit}\n${e.sendung} — ${e.moderator}`)
        .join('\n\n')
    );
  }
  return embed;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sendeplan')
    .setDescription('Sendeplan verwalten')
    .addSubcommand((sub) => sub.setName('anzeigen').setDescription('Zeigt den aktuellen Sendeplan'))
    .addSubcommand((sub) => sub.setName('posten').setDescription('Postet den Sendeplan in den Sendeplan-Channel (Team)')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'anzeigen') {
      return interaction.reply({ embeds: [buildEmbed()] });
    }

    // posten
    if (!isTeamOrMod(interaction.member)) return denyNoPermission(interaction);

    const channel =
      config.channels.sendeplan && config.channels.sendeplan !== 'SENDEPLAN_CHANNEL_ID'
        ? await interaction.guild.channels.fetch(config.channels.sendeplan).catch(() => null)
        : interaction.channel;

    if (!channel || channel.type !== ChannelType.GuildText) {
      return interaction.reply({ content: '❌ Sendeplan-Channel ist nicht korrekt konfiguriert.', ephemeral: true });
    }

    await channel.send({ embeds: [buildEmbed()] });
    await interaction.reply({ content: `✅ Sendeplan in ${channel} gepostet.`, ephemeral: true });
  },
};

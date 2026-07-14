const { SlashCommandBuilder } = require('discord.js');
const { isTeamOrMod, denyNoPermission } = require('../../utils/permissions');
const { baseEmbed } = require('../../utils/embeds');
const db = require('../../database');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Schaltet einen User stumm (Timeout) (Team/Mod)')
    .addUserOption((o) => o.setName('user').setDescription('Der stummzuschaltende User').setRequired(true))
    .addIntegerOption((o) =>
      o.setName('minuten').setDescription('Dauer des Timeouts in Minuten').setRequired(true).setMinValue(1).setMaxValue(40320)
    )
    .addStringOption((o) => o.setName('grund').setDescription('Grund für den Timeout').setRequired(false)),

  async execute(interaction) {
    if (!isTeamOrMod(interaction.member)) return denyNoPermission(interaction);

    const user = interaction.options.getUser('user');
    const minuten = interaction.options.getInteger('minuten');
    const grund = interaction.options.getString('grund') ?? 'Kein Grund angegeben';

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: '❌ User nicht auf diesem Server gefunden.', ephemeral: true });
    if (!member.moderatable) {
      return interaction.reply({ content: '❌ Ich kann diesen User nicht timeouten (Rollen-Hierarchie).', ephemeral: true });
    }

    await member.timeout(minuten * 60 * 1000, grund);

    db.prepare('INSERT INTO modlog (guildId, type, userId, moderatorId, reason, createdAt) VALUES (?, ?, ?, ?, ?, ?)').run(
      interaction.guildId, 'timeout', user.id, interaction.user.id, `${grund} (${minuten} Min.)`, Date.now()
    );

    const embed = baseEmbed(config.colors.warning)
      .setTitle('🔇 Timeout gesetzt')
      .setDescription(`${user} wurde für **${minuten} Minuten** stummgeschaltet.`)
      .addFields({ name: 'Grund', value: grund });

    await interaction.reply({ embeds: [embed] });
  },
};

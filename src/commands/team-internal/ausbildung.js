const { SlashCommandBuilder } = require('discord.js');
const { isTeamOrMod, denyNoPermission } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ausbildung')
    .setDescription('Postet eine Erinnerung an einen Ausbildungstermin (Team/Mod)')
    .addRoleOption((o) => o.setName('rolle').setDescription('Rolle, die gepingt werden soll').setRequired(true))
    .addUserOption((o) => o.setName('ausbilder').setDescription('Der Ausbilder').setRequired(true))
    .addUserOption((o) => o.setName('azubi').setDescription('Der Azubi').setRequired(true))
    .addStringOption((o) => o.setName('datum').setDescription('Datum der Ausbildung (z. B. 15.07.2026)').setRequired(true))
    .addStringOption((o) => o.setName('uhrzeit').setDescription('Uhrzeit der Ausbildung (z. B. 18:00)').setRequired(true)),

  async execute(interaction) {
    if (!isTeamOrMod(interaction.member)) return denyNoPermission(interaction);

    const rolle = interaction.options.getRole('rolle');
    const ausbilder = interaction.options.getUser('ausbilder');
    const azubi = interaction.options.getUser('azubi');
    const datum = interaction.options.getString('datum');
    const uhrzeit = interaction.options.getString('uhrzeit');

    const content =
      `⏰ __**Ausbildungserinnerung**__\n` +
      `${rolle} Erinnerung an die Ausbildung zwischen ${ausbilder} und ${azubi} am **${datum} um ${uhrzeit} Uhr**!`;

    await interaction.reply({
      content,
      allowedMentions: { roles: [rolle.id], users: [ausbilder.id, azubi.id] },
    });
  },
};

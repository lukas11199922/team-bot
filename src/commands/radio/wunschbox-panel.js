// discord.js v14 – /gruwu (Grüße & Wünsche)
// Sendet den Songwunsch per POST an das Wunschbox-Backend.

const { SlashCommandBuilder } = require('discord.js');

const ENDPOINT = 'https://panel.joystream-fm.de/api/gruwu_submit';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gruwu')
    .setDescription('Schick uns deinen Gruß und/oder Songwunsch für die nächste Sendung')
    .addStringOption(option =>
      option.setName('wunsch')
        .setDescription('Dein Songwunsch (Titel/Interpret)')
        .setRequired(false)
        .setMaxLength(300)
    )
    .addStringOption(option =>
      option.setName('gruss')
        .setDescription('Dein Grußtext')
        .setRequired(false)
        .setMaxLength(500)
    )
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Name, der genannt werden soll (Standard: dein Discord-Name)')
        .setRequired(false)
        .setMaxLength(100)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const name = interaction.options.getString('name') ?? interaction.user.username;
    const gruss = interaction.options.getString('gruss') ?? '';
    const wunsch = interaction.options.getString('wunsch') ?? '';

    if (!gruss && !wunsch) {
      await interaction.editReply('❌ Bitte gib mindestens einen Gruß oder einen Songwunsch an.');
      return;
    }

    try {
      const body = new URLSearchParams({ name, gruss, wunsch });
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      await interaction.editReply('✅ GruWu wurde gesendet!');
    } catch (e) {
      await interaction.editReply('❌ Fehler: ' + e.message);
    }
  },
};

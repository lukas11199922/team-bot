const config = require('../../config.json');
const { PermissionFlagsBits } = require('discord.js');

/** true, wenn das Mitglied die Team- oder Mod-Rolle hat (oder Admin ist) */
function isTeamOrMod(member) {
  if (!member) return false;
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  const roles = member.roles.cache;
  return roles.has(config.roles.team) || roles.has(config.roles.mod);
}

/** true, wenn das Mitglied speziell die Mod-Rolle hat (für harte Mod-Aktionen) */
function isMod(member) {
  if (!member) return false;
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  return member.roles.cache.has(config.roles.mod);
}

/** Antwortet mit einer "keine Berechtigung"-Nachricht (ephemeral) */
async function denyNoPermission(interaction) {
  await interaction.reply({
    content: '❌ Dafür brauchst du die **Team**- oder **Mod**-Rolle.',
    ephemeral: true,
  });
}

module.exports = { isTeamOrMod, isMod, denyNoPermission };

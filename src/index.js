require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  ChannelType,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const db = require('./database');
const config = require('../config.json');
const { baseEmbed } = require('./utils/embeds');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages],
  partials: [Partials.Channel],
});

// --- Befehle laden ---------------------------------------------------------
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');

for (const folder of fs.readdirSync(commandsPath)) {
  const folderPath = path.join(commandsPath, folder);
  for (const file of fs.readdirSync(folderPath).filter((f) => f.endsWith('.js'))) {
    const command = require(path.join(folderPath, file));
    client.commands.set(command.data.name, command);
  }
}

client.once('ready', () => {
  console.log(`✅ Eingeloggt als ${client.user.tag} — ${client.commands.size} Befehle geladen.`);
});

// --- Interaktionen -----------------------------------------------------------
client.on('interactionCreate', async (interaction) => {
  try {
    // Slash-Commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
      return;
    }

    // Buttons
    if (interaction.isButton()) {
      if (interaction.customId === 'wunschbox_open') {
        const modal = new ModalBuilder().setCustomId('wunschbox_modal').setTitle('Songwunsch abgeben');
        const wishInput = new TextInputBuilder()
          .setCustomId('wish_text')
          .setLabel('Welchen Song wünschst du dir?')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(200);
        modal.addComponents(new ActionRowBuilder().addComponents(wishInput));
        await interaction.showModal(modal);
        return;
      }

      if (interaction.customId === 'ticket_open') {
        const existing = db
          .prepare("SELECT * FROM tickets WHERE guildId = ? AND userId = ? AND status = 'offen'")
          .get(interaction.guildId, interaction.user.id);

        if (existing) {
          return interaction.reply({ content: `❌ Du hast bereits ein offenes Ticket: <#${existing.channelId}>`, ephemeral: true });
        }

        const overwrites = [
          { id: interaction.guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ];
        if (config.roles.team && config.roles.team !== 'TEAM_ROLLEN_ID_HIER_EINTRAGEN') {
          overwrites.push({ id: config.roles.team, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] });
        }
        if (config.roles.mod && config.roles.mod !== 'MOD_ROLLEN_ID_HIER_EINTRAGEN') {
          overwrites.push({ id: config.roles.mod, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] });
        }

        const channelOptions = {
          name: `ticket-${interaction.user.username}`.toLowerCase().slice(0, 90),
          type: ChannelType.GuildText,
          permissionOverwrites: overwrites,
        };
        if (config.channels.ticketCategory && config.channels.ticketCategory !== 'TICKET_KATEGORIE_ID') {
          channelOptions.parent = config.channels.ticketCategory;
        }

        const channel = await interaction.guild.channels.create(channelOptions);

        db.prepare('INSERT INTO tickets (channelId, guildId, userId, status, createdAt) VALUES (?, ?, ?, ?, ?)').run(
          channel.id, interaction.guildId, interaction.user.id, 'offen', Date.now()
        );

        const embed = baseEmbed()
          .setTitle('🎫 Ticket eröffnet')
          .setDescription(`Hallo ${interaction.user}! Beschreib kurz dein Anliegen, das Team meldet sich.\n\nMit \`/close\` kann dieses Ticket geschlossen werden.`);
        const closeRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('ticket_close_button').setLabel('Ticket schließen').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await channel.send({ content: `${interaction.user}`, embeds: [embed], components: [closeRow] });
        await interaction.reply({ content: `✅ Dein Ticket wurde erstellt: ${channel}`, ephemeral: true });
        return;
      }

      if (interaction.customId === 'ticket_close_button') {
        const ticket = db.prepare('SELECT * FROM tickets WHERE channelId = ?').get(interaction.channel.id);
        if (!ticket) return interaction.reply({ content: '❌ Dies ist kein Ticket-Channel.', ephemeral: true });

        await interaction.reply({ content: `🔒 Ticket wird von ${interaction.user} geschlossen. Channel wird in 5 Sekunden gelöscht.` });
        db.prepare('UPDATE tickets SET status = ? WHERE channelId = ?').run('geschlossen', interaction.channel.id);
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        return;
      }
    }

    // Modals
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'wunschbox_modal') {
        const wish = interaction.fields.getTextInputValue('wish_text');
        db.prepare('INSERT INTO wishes (guildId, userId, wish, createdAt) VALUES (?, ?, ?, ?)').run(
          interaction.guildId, interaction.user.id, wish, Date.now()
        );
        await interaction.reply({ content: `✅ Danke! Dein Songwunsch **"${wish}"** wurde eingereicht.`, ephemeral: true });
        return;
      }
    }
  } catch (err) {
    console.error(err);
    const errorPayload = { content: '❌ Da ist etwas schiefgelaufen. Bitte versuch es erneut.', ephemeral: true };
    if (interaction.isRepliable()) {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorPayload).catch(() => {});
      } else {
        await interaction.reply(errorPayload).catch(() => {});
      }
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

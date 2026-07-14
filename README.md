# Joystream FM — Team-Bot

Discord-Bot mit allen Team-/Moderations-Befehlen für Joystream FM, inkl. dem neuen `/ausbildung`-Befehl.

## 1. Voraussetzungen

- Node.js 18 oder neuer
- Ein Discord-Bot im [Discord Developer Portal](https://discord.com/developers/applications) erstellt
- Bot mit folgenden **Privileged Gateway Intents** aktiviert: `Server Members Intent`
- Bot-Einladungslink mit den Scopes `bot` + `applications.commands` und Admin- bzw. den benötigten Berechtigungen (Kick, Ban, Timeout, Kanäle verwalten)

## 2. Installation

```bash
npm install
cp .env.example .env
```

Trage in `.env` ein:
- `DISCORD_TOKEN` — Bot-Token
- `CLIENT_ID` — Application ID
- `GUILD_ID` — Server-ID (für sofortige Befehls-Registrierung während der Entwicklung; für den Live-Betrieb auf mehreren Servern leer lassen)

## 3. Konfiguration (`config.json`)

Trage dort die IDs deines Servers ein (Rechtsklick auf Rolle/Kanal → "ID kopieren", Entwicklermodus muss in Discord aktiviert sein):

| Feld | Bedeutung |
|---|---|
| `roles.team` | Rolle, die als "Team" zählt |
| `roles.mod` | Rolle, die als "Mod" zählt (für harte Aktionen wie Kick/Ban) |
| `roles.azubi` | Azubi-Rolle (aktuell informativ, für spätere Erweiterungen) |
| `channels.modlog` | Channel für `/modlog`-relevante Aktionen |
| `channels.sendeplan` | Ziel-Channel für `/sendeplan posten` |
| `channels.ankuendigung` | Ziel-Channel für `/ankuendigung` |
| `channels.protokoll` | Ziel-Channel für `/meeting protokoll` |
| `channels.jetztLaeuft` | Ziel-Channel für `/onair start` und `/onair ende` |
| `channels.ticketCategory` | Kategorie, in der Ticket-Channels erstellt werden |
| `channels.bugReports` | Ziel-Channel für `/bug` |
| `channels.ideen` | Ziel-Channel für `/idee` |
| `channels.abwesenheit` | Ziel-Channel für `/abwesenheit` |

Ist ein Channel nicht gesetzt (Platzhalter bleibt stehen), postet der Bot stattdessen einfach im aktuellen Channel.

Der Sendeplan-Inhalt selbst liegt in `data/sendeplan.json` — dort könnt ihr die Einträge direkt bearbeiten.

## 4. Befehle registrieren & Bot starten

```bash
npm run deploy   # registriert alle Slash-Commands bei Discord
npm start        # startet den Bot
```

## 5. Enthaltene Befehle

**Moderation:** `/warn`, `/warns`, `/unwarn`, `/clearwarns`, `/timeout`, `/untimeout`, `/kick`, `/ban`, `/modlog`

**Radio:** `/tracklist`, `/onair start`, `/onair ende`, `/sendeplan anzeigen`, `/sendeplan posten`, `/team`, `/wunschbox-panel`

**Tickets:** `/ticket-panel`, `/close`

**Team-Intern:** `/note`, `/notes`, `/teamhelp`, `/teamping`, `/abwesenheit`, `/ankuendigung`, `/aufgabe erstellen`, `/aufgabe liste`, `/ausbildung-panel`, `/ausbildung`, `/meeting planen`, `/meeting protokoll`, `/idee`, `/bug`

## 6. Datenspeicherung

Alle Daten (Verwarnungen, Notizen, Aufgaben, Tickets, Tracks, Wünsche) liegen in `bot.sqlite` im Projektordner. Diese Datei wird beim ersten Start automatisch angelegt.

## Hinweis zu `/ausbildung`

Postet öffentlich genau dieses Format:

```
⏰ __Ausbildungserinnerung__
@Rolle Erinnerung an die Ausbildung zwischen @Ausbilder und @Azubi am **Datum um Uhrzeit Uhr**!
```

Parameter: `rolle` (zu pingende Rolle), `ausbilder`, `azubi`, `datum`, `uhrzeit`. Nur nutzbar mit Team- oder Mod-Rolle.

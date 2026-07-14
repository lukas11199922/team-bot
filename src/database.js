const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'bot.sqlite'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS warns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guildId TEXT NOT NULL,
    userId TEXT NOT NULL,
    reason TEXT NOT NULL,
    moderatorId TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guildId TEXT NOT NULL,
    userId TEXT NOT NULL,
    note TEXT NOT NULL,
    authorId TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS modlog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guildId TEXT NOT NULL,
    type TEXT NOT NULL,
    userId TEXT NOT NULL,
    moderatorId TEXT NOT NULL,
    reason TEXT,
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guildId TEXT NOT NULL,
    azubiId TEXT NOT NULL,
    task TEXT NOT NULL,
    createdBy TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'offen',
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guildId TEXT NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    postedBy TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tickets (
    channelId TEXT PRIMARY KEY,
    guildId TEXT NOT NULL,
    userId TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'offen',
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS wishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guildId TEXT NOT NULL,
    userId TEXT NOT NULL,
    wish TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  );
`);

module.exports = db;

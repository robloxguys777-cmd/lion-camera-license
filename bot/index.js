const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN) {
  throw new Error('DISCORD_TOKEN environment variable is required');
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Force absolute path on Railway
const DATA_DIR = '/app/data';
const LICENSES_PATH = '/app/data/licenses.json';

console.log('[bot] DATA_DIR:', DATA_DIR);
console.log('[bot] LICENSES_PATH:', LICENSES_PATH);

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log('[bot] created data dir:', DATA_DIR);
    } catch (e) {
      console.error('[bot] failed to create data dir', e);
    }
  }
}

function loadLicenses() {
  ensureDataDir();
  try {
    if (!fs.existsSync(LICENSES_PATH)) {
      console.log('[bot] licenses file does not exist yet:', LICENSES_PATH);
      return [];
    }
    const raw = fs.readFileSync(LICENSES_PATH, 'utf8');
    console.log('[bot] loaded licenses from:', LICENSES_PATH);
    console.log('[bot] raw licenses:', raw);
    return JSON.parse(raw);
  } catch (e) {
    console.error('[bot] error loading licenses', e);
    return [];
  }
}

function saveLicenses(licenses) {
  ensureDataDir();
  const json = JSON.stringify(licenses, null, 2);
  fs.writeFileSync(LICENSES_PATH, json, 'utf8');
  console.log('[bot] saved licenses to:', LICENSES_PATH);
}

const commands = [
  { name: 'mylicense', description: 'Get your Lion Camera Mod license key' },
  { name: 'createkey', description: 'Create a test license key for yourself (dev only)' },
  { name: 'debuglicenses', description: 'Show all licenses (dev only)' },
];

client.once('clientReady', () => {
  console.log(`Bot logged in as ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  (async () => {
    try {
      await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
      console.log('Slash commands registered.');
    } catch (err) {
      console.error('Error registering slash commands:', err);
    }
  })();
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const userId = interaction.user.id; // Discord user ID (string)

  if (interaction.commandName === 'mylicense') {
    try {
      const licenses = loadLicenses();

      const licenseIndex = licenses.findIndex(
        (l) => l.discord_id === userId && !l.used_by
      );

      console.log('[mylicense] userId:', userId);
      console.log('[mylicense] found index:', licenseIndex);
      console.log('[mylicense] licenses:', JSON.stringify(licenses));

      if (licenseIndex === -1) {
        return interaction.reply({
          content:
            'No active license found for your account.\n' +
            'Make sure you purchased with this Discord account linked in SellAuth.',
          ephemeral: true,
        });
      }

      const license = licenses[licenseIndex];
      license.used_by = userId;
      saveLicenses(licenses);

      await interaction.reply({
        content: `Your Lion Camera Mod license key:\n\n\`\`\`${license.key}\`\`\``,
        ephemeral: true,
      });
    } catch (e) {
      console.error('[mylicense] error', e);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: 'Something went wrong while fetching your license.',
          ephemeral: true,
        });
      }
    }
    return;
  }

  if (interaction.commandName === 'createkey') {
    try {
      const licenses = loadLicenses();
      const newKey = 'LION-' + Math.random().toString(36).slice(2, 10).toUpperCase();

      licenses.push({
        key: newKey,
        discord_id: userId,
        created_at: new Date().toISOString(),
        used_by: null,
        source: 'createkey-command',
      });

      saveLicenses(licenses);

      await interaction.reply({
        content: `Created test license for you:\n\n\`\`\`${newKey}\`\`\``,
        ephemeral: true,
      });
    } catch (e) {
      console.error('[createkey] error', e);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: 'Something went wrong while creating the key.',
          ephemeral: true,
        });
      }
    }
    return;
  }

  if (interaction.commandName === 'debuglicenses') {
    try {
      const licenses = loadLicenses();
      const lines = licenses.map((l, i) =>
        `${i + 1}. key=${l.key} discord_id=${l.discord_id} used_by=${l.used_by ?? 'null'} source=${l.source ?? 'unknown'}`
      );

      const text =
        lines.length === 0
          ? 'No licenses found.'
          : `Licenses (${licenses.length} total):\n` + lines.join('\n');

      console.log('[debuglicenses] userId:', interaction.user.id);
      console.log('[debuglicenses] licenses:', JSON.stringify(licenses));

      await interaction.reply({
        content: '```\n' + text + '\n```',
        ephemeral: true,
      });
    } catch (e) {
      console.error('[debuglicenses] error', e);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: 'Failed to read licenses.',
          ephemeral: true,
        });
      }
    }
    return;
  }
});

client.login(TOKEN);

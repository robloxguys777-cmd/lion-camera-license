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

const LICENSES_PATH = path.resolve(__dirname, '../data/licenses.json');

function loadLicenses() {
  try {
    const raw = fs.readFileSync(LICENSES_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('[licenses] error loading licenses', e);
    return [];
  }
}

function saveLicenses(licenses) {
  fs.writeFileSync(LICENSES_PATH, JSON.stringify(licenses, null, 2));
}

// Commands to register
const commands = [
  {
    name: 'mylicense',
    description: 'Get your Lion Camera Mod license key',
  },
  {
    name: 'createkey',
    description: 'Create a test license key for yourself (dev only)',
  },
];

client.once('clientReady', () => {
  console.log(`Bot logged in as ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  (async () => {
    try {
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands }
      );
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
    const licenses = loadLicenses();

    // Find an unused license for this exact Discord ID
    const licenseIndex = licenses.findIndex(
      (l) => l.discord_id === userId && !l.used_by
    );

    if (licenseIndex === -1) {
      return interaction.reply({
        content:
          'No active license found for your account.\n' +
          'Make sure you purchased with this Discord account linked in SellAuth.',
        ephemeral: true,
      });
    }

    const license = licenses[licenseIndex];

    // Mark as used
    license.used_by = userId;
    saveLicenses(licenses);

    await interaction.reply({
      content: `Your Lion Camera Mod license key:\n\n\`\`\`${license.key}\`\`\``,
      ephemeral: true,
    });

    return;
  }

  if (interaction.commandName === 'createkey') {
    // Dev-only test command: creates a license for the user who runs it
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

    return;
  }
});

client.login(TOKEN);

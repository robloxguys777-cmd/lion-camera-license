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

const commands = [
  {
    name: 'license',
    description: 'Get your Lion Camera Mod license key',
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

  if (interaction.commandName === 'license') {
    const userId = interaction.user.id; // Discord user ID (string)

    const licenses = loadLicenses();

    // Find an unused license for this exact Discord ID
    const licenseIndex = licenses.findIndex(
      (l) => l.discord_id === userId && !l.used_by
    );

    if (licenseIndex === -1) {
      return interaction.reply({
        content: 'No active license found for your account. Make sure you purchased with this Discord account linked in SellAuth.',
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
});

client.login(TOKEN);

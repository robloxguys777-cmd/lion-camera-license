require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

client.commands = new Collection();

// Load commands (we'll add these files next)
const createkeyCmd = require('./commands/createkey');
const mylicenseCmd = require('./commands/mylicense');

client.commands.set(createkeyCmd.data.name, createkeyCmd);
client.commands.set(mylicenseCmd.data.name, mylicenseCmd);

client.once('ready', () => {
  console.log('Lion License Bot is ready!');

  // Register slash commands to your test guild
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  (async () => {
    try {
      await rest.put(
        Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
        {
          body: [
            createkeyCmd.data.toJSON(),
            mylicenseCmd.data.toJSON()
          ]
        }
      );
      console.log('Slash commands registered.');
    } catch (err) {
      console.error('Failed to register slash commands:', err);
    }
  })();
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error('Error executing command:', err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'There was an error executing this command.',
        ephemeral: true
      });
    }
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

client.login(process.env.DISCORD_TOKEN);

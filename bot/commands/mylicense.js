const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mylicense')
    .setDescription('Get your Lion Camera Mod license key'),
  async execute(interaction) {
    const discordId = interaction.user.id;

    // TODO: Call your backend API to look up the license for this Discord ID.
    // Example (later):
    // const res = await fetch(`http://localhost:3000/license/by-discord/${discordId}`);
    // const data = await res.json();

    // For now, just a mock response.
    return interaction.reply({
      content: 'You have no active license yet. (API integration not yet added.)',
      ephemeral: true
    });
  }
};

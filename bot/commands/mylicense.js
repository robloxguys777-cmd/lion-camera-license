const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mylicense')
    .setDescription('Get your Lion Camera Mod license key'),
  async execute(interaction) {
    const discordId = interaction.user.id;

    const res = await fetch(`http://localhost:3000/license/by-discord/${discordId}`);
    const data = await res.json();

    if (!data.success) {
      return interaction.reply({
        content: data.message || 'No active license found.',
        ephemeral: true
      });
    }

    return interaction.reply({
      content: `Your license key is: \`${data.licenseKey}\``,
      ephemeral: true
    });
  }
};

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createkey')
    .setDescription('Create a license key for Lion Camera Mod (owner only)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to give the key to')
        .setRequired(true)
    ),
  async execute(interaction) {
    const guildOwner = interaction.guild.ownerId;
    if (interaction.user.id !== guildOwner) {
      return interaction.reply({
        content: 'Only the server owner can use this command.',
        ephemeral: true
      });
    }

    const targetUser = interaction.options.getUser('user');

    const res = await fetch('http://localhost:3000/license/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discordId: targetUser.id,
        productId: 'lion-camera'
      })
    });

    const data = await res.json();

    if (!data.success) {
      return interaction.reply({
        content: `Failed to create key: ${data.message || 'unknown error'}`,
        ephemeral: true
      });
    }

    return interaction.reply({
      content: `Key created for ${targetUser.tag}: \`${data.licenseKey}\``,
      ephemeral: true
    });
  }
};

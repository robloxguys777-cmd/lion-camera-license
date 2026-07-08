const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

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
    // Owner-only check
    const guildOwner = interaction.guild.ownerId;
    if (interaction.user.id !== guildOwner) {
      return interaction.reply({
        content: 'Only the server owner can use this command.',
        ephemeral: true
      });
    }

    const targetUser = interaction.options.getUser('user');

    // TODO: Call your backend API to actually create the key.
    // Example (later):
    // const res = await fetch('http://localhost:3000/license/create', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     discordId: targetUser.id,
    //     productId: 'lion-camera'
    //   })
    // });
    // const data = await res.json();

    // For now, just mock a response.
    return interaction.reply({
      content: `Mock key created for ${targetUser.tag}. (API integration not yet added.)`,
      ephemeral: true
    });
  }
};

require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

/* ================== CONFIG ================== */
const VERIFY_ROLE_NAME = "Verified";
const STAFF_ROLE_NAME = "Staff";
const TICKET_CATEGORY_NAME = "Tickets";
const LOG_CHANNEL_NAME = "bot-logs";
/* ============================================ */

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

/* ============ COMMANDS ============ */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

  /* ===== SLASH COMMANDS ===== */
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "verify-panel") {
      const embed = new EmbedBuilder()
        .setTitle("✅ Server Verification")
        .setDescription("Click the button below to verify and access the server.")
        .setColor("Green");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("verify_btn")
          .setLabel("Verify")
          .setStyle(ButtonStyle.Success)
      );

      return interaction.reply({ embeds: [embed], components: [row] });
    }

    if (interaction.commandName === "ticket-panel") {
      const embed = new EmbedBuilder()
        .setTitle("🎟 Support Tickets")
        .setDescription("Choose a category to open a ticket")
        .setColor("Blue");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_general")
          .setLabel("General")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("ticket_support")
          .setLabel("Support")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("ticket_report")
          .setLabel("Report")
          .setStyle(ButtonStyle.Danger)
      );

      return interaction.reply({ embeds: [embed], components: [row] });
    }
  }

  /* ===== BUTTONS ===== */
  if (interaction.isButton()) {

    /* ===== VERIFICATION ===== */
    if (interaction.customId === "verify_btn") {
      const role = interaction.guild.roles.cache.find(r => r.name === VERIFY_ROLE_NAME);
      if (!role) return interaction.reply({ content: "❌ Verify role not found", ephemeral: true });

      if (interaction.member.roles.cache.has(role.id)) {
        return interaction.reply({ content: "✅ You are already verified.", ephemeral: true });
      }

      await interaction.member.roles.add(role);

      const log = interaction.guild.channels.cache.find(c => c.name === LOG_CHANNEL_NAME);
      if (log) log.send(`✅ ${interaction.user.tag} verified`);

      return interaction.reply({ content: "🎉 You are now verified!", ephemeral: true });
    }

    /* ===== TICKETS ===== */
    if (interaction.customId.startsWith("ticket_")) {
      const type = interaction.customId.split("_")[1];

      const staffRole = interaction.guild.roles.cache.find(r => r.name === STAFF_ROLE_NAME);
      let category = interaction.guild.channels.cache.find(
        c => c.name === TICKET_CATEGORY_NAME && c.type === ChannelType.GuildCategory
      );

      if (!category) {
        category = await interaction.guild.channels.create({
          name: TICKET_CATEGORY_NAME,
          type: ChannelType.GuildCategory
        });
      }

      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
          },
          staffRole && {
            id: staffRole.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
          }
        ].filter(Boolean)
      });

      const embed = new EmbedBuilder()
        .setTitle(`🎟 ${type.toUpperCase()} Ticket`)
        .setDescription("Staff will assist you shortly.\nUse buttons below to manage ticket.")
        .setColor("Purple");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_close")
          .setLabel("Close")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("ticket_delete")
          .setLabel("Delete")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [row] });

      return interaction.reply({ content: `🎟 Ticket created: ${channel}`, ephemeral: true });
    }

    /* ===== CLOSE TICKET ===== */
    if (interaction.customId === "ticket_close") {
      await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
        SendMessages: false
      });

      return interaction.reply("🔒 Ticket closed.");
    }

    /* ===== DELETE TICKET ===== */
    if (interaction.customId === "ticket_delete") {
      await interaction.reply("🗑 Deleting ticket...");
      setTimeout(() => interaction.channel.delete(), 2000);
    }
  }
});

/* ============ LOGIN ============ */
client.login(process.env.TOKEN);

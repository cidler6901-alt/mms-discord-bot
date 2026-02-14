require("dotenv").config();
const fs = require("fs");
const path = require("path");
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

/* ================= CONFIG ================= */

const LOG_CHANNEL_ID = "1471862953702850731";

const VERIFIED_ROLE_ID = "1471869407432020000";
const UNVERIFIED_ROLE_ID = "1471868909408751832";

const STAFF_ROLE_IDS = [
  "1471862618280038536", // mod
  "1471862614652092604", // admin
  "1471863675513077791"  // owner
];

const TICKET_CATEGORY_NAME = "🎟 tickets";
const TRANSCRIPT_DIR = "./transcripts";

if (!fs.existsSync(TRANSCRIPT_DIR)) fs.mkdirSync(TRANSCRIPT_DIR);

/* ========================================== */

client.once("ready", () => {
  console.log(`✅ MMS BOT ONLINE: ${client.user.tag}`);
});

/* ============ AUTO UNVERIFY ON LEAVE ============ */
client.on("guildMemberRemove", async (member) => {
  const log = member.guild.channels.cache.get(LOG_CHANNEL_ID);
  if (log) log.send(`🚪 **LEFT:** ${member.user.tag} | Auto-unverify applied`);
});

/* ============ INTERACTIONS ============ */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

  const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

  /* ================= BUTTONS ================= */

  if (interaction.isButton()) {

    /* ===== VERIFY ===== */
    if (interaction.customId === "verify_btn") {
      const accountAge = Date.now() - interaction.user.createdTimestamp;
      if (accountAge < 1000 * 60 * 60 * 24) {
        return interaction.reply({ content: "❌ Account too new to verify.", ephemeral: true });
      }

      if (interaction.member.roles.cache.has(VERIFIED_ROLE_ID)) {
        return interaction.reply({ content: "✅ Already verified.", ephemeral: true });
      }

      await interaction.member.roles.remove(UNVERIFIED_ROLE_ID).catch(()=>{});
      await interaction.member.roles.add(VERIFIED_ROLE_ID);

      if (logChannel) logChannel.send(`✅ **VERIFIED:** ${interaction.user.tag}`);

      return interaction.reply({ content: "🎉 Verification successful!", ephemeral: true });
    }

    /* ===== TICKET CREATE ===== */
    if (interaction.customId.startsWith("ticket_")) {
      const type = interaction.customId.split("_")[1];

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
          { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
          ...STAFF_ROLE_IDS.map(id => ({
            id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
          }))
        ]
      });

      const embed = new EmbedBuilder()
        .setTitle("🎟 Support Ticket")
        .setDescription("Staff will assist you.\nUse controls below.")
        .setColor("Blue");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("ticket_claim").setLabel("Claim").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("ticket_close").setLabel("Close").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("ticket_delete").setLabel("Delete").setStyle(ButtonStyle.Danger)
      );

      await channel.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [row] });

      if (logChannel) logChannel.send(`🎟 **TICKET OPENED:** ${interaction.user.tag}`);

      return interaction.reply({ content: `🎟 Ticket created: ${channel}`, ephemeral: true });
    }

    /* ===== CLAIM ===== */
    if (interaction.customId === "ticket_claim") {
      if (!STAFF_ROLE_IDS.some(id => interaction.member.roles.cache.has(id))) {
        return interaction.reply({ content: "❌ Staff only.", ephemeral: true });
      }

      if (logChannel) logChannel.send(`👮 **CLAIMED:** ${interaction.user.tag} claimed ${interaction.channel.name}`);

      return interaction.reply(`👮 Ticket claimed by ${interaction.user.tag}`);
    }

    /* ===== CLOSE ===== */
    if (interaction.customId === "ticket_close") {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
        SendMessages: false
      });

      if (logChannel) logChannel.send(`🔒 **CLOSED:** ${interaction.channel.name}`);

      return interaction.reply("🔒 Ticket closed.");
    }

    /* ===== DELETE + TRANSCRIPT ===== */
    if (interaction.customId === "ticket_delete") {

      const messages = await interaction.channel.messages.fetch({ limit: 100 });
      let transcript = `Transcript: ${interaction.channel.name}\n\n`;

      messages.reverse().forEach(m => {
        transcript += `[${new Date(m.createdTimestamp).toLocaleString()}] ${m.author.tag}: ${m.content}\n`;
      });

      const filePath = path.join(TRANSCRIPT_DIR, `${interaction.channel.id}.txt`);
      fs.writeFileSync(filePath, transcript);

      if (logChannel) {
        logChannel.send({
          content: `🗑 **TICKET DELETED:** ${interaction.channel.name}`,
          files: [filePath]
        });
      }

      await interaction.reply("🗑 Ticket deleted & transcript saved.");
      setTimeout(() => interaction.channel.delete(), 2000);
    }
  }
});

/* ============ LOGIN ============ */
client.login(process.env.TOKEN);

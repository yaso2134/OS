const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('OS Bot is Online!'));
app.listen(3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const lineImageURL = 'https://cdn.discordapp.com/attachments/1507997898783068210/1508458186619752589/5MQGz1n7.webp?ex=6a159ca9&is=6a144b29&hm=e2289d5dfc472df69654ab380738b814450de34a56760a67d77159ffbc8e641f&';

// 1. قائمة الشتائم
const badWords = ['كسمك', 'شرموط', 'كسختك', 'عرص', 'معرص', 'متناك', 'يلعن ميتين امك', 'كلزق', 'تفو', 'امك', 'ابوك', 'خنيث', 'قحبة', 'منيوك'];

// 2. قائمة الردود التلقائية
const autoResponses = {
    'هلا': 'هلا بك يا غالي منور السيرفر! ✨',
    'h': 'Hello! 🤍',
    '.': 'منور بنقطتك الجميلة. 👑',
    'نقطة': 'منور بنقطتك الجميلة. 👑',
    'برب': 'تيت يا غالي، لا تتأخر علينا! 🚶‍♂️',
    'باك': 'منور السيرفر من جديد يا وحش! 👑',
    'برا': 'اطردوه برة السيرفر بسرعة! 🚪🏃‍♂️',
    'بوت': 'لبيه! أنا في الخدمة، اؤمرني؟ 🤖'
};

// 3. تعريف أوامر السلاش
const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('فحص اتصال البوت'),
    new SlashCommandBuilder().setName('line').setDescription('إرسال خط السيرفر الفخم'),
    new SlashCommandBuilder().setName('prices').setDescription('عرض أسعار الإعلانات'),
    new SlashCommandBuilder().setName('clear').setDescription('مسح الرسائل').addIntegerOption(o => o.setName('عدد').setDescription('العدد').setRequired(true)),
    new SlashCommandBuilder().setName('avatar').setDescription('صورة العضو').addUserOption(o => o.setName('عضو').setDescription('اختر العضو')),
    new SlashCommandBuilder().setName('lock').setDescription('قفل الروم'),
    new SlashCommandBuilder().setName('unlock').setDescription('فتح الروم'),
    new SlashCommandBuilder().setName('ban').setDescription('تبنيد عضو').addUserOption(o => o.setName('عضو').setDescription('العضو').setRequired(true))
].map(c => c.toJSON());

client.on('ready', async () => {
    console.log(`تم تسجيل البوت باسم: ${client.user.tag}`);
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
});

// 4. تنفيذ أوامر السلاش
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    if (commandName === 'line') return await interaction.reply({ files: [new AttachmentBuilder(lineImageURL)] });
    if (commandName === 'ping') return await interaction.reply('بونج! 🏓');
    if (commandName === 'prices') return await interaction.reply(`📊 **قائمة أسعار الإعلانات:**\n📢 برود: 20 ｍ\n🟢 برود اونلاين: 10 ｍ\n🔔 منشن هير: 1 ｍ`);
    if (commandName === 'clear') {
        const num = interaction.options.getInteger('عدد');
        await interaction.channel.bulkDelete(num, true);
        return await interaction.reply({ content: `✅ تم مسح ${num} رسالة.`, ephemeral: true });
    }
    if (commandName === 'avatar') {
        const user = interaction.options.getUser('عضو') || interaction.user;
        return await interaction.reply(user.displayAvatarURL({ dynamic: true, size: 1024 }));
    }
    if (commandName === 'lock') {
        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
        return await interaction.reply('🔒 **تم قفل الروم.**');
    }
    if (commandName === 'unlock') {
        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true });
        return await interaction.reply('🔓 **تم فتح الروم.**');
    }
    if (commandName === 'ban') {
        const member = interaction.options.getMember('عضو');
        await member.ban();
        return await interaction.reply(`🔨 **تم تبنيد ${member.user.username}.**`);
    }
});

// 5. تنفيذ الردود والشتائم
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    const msg = message.content.trim();

    // الشتائم
    if (badWords.some(word => msg.toLowerCase().includes(word))) {
        await message.delete().catch(() => null);
        const warn = await message.channel.send(`⚠️ عيب يا ${message.author}، ممنوع الغلط!`);
        setTimeout(() => warn.delete().catch(() => null), 4000);
        return;
    }

    // الخط
    if (msg === 'خط') return message.channel.send({ files: [new AttachmentBuilder(lineImageURL)] });

    // الردود التلقائية
    if (autoResponses[msg]) return message.reply(autoResponses[msg]);

    // أسعار الإعلانات
    if (msg === 'اسعار الاعلانات' || msg === 'أسعار الإعلانات') return message.reply(`📊 **قائمة أسعار الإعلانات:**\n📢 برود: 20 ｍ\n🟢 برود اونلاين: 10 ｍ\n🔔 منشن هير: 1 ｍ`);

    // السلام
    if (msg.includes('السلام عليكم') || msg === 'للسلام') return message.reply('وعليكم السلام، منور يا بطل! ❤️');
});

client.login(process.env.DISCORD_TOKEN);

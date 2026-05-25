const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('السيرفر شغال ومحدث بقائمة الشتايم كاملة!'));
app.listen(3000, () => console.log('جاهز'));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// 1. أوامر السلاش (/) اللي بتظهر في القائمة
const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('فحص البوت'),
    new SlashCommandBuilder().setName('line').setDescription('خط فاصل للشات'),
    new SlashCommandBuilder().setName('prices').setDescription('عرض أسعار الإعلانات'),
    new SlashCommandBuilder().setName('clear').setDescription('مسح الرسائل')
        .addIntegerOption(option => option.setName('عدد').setDescription('العدد').setRequired(true))
].map(command => command.toJSON());

// القائمة الكاملة من الفيديو بتاعك لمنع الشتائم
const badWords = [
    'كسمك', 'شرموط', 'كسختك', 'عرص', 'معرص', 'متناك', 
    'يلعن ميتين امك', 'كلزق', 'تفو', 'امك', 'ابوك', 
    'خنيث', 'قحبة', 'منيوك', 'كس', 'زب', 'طيز'
];

// قائمة الردود التلقائية العادية
const autoResponses = {
    'هلا': 'هلا بك يا غالي منور السيرفر! ✨',
    'h': 'Hello! 🤍',
    '.': 'منور بنقطتك الجميلة. 👑',
    'برا': 'اطردوه برة السيرفر بسرعة! 🚪🏃‍♂️',
    'انبان': 'تم فك الباند بنجاح (أمر وهمي للتسلية).',
    'بوت': 'لبيه! أنا في الخدمة, اؤمرني؟ 🤖',
    'للمشي': 'تروح وترجع بالسلامة يا غالي. 👣',
    'برب': 'تيت، لا تتأخر علينا يا بطل! 👋'
};

client.on('ready', async () => {
    console.log(`تم التشغيل: ${client.user.tag}`);
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('تم تسجيل الأوامر');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    if (commandName === 'ping') return await interaction.reply('بونج! 🏓');
    if (commandName === 'line') return await interaction.reply('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬');
    if (commandName === 'prices') {
        return await interaction.reply(`📊 **قائمة أسعار الإعلانات:**\n\n📢 **ارسال للكل برود:** 20 ｍ\n🟢 **ارسال برود الاونلاين فقط:** 10 ｍ\n🔔 **اعلان ب منشن هير:** 1 ｍ`);
    }
    if (commandName === 'clear') {
        if (!interaction.member.permissions.has('ManageMessages')) return await interaction.reply({ content: 'ما عندك صلاحية! ❌', ephemeral: true });
        const amount = interaction.options.getInteger('عدد');
        await interaction.deferReply({ ephemeral: true });
        await interaction.channel.bulkDelete(amount, true).catch(() => null);
        return await interaction.editReply(`تم مسح ${amount} رسالة! 🧹`);
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    const msg = message.content.trim().toLowerCase();

    // نظام الفحص والمنع (لو النص فيه أي كلمة من لستة الشتايم بيمسحها فوراً)
    const hasBadWord = badWords.some(word => msg.includes(word));
    if (hasBadWord) {
        try { 
            await message.delete(); 
            const warning = await message.channel.send(`⚠️ عيب يا ${message.author}، ممنوع الغلط في السيرفر!`);
            setTimeout(() => warning.delete().catch(() => null), 3000); // يمسح التنبيه بعد 3 ثواني
        } catch (err) {
            console.log('صلاحيات ناقصة لمسح الرسالة');
        }
        return;
    }

    // الأوامر والردود بالشات العادي
    if (msg === 'خط') return message.reply('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬');
    if (msg === 'اسعار الاعلانات') {
        return message.reply(`📊 **قائمة أسعار الإعلانات:**\n\n📢 **ارسال للكل برود:** 20 ｍ\n🟢 **ارسال برود الاونلاين فقط:** 10 ｍ\n🔔 **اعلان ب منشن هير:** 1 ｍ`);
    }
    if (msg.includes('السلام عليكم') || msg === 'للسلام' || msg === 'للسلام 2') {
        return message.reply('وعليكم السلام ورحمة الله وبركاته، منور السيرفر! ❤️');
    }
    
    if (autoResponses[msg]) return message.reply(autoResponses[msg]);
});

client.login(process.env.DISCORD_TOKEN);
        

const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('البوت شغال 24 ساعة!'));
app.listen(3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// قائمة الشتايم اللي البوت هيمسحها (تقدر تزود عليها)
const badWords = ['كسمك', 'شرموط', 'كسختك', 'عرص', 'معرص', 'متناك', 'يلعن ميتين امك', 'كلزق'];

// نظام الردود التلقائية اللي كانت عندك في الفيديو
const autoResponses = {
    'هلا': 'هلا بك يا غالي منور السيرفر! ✨',
    'h': 'Hello! 🤍',
    'اسعار الاعلانات': 'سيتم تزويدك بأسعار الإعلانات قريباً، انتظر الدعم الإداري.',
    '.': 'منور بنقطتك الجميلة. 👑',
    `تفو': 'عيب يا محترم،. 😡',
    'برا': 'اطردوه برة السيرفر بسرعة! 🚪🏃‍♂️',
    'انبان': 'تم فك الباند بنجاح (أمر وهمي للتسلية).',
    'بوت': 'لبيه! أنا في الخدمة، اؤمرني؟ 🤖',
    'خط': '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬',
    'للمشي': 'تروح وترجع بالسلامة يا غالي. 👣',
    'برب': 'تيت، لا تتأخر علينا يا بطل! 👋',
    'للسلام': 'وعليكم السلام ورحمة الله وبركاته، أهلاً بك! 🌹',
    'السلام عليكم': 'وعليكم السلام ورحمة الله وبركاته، منور السيرفر! ❤️',
    'للسلام 2': 'سلام عليكم، أهلاً وسهلاً! 👋'
};

client.on('ready', () => {
    console.log(`تم تشغيل البوت بنجاح باسم: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // قراءة رسائل الأعضاء فقط

    const msgContent = message.content.trim();

    // 1. نظام حماية ومنع الشتائم
    const hasBadWord = badWords.some(word => msgContent.includes(word));
    if (hasBadWord) {
        try {
            await message.delete(); // مسح الشتيمة فوراً
            const warning = await message.channel.send(`⚠️ عيب يا ${message.author}، ممنوع الشتائم في السيرفر!`);
            setTimeout(() => warning.delete().catch(() => null), 5000); // مسح التنبيه بعد 5 ثواني
        } catch (err) {
            console.log('نقص صلاحيات لمسح الرسالة:', err);
        }
        return;
    }

    // 2. نظام الردود التلقائية
    if (autoResponses[msgContent]) {
        return message.reply(autoResponses[msgContent]);
    }

    // 3. أمر مسح الرسائل (مسح 5 أو مسح 10)
    if (msgContent === 'مسح 5*') {
        if (!message.member.permissions.has('ManageMessages')) return message.reply('ما عندك صلاحية إدارة الرسائل! ❌');
        await message.channel.bulkDelete(6, true).catch(() => null);
    }
    
    if (msgContent === 'مسح 10*') {
        if (!message.member.permissions.has('ManageMessages')) return message.reply('ما عندك صلاحية إدارة الرسائل! ❌');
        await message.channel.bulkDelete(11, true).catch(() => null);
    }

    // أمر فحص التشغيل القديم
    if (msgContent === 'بنج') {
        message.reply('بونج! 🏓');
    }
});

client.login(process.env.DISCORD_TOKEN);

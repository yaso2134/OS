const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('البوت شغال 24 ساعة ومستقر!'));
app.listen(3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// قائمة الشتايم
const badWords = ['كسمك', 'شرموط', 'كسختك', 'عرص', 'معرص', 'متناك', 'ميتين امك', 'كلزق'];

client.on('ready', () => {
    console.log(`تم تشغيل البوت بنجاح باسم: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // تنظيف النص من المسافات الزايدة
    const msg = message.content.trim().toLowerCase();

    // 1. نظام الحماية ومنع الشتائم (يبحث في النص كله)
    const hasBadWord = badWords.some(word => msg.includes(word));
    if (hasBadWord) {
        try {
            await message.delete();
            const warning = await message.channel.send(`⚠️ عيب يا ${message.author}، ممنوع الغلط في السيرفر!`);
            setTimeout(() => warning.delete().catch(() => null), 4000);
        } catch (err) {
            console.log('نقص صلاحيات مسح الرسائل');
        }
        return;
    }

    // 2. نظام الردود الذكي (بيقرأ الكلمة حتى لو معاها مسافات)
    if (msg.includes(, سلام عليكم'السلام عليكم') || msg === 'للسلام' || msg === 'للسلام 2') {
        return message.reply('وعليكم السلام ورحمة الله وبركاته، منور السيرفر يا غالي! ❤️');
    }
    if (msg === 'هلا') {
        return message.reply('هلا بك يا حُب منور! ✨');
    }
    if (msg === 'h') {
        return message.reply('Hello! 🤍');
    }
    if (msg.includes('اسعار الاعلانات')) {
        return message.reply('سيتم تزويدك بأسعار الإعلانات قريباً، انتظر الدعم الإداري.');
    }
    if (msg === '.') {
        return message.reply('منور بنقطتك الجميلة. 👑');
    }
    if (msg === 'تفو') {
        return message.reply('عيب يا محترم، خلي أسلوبك أرقى من كده. 😡');
    }
    if (msg === 'برا') {
        return message.reply('اطردوه برة السيرفر بسرعة! 🚪🏃‍♂️');
    }
    if (msg === 'انبان') {
        return message.reply('تم فك الباند بنجاح (أمر وهمي للتسلية).');
    }
    if (msg === 'بوت') {
        return message.reply('لبيه! أنا في الخدمة، اؤمرني؟ 🤖');
    }
    if (msg === 'خط') {
        return message.reply('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬');
    }
    if (msg === 'للمشي' || msg === 'برب') {
        return message.reply('تروح وترجع بالسلامة، لا تتأخر علينا! 👋');
    }
    if (msg === 'بنج') {
        return message.reply('بونج! 🏓');
    }

    // 3. أوامر المسح (سهلتها لك: اكتب مسح 5 أو مسح 10 علطول)
    if (msg.startsWith('مسح ')) {
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply('ما عندك صلاحية إدارة الرسائل! ❌');
        }
        
        const args = msg.split(' ');
        const amount = parseInt(args[1]);

        if (!isNaN(amount) && amount > 0 && amount <= 100) {
            // نمسح رسالة الأمر + العدد المطلوب
            await message.channel.bulkDelete(amount + 1, true).catch(() => null);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);

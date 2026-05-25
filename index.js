const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');
const app = express();

// تشغيل سيرفر ويب عشان رندر يفضل صاحي
app.get('/', (req, res) => res.send('البوت مستقر وشغال 100%!'));
app.listen(3000, () => console.log('سيرفر الويب جاهز.'));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// 1. تعريف أوامر السلاش (/) اللي بتظهر في القائمة
const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('فحص سرعة اتصال البوت'),
    new SlashCommandBuilder().setName('line').setDescription('خط فاصل جميل للشات'),
    new SlashCommandBuilder().setName('prices').setDescription('عرض أسعار الإعلانات بالتفصيل'),
    new SlashCommandBuilder().setName('bc-all').setDescription('أمر إعلان برودكاست للكل'),
    new SlashCommandBuilder().setName('bc-online').setDescription('أمر إعلان برودكاست للأونلاين فقط'),
    new SlashCommandBuilder().setName('bc-here').setDescription('أمر إعلان مع منشن هير'),
    new SlashCommandBuilder().setName('clear').setDescription('مسح عدد معين من الرسائل')
        .addIntegerOption(option => option.setName('عدد').setDescription('عدد الرسائل المراد مسحها').setRequired(true))
].map(command => command.toJSON());

// قائمة الشتائم
const badWords = ['كسمك', 'شرموط', 'كسختك', 'عرص', 'معرص', 'متناك', 'ميتين امك', 'كلزق'];

// قائمة الردود التلقائية العادية للشات
const autoResponses = {
    'هلا': 'هلا بك يا غالي منور السيرفر! ✨',
    'h': 'Hello! 🤍',
    '.': 'منور بنقطتك الجميلة. 👑',
    'تفو': 'عيب يا محترم، خلي أسلوبك أرقى من كده. 😡',
    'برا': 'اطردوه برة السيرفر بسرعة! 🚪🏃‍♂️',
    'انبان': 'تم فك الباند بنجاح (أمر وهمي للتسلية).',
    'بوت': 'لبيه! أنا في الخدمة، اؤمرني؟ 🤖',
    'للمشي': 'تروح وترجع بالسلامة يا غالي. 👣',
    'برب': 'تيت، لا تتأخر علينا يا بطل! 👋'
};

// 2. تسجيل الأوامر عند التشغيل
client.on('ready', async () => {
    console.log(`تم تشغيل البوت: ${client.user.tag}`);
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('تم تسجيل أوامر السلاش بنجاح!');
    } catch (error) {
        console.error('خطأ في تسجيل الأوامر:', error);
    }
});

// 3. التحكم في أوامر السلاش (/)
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    try {
        if (commandName === 'ping') return await interaction.reply('بونج! 🏓');
        if (commandName === 'line') return await interaction.reply('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬');
        
        if (commandName === 'prices') {
            const pricesText = `📊 **قائمة أسعار الإعلانات في السيرفر:**\n\n` +
                               `📢 **ارسال للكل برود:** 20 ｍ\n` +
                               `🟢 **ارسال برود الاونلاين فقط:** 10 ｍ\n` +
                               `🔔 **اعلان ب منشن هير:** 1 ｍ`;
            return await interaction.reply(pricesText);
        }

        if (commandName === 'bc-all') return await interaction.reply('📢 **ارسال للكل برود 20 ｍ**');
        if (commandName === 'bc-online') return await interaction.reply('🟢 **ارسال برود الاونلاين فقط 10 ｍ**');
        if (commandName === 'bc-here') return await interaction.reply('🔔 **اعلان ب منشن هير 1 ｍ**');

        if (commandName === 'clear') {
            if (!interaction.member.permissions.has('ManageMessages')) {
                return await interaction.reply({ content: 'ما عندك صلاحية إدارة الرسائل! ❌', ephemeral: true });
            }
            const amount = interaction.options.getInteger('عدد');
            if (amount <= 0 || amount > 100) {
                return await interaction.reply({ content: 'يرجى إدخال عدد بين 1 و 100.', ephemeral: true });
            }
            await interaction.deferReply({ ephemeral: true });
            await interaction.channel.bulkDelete(amount, true).catch(() => null);
            return await interaction.editReply(`تم مسح ${amount} رسالة بنجاح! 🧹`);
        }
    } catch (err) {
        console.error('مشكلة في تنفيذ أمر السلاش:', err);
    }
});

// 4. نظام الشات العادي (مسح الشتائم + الردود + أمر الخط القديم)
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const msg = message.content.trim().toLowerCase();

    // فحص ومسح الشتائم فوراً
    const hasBadWord = badWords.some(word => msg.includes(word));
    if (hasBadWord) {
        try {
            await message.delete();
            const warning = await message.channel.send(`⚠️ عيب يا ${message.author}، ممنوع الغلط في السيرفر!`);
            setTimeout(() => warning.delete().catch(() => null), 4000);
        } catch (err) {
            console.log('نقص صلاحيات البوت في مسح الرسائل');
        }
        return;
    }

    // أمر الخط القديم بالشات العادي لو انكتبت كلمة "خط"
    if (msg === 'خط') {
        return message.reply('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬');
    }

    // الرد على أسعار الإعلانات بالشات العادي
    if (msg === 'اسعار الاعلانات') {
        const pricesText = `📊 **قائمة أسعار الإعلانات في السيرفر:**\n\n` +
                           `📢 **ارسال للكل برود:** 20 ｍ\n` +
                           `🟢 **ارسال برود الاونلاين فقط:** 10 ｍ\n` +
                           `🔔 **اعلان ب منشن هير:** 1 ｍ`;
        return message.reply(pricesText);
    }

    // الردود التلقائية الباقية
    if (msg.includes('السلام عليكم') || msg === 'للسلام' || msg === 'للسلام 2') {
        return message.reply('وعليكم السلام ورحمة الله وبركاته، منور السيرفر! ❤️');
    }
    if (autoResponses[msg]) {
        return message.reply(autoResponses[msg]);
    }
});

client.login(process.env.DISCORD_TOKEN);

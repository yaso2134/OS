const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('البوت شغال بـ السلاش، الردود، والمنظف!'));
app.listen(3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// 1. تعريف أوامر السلاش (اللي بتظهر في القائمة)
const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('فحص سرعة اتصال البوت'),
    new SlashCommandBuilder().setName('line').setDescription('خط فاصل جميل للشات'),
    new SlashCommandBuilder().setName('prices').setDescription('عرض أسعار الإعلانات'),
    new SlashCommandBuilder().setName('clear').setDescription('مسح عدد معين من الرسائل')
        .addIntegerOption(option => option.setName('عدد').setDescription('عدد الرسائل المراد مسحها').setRequired(true))
].map(command => command.toJSON());

// قائمة الشتايم اللي البوت هيمسحها تلقائي
const badWords = ['كسمك', 'شرموط', 'كسختك', 'عرص', 'معرص', 'متناك', 'ميتين امك', 'كلزق'];

// قائمة الردود التلقائية العادية في الشات
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

// 2. تسجيل أوامر السلاش أول ما البوت يشتغل
client.on('ready', async () => {
    console.log(`تم تشغيل البوت بنجاح باسم: ${client.user.tag}`);
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('جاري تسجيل أوامر السلاش...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('تم تسجيل أوامر السلاش بنجاح!');
    } catch (error) {
        console.error(error);
    }
});

// 3. تشغيل أوامر السلاش (/)
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') await interaction.reply('بونج! 🏓');
    if (commandName === 'line') await interaction.reply('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬');
    if (commandName === 'prices') await interaction.reply('سيتم تزويدك بأسعار الإعلانات قريباً، انتظر الدعم الإداري.');

    if (commandName === 'clear') {
        if (!interaction.member.permissions.has('ManageMessages')) {
            return interaction.reply({ content: 'ما عندك صلاحية إدارة الرسائل! ❌', ephemeral: true });
        }
        const amount = interaction.options.getInteger('عدد');
        if (amount <= 0 || amount > 100) {
            return interaction.reply({ content: 'يرجى إدخال عدد بين 1 و 100.', ephemeral: true });
        }
        await interaction.deferReply({ ephemeral: true });
        await interaction.channel.bulkDelete(amount, true).catch(() => null);
        await interaction.editReply(`تم مسح ${amount} رسالة بنجاح! 🧹`);
    }
});

// 4. نظام الردود العادية + منع الشتايم في الشات
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const msg = message.content.trim().toLowerCase();

    // فحص الشتايم ويمسحها فوراً
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

    // فحص الردود التلقائية الذكية
    if (msg.includes('السلام عليكم') || msg === 'للسلام' || msg === 'للسلام 2') {
        return message.reply('وعليكم السلام ورحمة الله وبركاته، منور السيرفر! ❤️');
    }
    if (autoResponses[msg]) {
        return message.reply(autoResponses[msg]);
    }
});

client.login(process.env.DISCORD_TOKEN);

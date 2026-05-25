const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('البوت شغال بأعلى كفاءة!'));
app.listen(3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// أوامر السلاش لـ القائمة
const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('فحص سرعة اتصال البوت'),
    new SlashCommandBuilder().setName('line').setDescription('خط فاصل جميل للشات'),
    new SlashCommandBuilder().setName('prices').setDescription('عرض أسعار الإعلانات بالتفصيل'),
    new SlashCommandBuilder().setName('clear').setDescription('مسح عدد معين من الرسائل')
        .addIntegerOption(option => option.setName('عدد').setDescription('عدد الرسائل المراد مسحها').setRequired(true))
].map(command => command.toJSON());

// لستة الشتايم كاملة من الفيديو بتاعك
const badWords = [
    'كسمك', 'شرموط', 'كسختك', 'عرص', 'معرص', 'متناك', 
    'يلعن ميتين امك', 'كلزق', 'تفو', 'امك', 'ابوك', 
    'خنيث', 'قحبة', 'منيوك', 'كس', 'زب', 'طيز'
];

// لستة الردود التلقائية
const autoResponses = {
    'هلا': 'هلا بك يا غالي منور السيرفر! ✨',
    'h': 'Hello! 🤍',
    '.': 'منور بنقطتك الجميلة. 👑',
    'برا': 'اطردوه برة السيرفر بسرعة! 🚪🏃‍♂️',
    'انبان': 'تم فك الباند بنجاح (أمر وهمي للتسلية).',
    'بوت': 'لبيه! أنا في الخدمة، اؤمرني؟ 🤖',
    'للمشي': 'تروح وترجع بالسلامة يا غالي. 👣',
    'برب': 'تيت، لا تتأخر علينا يا بطل! 👋'
};

client.on('ready', async () => {
    console.log(`تم تشغيل البوت بنجاح باسم: ${client.user.tag}`);
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('تم تسجيل أوامر السلاش بنجاح!');
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
        return await interaction.reply(`📊 **قائمة أسعار الإعلانات في السيرفر:**\n\n📢 **ارسال للكل برود:** 20 ｍ\n🟢 **ارسال برود الاونلاين فقط:** 10 ｍ\n🔔 **اعلان ب منشن هير:** 1 ｍ`);
    }
    if (commandName === 'clear') {
        if (!interaction.member.permissions.has('ManageMessages')) return await interaction.reply({ content: 'ما عندك صلاحية إدارة الرسائل! ❌', ephemeral: true });
        const amount = interaction.options.getInteger('عدد');
        if (amount <= 0 || amount > 100) return await interaction.reply({ content: 'يرجى إدخال عدد بين 1 و 100.', ephemeral: true });
        await interaction.deferReply({ ephemeral: true });
        await interaction.channel.bulkDelete(amount, true).catch(() => null);
        return await interaction.editReply(`تم مسح ${amount} رسالة بنجاح! 🧹`);
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    const msg = message.content.trim().toLowerCase();

    // فحص الشتايم
    const hasBadWord = badWords.some(word => msg.includes(word));
    if (hasBadWord) {
        try {
            await message.delete();
            const warning = await message.channel.send(`⚠️ عيب يا ${message.author}، ممنوع الغلط في السيرفر!`);
            setTimeout(() => warning.delete().catch(() => null), 4000);
        } catch (err) {}
        return;
    }

    // الردود والخط بالشات العادي
    if (msg === 'خط') return message.reply('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬');
    if (msg === 'اسعار الاعلانات') {
        return message.reply(`📊 **قائمة أسعار الإعلانات في السيرفر:**\n\n📢 **ارسال للكل برود:** 20 ｍ\n🟢 **ارسال برود الاونلاين فقط:** 10 ｍ\n🔔 **اعلان ب منشن هير:** 1 ｍ`);
    }
    if (msg.includes('السلام عليكم') || msg === 'للسلام' || msg === 'للسلام 2') {
        return message.reply('وعليكم السلام ورحمة الله وبركاته، منور السيرفر! ❤️');
    }
    if (autoResponses[msg]) return message.reply(autoResponses[msg]);
});

client.login(process.env.DISCORD_TOKEN);

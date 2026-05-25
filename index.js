const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('البوت شغال بأعلى كفاءة وبدون تهنيج!'));
app.listen(3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers // مهم جداً عشان البرودكاست يقرأ الأعضاء
    ]
});

// 1. تعريف أوامر السلاش (/) الجديدة والقديمة
const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('فحص سرعة اتصال البوت'),
    new SlashCommandBuilder().setName('line').setDescription('خط فاصل جميل للشات'),
    new SlashCommandBuilder().setName('prices').setDescription('عرض أسعار الإعلانات بالتفصيل'),
    new SlashCommandBuilder().setName('server').setDescription('عرض معلومات السيرفر بالكامل'),
    new SlashCommandBuilder().setName('bc').setDescription('إرسال رسالة برودكاست لجميع أعضاء السيرفر في الخاص')
        .addStringOption(option => option.setName('الرسالة').setDescription('اكتب نص الرسالة هنا').setRequired(true)),
    new SlashCommandBuilder().setName('clear').setDescription('مسح عدد معين من الرسائل')
        .addIntegerOption(option => option.setName('عدد').setDescription('عدد الرسائل المراد مسحها').setRequired(true))
].map(command => command.toJSON());

// لستة الشتايم كاملة
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

// 2. التحكم في أوامر السلاش (/) مع الحماية من التهنيج
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    try {
        if (commandName === 'ping') return await interaction.reply('بونج! 🏓');
        if (commandName === 'line') return await interaction.reply('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬');
        
        if (commandName === 'prices') {
            return await interaction.reply(`📊 **قائمة أسعار الإعلانات في السيرفر:**\n\n📢 **ارسال للكل برود:** 20 ｍ\n🟢 **ارسال برود الاونلاين فقط:** 10 ｍ\n🔔 **اعلان ب منشن هير:** 1 ｍ`);
        }

        // [أمر معلومات السيرفر]
        if (commandName === 'server') {
            const guild = interaction.guild;
            if (!guild) return await interaction.reply({ content: 'هذا الأمر يعمل داخل السيرفرات فقط!', ephemeral: true });

            const serverEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle(`ℹ️ معلومات سيرفر: ${guild.name}`)
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .addFields(
                    { name: '🆔 آيدي السيرفر:', value: `${guild.id}`, inline: true },
                    { name: '👑 صاحب السيرفر:', value: `<@${guild.ownerId}>`, inline: true },
                    { name: '👥 عدد الأعضاء:', value: `${guild.memberCount}`, inline: true },
                    { name: '📅 تاريخ الإنشاء:', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                    { name: '✨ عدد البوستات:', value: `${guild.premiumSubscriptionCount || 0}`, inline: true }
                )
                .setFooter({ text: `طلب بواسطة: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            return await interaction.reply({ embeds: [serverEmbed] });
        }

        // [أمر البرودكاست للكل في الخاص]
        if (commandName === 'bc') {
            if (!interaction.member.permissions.has('Administrator')) {
                return await interaction.reply({ content: '❌ هذا الأمر خاص بالإدارة فقط (Administrator)!', ephemeral: true });
            }

            const broadcastMessage = interaction.options.getString('الرسالة');
            await interaction.deferReply({ ephemeral: true });

            // جلب الأعضاء
            const members = await interaction.guild.members.fetch().catch(() => null);
            if (!members) return await interaction.editReply('❌ فشل في جلب أعضاء السيرفر.');

            let successCount = 0;
            let failCount = 0;

            await interaction.editReply('⏳ جاري إرسال البرودكاست للأعضاء في الخاص...');

            for (const [id, member] of members) {
                if (member.user.bot) continue; // تخطي البوتات
                try {
                    await member.send(`📢 **برودكاست من سيرفر ${interaction.guild.name}:**\n\n${broadcastMessage}`);
                    successCount++;
                } catch (err) {
                    failCount++; // الحسابات المقفلة خاصيتها أو الصداقة
                }
            }

            return await interaction.editReply(`✅ تم الانتهاء من البرودكاست!\n📥 تم الإرسال بنجاح إلى: ${successCount}\n❌ فشل الإرسال إلى: ${failCount} (حسابات مغلقة الخاصية)`);
        }

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

    } catch (error) {
        console.error('حدث خطأ أثناء تنفيذ الأمر ولكن البوت مستمر:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '⚠️ حدث خطأ داخلي أثناء تنفيذ الأمر.', ephemeral: true }).catch(() => null);
        }
    }
});

// 3. نظام الردود العادية + منع الشتايم في الشات العادي
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const msg = message.content.trim().toLowerCase();

    const hasBadWord = badWords.some(word => msg.includes(word));
    if (hasBadWord) {
        try {
            await message.delete();
            const warning = await message.channel.send(`⚠️ عيب يا ${message.author}، ممنوع الغلط في السيرفر!`);
            setTimeout(() => warning.delete().catch(() => null), 4000);
        } catch (err) {}
        return;
    }

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
                                      

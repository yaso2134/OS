const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('البوت الشامل جاهز ومحدث بأعلى كفاءة!'));
app.listen(3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences // مهم عشان الجيف اواي يقرأ المتفاعلين
    ]
});

// 1. تعريف جميع أوامر السلاش (/) الجديدة والقديمة
const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('فحص سرعة اتصال البوت'),
    new SlashCommandBuilder().setName('line').setDescription('خط فاصل جميل للشات'),
    new SlashCommandBuilder().setName('prices').setDescription('عرض أسعار الإعلانات بالتفصيل'),
    new SlashCommandBuilder().setName('server').setDescription('عرض معلومات السيرفر بالكامل'),
    
    new SlashCommandBuilder().setName('avatar').setDescription('عرض صورتك الشخصية أو صورة شخص آخر')
        .addUserOption(option => option.setName('عضو').setDescription('اختر العضو (اتركه لرؤية صورتك)').setRequired(false)),
    
    new SlashCommandBuilder().setName('lock').setDescription('قفل الروم الحالية ومنع الأعضاء من الكتابة')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    
    new SlashCommandBuilder().setName('unlock').setDescription('فتح الروم الحالية والسماح للأعضاء بالكتابة')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    
    new SlashCommandBuilder().setName('kick').setDescription('طرد عضو من السيرفر')
        .addUserOption(option => option.setName('عضو').setDescription('اختر الشخص المراد طرده').setRequired(true))
        .addStringOption(option => option.setName('السبب').setDescription('سبب الطرد').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    
    new SlashCommandBuilder().setName('ban').setDescription('تبنيد عضو من السيرفر')
        .addUserOption(option => option.setName('عضو').setDescription('اختر الشخص المراد تبنيده').setRequired(true))
        .addStringOption(option => option.setName('السبب').setDescription('سبب الباند').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
        
    new SlashCommandBuilder().setName('come').setDescription('استدعاء شخص إلى الروم الحالية')
        .addUserOption(option => option.setName('عضو').setDescription('الشخص المراد استدعاؤه').setRequired(true)),
        
    new SlashCommandBuilder().setName('giveaway').setDescription('عمل جيف اواي واختيار فائز عشوائي من السيرفر')
        .addStringOption(option => option.setName('الجائزة').setDescription('اكتب اسم الجائزة هنا').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    new SlashCommandBuilder().setName('bc').setDescription('إرسال رسالة برودكاست لجميع أعضاء السيرفر في الخاص')
        .addStringOption(option => option.setName('الرسالة').setDescription('اكتب نص الرسالة هنا').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    new SlashCommandBuilder().setName('clear').setDescription('مسح عدد معين من الرسائل')
        .addIntegerOption(option => option.setName('عدد').setDescription('عدد الرسائل المراد مسحها').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
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
        console.log('تم تسجيل جميع أوامر السلاش بنجاح!');
    } catch (error) {
        console.error(error);
    }
});

// 2. تشغيل الأوامر والتفاعل معها
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    try {
        if (commandName === 'ping') return await interaction.reply('بونج! 🏓');
        if (commandName === 'line') return await interaction.reply('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬');
        
        if (commandName === 'prices') {
            return await interaction.reply(`📊 **قائمة أسعار الإعلانات في السيرفر:**\n\n📢 **ارسال للكل برود:** 20 ｍ\n🟢 **ارسال برود الاونلاين فقط:** 10 ｍ\n🔔 **اعلان ب منشن هير:** 1 ｍ`);
        }

        // [أمر الآفاتار]
        if (commandName === 'avatar') {
            const user = interaction.options.getUser('عضو') || interaction.user;
            const avatarEmbed = new EmbedBuilder()
                .setColor('#00ffcc')
                .setTitle(`👤 آفاتار: ${user.tag}`)
                .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
                .setFooter({ text: `طلب بواسطة: ${interaction.user.tag}` });
            return await interaction.reply({ embeds: [avatarEmbed] });
        }

        // [أمر قفل الروم]
        if (commandName === 'lock') {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
            return await interaction.reply('🔒 **تم قفل الروم بنجاح، يمنع الحديث هنا!**');
        }

        // [أمر فتح الروم]
        if (commandName === 'unlock') {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true });
            return await interaction.reply('🔓 **تم فتح الروم بنجاح، يمكن للجميع الحديث الآن!**');
        }

        // [أمر الكيك / الطرد]
        if (commandName === 'kick') {
            const member = interaction.options.getMember('عضو');
            const reason = interaction.options.getString('السبب') || 'بدون سبب محدد';
            if (!member) return await interaction.reply({ content: '❌ لم يتم العثور على هذا العضو.', ephemeral: true });
            if (!member.kickable) return await interaction.reply({ content: '❌ لا يمكنني طرد هذا الشخص (رتبته أعلى مني أو لا أملك صلاحيات).', ephemeral: true });
            
            await member.kick(reason);
            return await interaction.reply(`👢 **تم طرد العضو <@${member.id}> بنجاح من السيرفر.**\n📝 السبب: ${reason}`);
        }

        // [أمر الباند]
        if (commandName === 'ban') {
            const member = interaction.options.getMember('عضو');
            const reason = interaction.options.getString('السبب') || 'بدون سبب محدد';
            if (!member) return await interaction.reply({ content: '❌ لم يتم العثور على هذا العضو.', ephemeral: true });
            if (!member.bannable) return await interaction.reply({ content: '❌ لا يمكنني تبنيد هذا الشخص (رتبته أعلى مني أو لا أملك صلاحيات).', ephemeral: true });
            
            await member.ban({ reason });
            return await interaction.reply(`🔨 **تم حظر (باند) العضو <@${member.id}> بنجاح من السيرفر.**\n📝 السبب: ${reason}`);
        }

        // [أمر الاستدعاء come]
        if (commandName === 'come') {
            const user = interaction.options.getUser('عضو');
            try {
                await user.send(`📥 **يا غالي، تم استدعاؤك في سيرفر ${interaction.guild.name}!**\n📍 الروم: <#${interaction.channel.id}>\n👤 بواسطة: ${interaction.user}`);
                return await interaction.reply(`✅ تم إرسال نداء إلى ${user} في الخاص بنجاح.`);
            } catch (err) {
                return await interaction.reply(`❌ لا يمكن إرسال نداء لـ ${user} لأن حسابه مغلق الخاصية.`);
            }
        }

        // [أمر الجيف اواي giveaway]
        if (commandName === 'giveaway') {
            const prize = interaction.options.getString('الجائزة');
            await interaction.reply('🎉 **جاري اختيار فائز عشوائي للجيف اواي...**');
            
            const fetchedMembers = await interaction.guild.members.fetch();
            const realMembers = fetchedMembers.filter(m => !m.user.bot); // استبعاد البوتات
            
            if (realMembers.size === 0) return await interaction.followUp('❌ لا يوجد أعضاء كافيين في السيرفر لعمل القرعة.');
            
            const randomWinner = realMembers.random();
            const giveawayEmbed = new EmbedBuilder()
                .setColor('#ffcc00')
                .setTitle('🎉 انتهاء الجيف اواي العشوائي! 🎉')
                .setDescription(`🎁 **الجائزة:** ${prize}\n\n👑 **الفائز المحظوظ هو:** <@${randomWinner.id}>`)
                .setFooter({ text: `أنشئ بواسطة: ${interaction.user.tag}` })
                .setTimestamp();
                
            return await interaction.channel.send({ content: `مبرووك الفوز! 🎉 <@${randomWinner.id}>`, embeds: [giveawayEmbed] });
        }

        // [أمر معلومات السيرفر]
        if (commandName === 'server') {
            const guild = interaction.guild;
            const serverEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle(`ℹ️ معلومات سيرفر: ${guild.name}`)
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .addFields(
                    { name: '🆔 آيدي السيرفر:', value: `${guild.id}`, inline: true },
                    { name: '👑 صاحب السيرفر:', value: `<@${guild.ownerId}>`, inline: true },
                    { name: '👥 عدد الأعضاء:', value: `${guild.memberCount}`, inline: true },
                    { name: '📅 تاريخ الإنشاء:', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true }
                );
            return await interaction.reply({ embeds: [serverEmbed] });
        }

        // [أمر البرودكاست للكل]
        if (commandName === 'bc') {
            const broadcastMessage = interaction.options.getString('الرسالة');
            await interaction.deferReply({ ephemeral: true });
            const members = await interaction.guild.members.fetch().catch(() => null);
            if (!members) return await interaction.editReply('❌ فشل في جلب أعضاء السيرفر.');

            let successCount = 0;
            await interaction.editReply('⏳ جاري إرسال البرودكاست...');
            for (const [id, member] of members) {
                if (member.user.bot) continue;
                try {
                    await member.send(`📢 **برودكاست من سيرفر ${interaction.guild.name}:**\n\n${broadcastMessage}`);
                    successCount++;
                } catch (err) {}
            }
            return await interaction.editReply(`✅ تم الانتهاء! تم الإرسال إلى ${successCount} عضو.`);
        }

        // [أمر مسح الرسائل]
        if (commandName === 'clear') {
            const amount = interaction.options.getInteger('عدد');
            if (amount <= 0 || amount > 100) return await interaction.reply({ content: 'يرجى إدخال عدد بين 1 و 100.', ephemeral: true });
            await interaction.deferReply({ ephemeral: true });
            await interaction.channel.bulkDelete(amount, true).catch(() => null);
            return await interaction.editReply(`تم مسح ${amount} رسالة بنجاح! 🧹`);
        }

    } catch (error) {
        console.error('حدث خطأ:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '⚠️ حدث خطأ أثناء تنفيذ هذا الأمر، تأكد من صلاحيات البوت.', ephemeral: true }).catch(() => null);
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
        

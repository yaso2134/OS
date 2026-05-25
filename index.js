const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('البوت الأساسي شغال 100% وتم ضبط إرسال الخط كملف نظيف!'));
app.listen(3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// رابط الصورة الخاص بك
const lineImageURL = 'https://cdn.discordapp.com/attachments/1507997898783068210/1508458186619752589/5MQGz1n7.webp?ex=6a159ca9&is=6a144b29&hm=e2289d5dfc472df69654ab380738b814450de34a56760a67d77159ffbc8e641f&';

const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('فحص speed اتصال البوت'),
    new SlashCommandBuilder().setName('line').setDescription('إرسال خط السيرفر الفخم (صورة)'),
    new SlashCommandBuilder().setName('prices').setDescription('عرض أسعار الإعلانات بالتفصيل'),
    new SlashCommandBuilder().setName('server').setDescription('عرض معلومات السيرفر بالكامل'),
    new SlashCommandBuilder().setName('avatar').setDescription('عرض صورتك الشخصية أو صورة شخص آخر')
        .addUserOption(option => option.setName('عضو').setDescription('اختر العضو').setRequired(false)),
    new SlashCommandBuilder().setName('lock').setDescription('قفل الروم الحالية').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    new SlashCommandBuilder().setName('unlock').setDescription('فتح الروم الحالية').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    new SlashCommandBuilder().setName('kick').setDescription('طرد عضو من السيرفر')
        .addUserOption(option => option.setName('عضو').setDescription('الشخص المراد طرده').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    new SlashCommandBuilder().setName('ban').setDescription('تبنيد عضو من السيرفر')
        .addUserOption(option => option.setName('عضو').setDescription('الشخص المراد تبنيده').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    new SlashCommandBuilder().setName('come').setDescription('استدعاء شخص إلى الروم الحالية')
        .addUserOption(option => option.setName('عضو').setDescription('الشخص المراد استدعاؤه').setRequired(true)),
    new SlashCommandBuilder().setName('giveaway').setDescription('عمل جيف اواي واختيار فائز عشوائي')
        .addStringOption(option => option.setName('الجائزة').setDescription('اسم الجائزة').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    new SlashCommandBuilder().setName('bc').setDescription('إرسال رسالة برودكاست آمنة للأعضاء')
        .addStringOption(option => option.setName('الرسالة').setDescription('نص الرسالة').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('clear').setDescription('مسح عدد معين من الرسائل')
        .addIntegerOption(option => option.setName('عدد').setDescription('عدد الرسائل').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
].map(command => command.toJSON());

const badWords = ['كسمك', 'شرموط', 'كسختك', 'عرص', 'معرص', 'متناك', 'يلعن ميتين امك', 'كلزق', 'تفو', 'امك', 'ابوك', 'خنيث', 'قحبة', 'منيوك'];

const autoResponses = {
    'هلا': 'هلا بك يا غالي منور السيرفر! ✨',
    'h': 'Hello! 🤍',
    '.': 'منور بنقطتك الجميلة. 👑',
    'برا': 'اطردوه برة السيرفر بسرعة! 🚪🏃‍♂️',
    'بوت': 'لبيه! أنا في الخدمة، اؤمرني؟ 🤖'
};

client.on('ready', async () => {
    console.log(`تم تشغيل البوت بنجاح باسم: ${client.user.tag}`);
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    } catch (error) { console.error(error); }
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    try {
        if (commandName === 'ping') return await interaction.reply('بونج! 🏓');
        
        // إرسال الخط عبر السلاش بشكل نظيف
        if (commandName === 'line') {
            const file = new AttachmentBuilder(lineImageURL, { name: 'line.webp' });
            return await interaction.reply({ files: [file] });
        }
        
        if (commandName === 'prices') return await interaction.reply(`📊 **قائمة أسعار الإعلانات في السيرفر:**\n\n📢 **ارسال للكل برود:** 20 ｍ\n🟢 **ارسال برود الاونلاين فقط:** 10 ｍ\n🔔 **اعلان ب منشن هير:** 1 ｍ`);
        
        if (commandName === 'clear') {
            const amount = interaction.options.getInteger('عدد');
            if (amount <= 0 || amount > 100) return await interaction.reply({ content: 'اكتب رقم بين 1 و 100.', ephemeral: true });
            
            await interaction.reply({ content: '⏳ جاري مسح الرسائل...', ephemeral: true });
            await interaction.channel.bulkDelete(amount, true).catch(() => null);
            return await interaction.editReply(`✅ تم مسح ${amount} رسالة بنجاح! 🧹`);
        }

        if (commandName === 'avatar') {
            const user = interaction.options.getUser('عضو') || interaction.user;
            const avatarEmbed = new EmbedBuilder().setColor('#00ffcc').setTitle(`👤 آفاتار: ${user.tag}`).setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }));
            return await interaction.reply({ embeds: [avatarEmbed] });
        }

        if (commandName === 'lock') {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
            return await interaction.reply('🔒 **تم قفل الروم بنجاح!**');
        }

        if (commandName === 'unlock') {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true });
            return await interaction.reply('🔓 **تم فتح الروم بنجاح!**');
        }

        if (commandName === 'kick') {
            const member = interaction.options.getMember('عضو');
            if (!member || !member.kickable) return await interaction.reply({ content: '❌ لا يمكن طرد هذا العضو.', ephemeral: true });
            await member.kick();
            return await interaction.reply(`👢 **تم طرد <@${member.id}> بنجاح.**`);
        }

        if (commandName === 'ban') {
            const member = interaction.options.getMember('عضو');
            if (!member || !member.bannable) return await interaction.reply({ content: '❌ لا يمكن تبنيد هذا العضو.', ephemeral: true });
            await member.ban();
            return await interaction.reply(`🔨 **تم تبنيد <@${member.id}> بنجاح.**`);
        }

        if (commandName === 'come') {
            const user = interaction.options.getUser('عضو');
            try {
                await user.send(`📥 **يا غالي، تم استدعاؤك في سيرفر ${interaction.guild.name}!**\n📍 الروم: <#${interaction.channel.id}>\n👤 بواسطة: ${interaction.user}`);
                return await interaction.reply(`✅ تم إرسال نداء إلى ${user} في الخاص.`);
            } catch (err) { return await interaction.reply(`❌ الخاص عند الشخص مغلق.`); }
        }

        if (commandName === 'giveaway') {
            const prize = interaction.options.getString('الجائزة');
            await interaction.reply('🎉 **جاري سحب فائز عشوائي...**');
            const fetchedMembers = await interaction.guild.members.fetch();
            const realMembers = fetchedMembers.filter(m => !m.user.bot);
            if (realMembers.size === 0) return await interaction.followUp('❌ لا يوجد أعضاء.');
            const randomWinner = realMembers.random();
            const giveawayEmbed = new EmbedBuilder().setColor('#ffcc00').setTitle('🎉 انتهاء الجيف اواي العشوائي! 🎉').setDescription(`🎁 **الجائزة:** ${prize}\n\n👑 **الفائز هو:** <@${randomWinner.id}>`);
            return await interaction.channel.send({ content: `مبرووك! 🎉 <@${randomWinner.id}>`, embeds: [giveawayEmbed] });
        }

        if (commandName === 'server') {
            const guild = interaction.guild;
            const serverEmbed = new EmbedBuilder().setColor('#ff0000').setTitle(`ℹ️ معلومات سيرفر: ${guild.name}`).addFields({ name: '🆔 آيدي السيرفر:', value: `${guild.id}`, inline: true }, { name: '👑 صاحب السيرفر:', value: `<@${guild.ownerId}>`, inline: true }, { name: '👥 عدد الأعضاء:', value: `${guild.memberCount}`, inline: true });
            return await interaction.reply({ embeds: [serverEmbed] });
        }

        if (commandName === 'bc') {
            const broadcastMessage = interaction.options.getString('الرسالة');
            await interaction.reply({ content: '⏳ جاري إرسال البرودكاست بوضع الأمان...', ephemeral: true });
            const members = await interaction.guild.members.fetch().catch(() => null);
            if (!members) return await interaction.editReply('❌ فشل جلب الأعضاء.');
            let successCount = 0;
            for (const [id, member] of members) {
                if (member.user.bot) continue;
                try {
                    await member.send(`📢 **برودكاست من سيرفر ${interaction.guild.name}:**\n\n${broadcastMessage}`);
                    successCount++;
                    await sleep(300);
                } catch (err) {}
            }
            return await interaction.editReply(`✅ تم الانتهاء! تم الإرسال إلى ${successCount} عضو.`);
        }
    } catch (error) { console.error(error); }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    const msg = message.content.trim().toLowerCase();
    
    const hasBadWord = badWords.some(word => msg.includes(word));
    if (hasBadWord) {
        try {
            await message.delete();
            const warning = await message.channel.send(`⚠️ عيب يا ${message.author}، ممنوع الغلط!`);
            setTimeout(() => warning.delete().catch(() => null), 4000);
        } catch (err) {}
        return;
    }
    
    // إرسال الخط عند كتابة كلمة "خط" العادية كملف مرفق نظيف لمرة واحدة فقط
    if (msg === 'خط') {
        const file = new AttachmentBuilder(lineImageURL, { name: 'line.webp' });
        return message.channel.send({ files: [file] });
    }
    
    if (msg === 'اسعار الاعلانات') return message.reply(`📊 **قائمة أسعار الإعلانات في السيرفر:**\n\n📢 **ارسال للكل برود:** 20 ｍ\n🟢 **ارسال برود الاونلاين فقط:** 10 ｍ\n🔔 **اعلان ب منشن هير:** 1 ｍ`);
    if (msg.includes('السلام عليكم') || msg === 'للسلام') return message.reply('وعليكم السلام ورحمة الله وبركاته، منور! ❤️');
    if (autoResponses[msg]) return message.reply(autoResponses[msg]);
});

client.login(process.env.DISCORD_TOKEN);
                

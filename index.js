const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('البوت شغال!'));
app.listen(3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => {
    console.log(`تم تشغيل ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
    if (message.content === 'بنج') {
        message.reply('بونج! 🏓');
    }
});

client.login(process.env.DISCORD_TOKEN);

require('dotenv').config();
const { Client, Intents } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Stat = require('./models/stat');

// Discord botunu başlatma
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });

// MongoDB bağlantısı
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.log('MongoDB bağlantı hatası:', err));

// Komutları yükleme
client.commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// Bot hazır olduğunda çalışacak fonksiyon
client.once('ready', () => {
  console.log(`${client.user.tag} olarak giriş yapıldı!`);
});

// Mesaj oluşturulduğunda çalışacak fonksiyon
client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Bot mesajlarını sayma

  // Komut kontrolü: Nokta ile başlayan komutları alıyoruz
  if (message.content.startsWith('.')) {
    const args = message.content.slice(1).split(/ +/); // İlk karakteri (.) çıkarıyoruz
    const commandName = args.shift().toLowerCase();

    if (client.commands.has(commandName)) {
      try {
        await client.commands.get(commandName).execute(message, args);
      } catch (error) {
        console.error(error);
        message.reply('Komut çalıştırılırken bir hata oluştu!');
      }
    }
  } else {
    // Mesaj sayısını artırma işlemi
    const userId = message.author.id;
    let stat = await Stat.findOne({ userId });
    if (!stat) {
      stat = new Stat({ userId });
    }
    stat.messages += 1;
    await stat.save();
  }
});

// Ses kanalındaki kullanıcıların durumlarını takip etme
client.on('voiceStateUpdate', async (oldState, newState) => {
  // Eğer kullanıcı ses kanalına girdiyse
  if (!oldState.channelId && newState.channelId) {
    const userId = newState.id;
    let stat = await Stat.findOne({ userId });
    if (!stat) {
      stat = new Stat({ userId });
    }
    stat.lastVoiceEnterTime = new Date();
    await stat.save();
  }

  // Eğer kullanıcı ses kanalından çıktıysa
  if (oldState.channelId && !newState.channelId) {
    const userId = oldState.id;
    let stat = await Stat.findOne({ userId });
    if (stat && stat.lastVoiceEnterTime) {
      const timeSpentInVoice = Math.floor((new Date() - stat.lastVoiceEnterTime) / 1000); // saniye cinsinden
      stat.voiceTime += timeSpentInVoice;
      stat.lastVoiceEnterTime = null; // Ses kanalına giriş zamanı sıfırlanır
      await stat.save();
    }
  }
});

// Botu çalıştırma
client.login(process.env.DISCORD_TOKEN);

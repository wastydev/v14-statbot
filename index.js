require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const Stat = require('./models/stat'); // Stat modelini ekledik

// Bot istemcisi
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates, // Ses aktivitesi izleme
  ],
});

// Prefix ayarı
const prefix = '.';

// MongoDB bağlantısı
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch((err) => {
    console.error('MongoDB bağlantı hatası:', err.message);
    process.exit(1); // Bağlantı hatası durumunda uygulamayı kapat
  });

// Komutları yükleme
client.commands = new Collection();
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (!command.name) {
    console.error(`Komut dosyasında 'name' eksik: ${file}`);
    continue;
  }
  client.commands.set(command.name, command);
}

// Bot hazır olduğunda
client.once('ready', () => {
  console.log(`${client.user.tag} olarak giriş yapıldı!`);
});

// Mesaj dinleyici
client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Bot mesajlarını yok say

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Eğer bir komut çalıştırılıyorsa mesaj statlarını artırma
  if (message.content.startsWith(prefix)) {
    if (client.commands.has(commandName)) {
      try {
        await client.commands.get(commandName).execute(message, args);
      } catch (error) {
        console.error(`Komut çalıştırılırken bir hata oluştu: ${error.message}`);
        message.reply('Komut çalıştırılırken bir hata oluştu!');
      }
    }
    return; // Komut çalıştırıldığında mesaj istatistikleri artmaz
  }

  // Normal mesajlar için istatistik güncelleme
  try {
    let stat = await Stat.findOne({ userId: message.author.id });
    if (!stat) {
      stat = new Stat({ userId: message.author.id });
    }
    stat.messages += 1; // Mesaj sayısını artır
    await stat.save();
  } catch (error) {
    console.error(`Mesaj istatistiklerini güncellerken hata: ${error.message}`);
  }
});

// Ses aktivitesi dinleyici
client.on('voiceStateUpdate', async (oldState, newState) => {
  try {
    const userId = oldState.id || newState.id;

    // Mikrofonun açılıp kapanmasını da takip edin
    if (oldState.selfMute !== newState.selfMute || oldState.selfDeaf !== newState.selfDeaf) {
      let stat = await Stat.findOne({ userId });
      if (stat && stat.lastVoiceEnterTime) {
        const timeSpentInVoice = Math.floor((new Date() - stat.lastVoiceEnterTime) / 1000);
        stat.voiceTime += timeSpentInVoice; // Ses süresine ekle
        stat.lastVoiceEnterTime = new Date(); // Yeni referans zamanı ayarla
        await stat.save();
      }
    }

    // Ses kanalına giriş
    if (!oldState.channelId && newState.channelId) {
      let stat = await Stat.findOne({ userId });
      if (!stat) {
        stat = new Stat({ userId });
      }
      stat.lastVoiceEnterTime = new Date(); // Giriş zamanı
      await stat.save();
    }

    // Ses kanalından çıkış
    if (oldState.channelId && !newState.channelId) {
      let stat = await Stat.findOne({ userId });
      if (stat && stat.lastVoiceEnterTime) {
        const timeSpentInVoice = Math.floor((new Date() - stat.lastVoiceEnterTime) / 1000);
        stat.voiceTime += timeSpentInVoice; // Toplam ses süresine ekle
        stat.lastVoiceEnterTime = null; // Giriş zamanı sıfırla
        await stat.save();
      }
    }

    // Ses kanalını değiştirme
    if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
      let stat = await Stat.findOne({ userId });
      if (stat && stat.lastVoiceEnterTime) {
        const timeSpentInVoice = Math.floor((new Date() - stat.lastVoiceEnterTime) / 1000);
        stat.voiceTime += timeSpentInVoice;
        stat.lastVoiceEnterTime = new Date(); // Yeni giriş zamanı
        await stat.save();
      }
    }
  } catch (error) {
    console.error(`Ses aktivitesi işlenirken hata: ${error.message}`);
  }
});

// Botu başlat
client.login(process.env.DISCORD_TOKEN);

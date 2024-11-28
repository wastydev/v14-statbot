const Stat = require('../models/stat');

module.exports = {
  name: 'rank',
  description: 'Kullanıcının sıralamalardaki konumunu gösterir.',
  async execute(message, args) {
    const userId = message.author.id;

    // Kullanıcının istatistiklerini bulma
    const stat = await Stat.findOne({ userId });
    if (!stat) {
      return message.reply('İstatistikleriniz bulunamadı.');
    }

    // Top 5 chat sıralaması (mesaj sayısına göre)
    const chatTop = await Stat.find().sort({ messages: -1 });

    // Kullanıcının chat sıralamasındaki pozisyonunu bulma
    const chatRank = chatTop.findIndex(stat => stat.userId === userId) + 1; // +1 çünkü sıralama 1'den başlar

    // Top 5 ses sıralaması (ses süresine göre)
    const voiceTop = await Stat.find().sort({ voiceTime: -1 });

    // Kullanıcının ses sıralamasındaki pozisyonunu bulma
    const voiceRank = voiceTop.findIndex(stat => stat.userId === userId) + 1; // +1 çünkü sıralama 1'den başlar

    // Sonuçları gösterme
    const messageStat = stat.messages;
    const voiceStat = stat.voiceTime;
    const hours = Math.floor(voiceStat / 3600);
    const minutes = Math.floor((voiceStat % 3600) / 60);
    const seconds = voiceStat % 60;

    message.reply(`${message.author.tag} - Toplam Mesaj: ${messageStat} | Ses Süresi: ${hours} saat ${minutes} dakika ${seconds} saniye\n\n` +
      `Mesaj Sıralamanız: #${chatRank}\n` +
      `Ses Sıralamanız: #${voiceRank}`);
  }
};

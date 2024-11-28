const Stat = require('../models/stat');

module.exports = {
  name: 'top',
  description: 'Mesaj ve ses sıralamalarını gösterir.',
  async execute(message, args) {
    if (args[0] === 'chat') {
      // Top 10 chat sıralaması (mesaj sayısına göre)
      const chatTop = await Stat.find().sort({ messages: -1 }).limit(10); // Mesaj sayısına göre azalan sıralama

      let chatRanking = 'Top 10 Chat (Mesaj Sayısı):\n';
      chatTop.forEach((stat, index) => {
        const user = message.guild.members.cache.get(stat.userId) || { user: { tag: 'Bilinmiyor' } };
        chatRanking += `${index + 1}. ${user.user.tag} - ${stat.messages} mesaj\n`;
      });

      message.reply(chatRanking);
    } else if (args[0] === 'voice') {
      // Top 10 voice sıralaması (ses süresine göre)
      const voiceTop = await Stat.find().sort({ voiceTime: -1 }).limit(10); // Ses süresine göre azalan sıralama

      let voiceRanking = 'Top 10 Ses (Ses Süresi):\n';
      voiceTop.forEach((stat, index) => {
        const user = message.guild.members.cache.get(stat.userId) || { user: { tag: 'Bilinmiyor' } };
        const hours = Math.floor(stat.voiceTime / 3600);
        const minutes = Math.floor((stat.voiceTime % 3600) / 60);
        const seconds = stat.voiceTime % 60;
        voiceRanking += `${index + 1}. ${user.user.tag} - ${hours} saat ${minutes} dakika ${seconds} saniye\n`;
      });

      message.reply(voiceRanking);
    } else {
      // Default: Top 5 chat ve top 5 voice sıralaması
      // Top 5 chat sıralaması (mesaj sayısına göre)
      const chatTop = await Stat.find().sort({ messages: -1 }).limit(5); // Mesaj sayısına göre azalan sıralama
      let chatRanking = 'Top 5 Chat (Mesaj Sayısı):\n';
      chatTop.forEach((stat, index) => {
        const user = message.guild.members.cache.get(stat.userId) || { user: { tag: 'Bilinmiyor' } };
        chatRanking += `${index + 1}. ${user.user.tag} - ${stat.messages} mesaj\n`;
      });

      // Top 5 voice sıralaması (ses süresine göre)
      const voiceTop = await Stat.find().sort({ voiceTime: -1 }).limit(5); // Ses süresine göre azalan sıralama
      let voiceRanking = 'Top 5 Ses (Ses Süresi):\n';
      voiceTop.forEach((stat, index) => {
        const user = message.guild.members.cache.get(stat.userId) || { user: { tag: 'Bilinmiyor' } };
        const hours = Math.floor(stat.voiceTime / 3600);
        const minutes = Math.floor((stat.voiceTime % 3600) / 60);
        const seconds = stat.voiceTime % 60;
        voiceRanking += `${index + 1}. ${user.user.tag} - ${hours} saat ${minutes} dakika ${seconds} saniye\n`;
      });

      message.reply(`${chatRanking}\n\n${voiceRanking}`);
    }
  }
};

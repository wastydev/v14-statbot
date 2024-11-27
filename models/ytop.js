const Stat = require('../models/stat');

// Burada sadece belirli rollere sahip kullanıcıların statları alınacak
const allowedRoles = [
  'admin', // "admin" rolü
  'moderator', // "moderator" rolü
  // Buraya eklemek istediğiniz diğer rollerin adlarını ekleyin
];

module.exports = {
  name: 'ytop',
  description: 'Belirli yetkileri olan kullanıcıların chat ve ses sıralamalarını gösterir.',
  async execute(message, args) {
    // Kullanıcının bir yetkisi olup olmadığını kontrol etme
    if (!message.member.hasPermission('ADMINISTRATOR') && 
        !message.member.roles.cache.some(role => allowedRoles.includes(role.name))) {
      return message.reply('Bu komutu kullanma yetkiniz yok.');
    }

    // .ytop chat: Mesaj sayısına göre ilk 5 kullanıcıyı gösterme
    if (args[0] === 'chat') {
      const chatTop = await Stat.find()
                                .sort({ messages: -1 })
                                .limit(5); // Mesaj sayısına göre azalan sıralama

      let chatRanking = 'Top 5 Chat (Mesaj Sayısı):\n';
      chatTop.forEach((stat, index) => {
        const user = message.guild.members.cache.get(stat.userId) || { user: { tag: 'Bilinmiyor' } };
        chatRanking += `${index + 1}. ${user.user.tag} - ${stat.messages} mesaj\n`;
      });

      message.reply(chatRanking);
    }
    // .ytop voice: Ses süresine göre ilk 5 kullanıcıyı gösterme
    else if (args[0] === 'voice') {
      const voiceTop = await Stat.find()
                                 .sort({ voiceTime: -1 })
                                 .limit(5); // Ses süresine göre azalan sıralama

      let voiceRanking = 'Top 5 Ses (Ses Süresi):\n';
      voiceTop.forEach((stat, index) => {
        const user = message.guild.members.cache.get(stat.userId) || { user: { tag: 'Bilinmiyor' } };
        const hours = Math.floor(stat.voiceTime / 3600);
        const minutes = Math.floor((stat.voiceTime % 3600) / 60);
        const seconds = stat.voiceTime % 60;
        voiceRanking += `${index + 1}. ${user.user.tag} - ${hours} saat ${minutes} dakika ${seconds} saniye\n`;
      });

      message.reply(voiceRanking);
    }
    // Eğer başka bir argüman verilmişse
    else {
      message.reply('Geçerli bir seçenek belirtmediniz. `.ytop chat` veya `.ytop voice` komutlarını kullanabilirsiniz.');
    }
  }
};

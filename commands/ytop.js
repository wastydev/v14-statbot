
const { EmbedBuilder } = require('discord.js');
const Stat = require('../models/stat');

// Yalnızca belirli rol ID'sine sahip kullanıcıları filtrelemek için
const allowedRoleId = 'id'; // Buraya filtrelemek istediğiniz rolün ID'sini yazın.

module.exports = {
  name: 'ytop',
  description: 'Belirli bir role sahip kullanıcıların chat ve ses sıralamalarını gösterir.',
  async execute(message, args) {
    // Kullanıcının yetkisi olup olmadığını kontrol etme
    if (!message.member.permissions.has('Administrator') &&
        !message.member.roles.cache.has(allowedRoleId)) {
      return message.reply('Bu komutu kullanma yetkiniz yok.');
    }

    // .ytop chat: Mesaj sayısına göre ilk 5 kullanıcıyı gösterme
    if (args[0] === 'chat') {
      const chatTop = await Stat.find()
                                .sort({ messages: -1 })
                                .limit(10); // Mesaj sayısına göre azalan sıralama

      // Sadece belirtilen role sahip kullanıcıları filtrele
      const filteredChatTop = [];
      for (const stat of chatTop) {
        const user = await message.guild.members.fetch(stat.userId).catch(() => null);
        if (user && user.roles.cache.has(allowedRoleId)) {
          filteredChatTop.push({ tag: user.user.tag, messages: stat.messages });
        }
        if (filteredChatTop.length >= 5) break; // İlk 5 kullanıcıyı al
      }

      if (filteredChatTop.length === 0) {
        return message.reply('Belirtilen role sahip hiç kimse sıralamada yok.');
      }

      let chatRanking = 'Top 5 Chat (Mesaj Sayısı):\n';
      for (const [index, user] of filteredChatTop.entries()) {
        chatRanking += `${index + 1}. ${user.tag} - ${user.messages} mesaj\n`;
      }

      const embed = new EmbedBuilder()
        .setColor('#FF4500')
        .setTitle('Top 5 Chat Sıralaması')
        .setDescription(chatRanking)
        .setFooter({ text: 'Mesaj sayısına göre sıralandı.' });

      message.reply({ embeds: [embed] });
    }
    // .ytop voice: Ses süresine göre ilk 5 kullanıcıyı gösterme
    else if (args[0] === 'voice') {
      const voiceTop = await Stat.find()
                                 .sort({ voiceTime: -1 })
                                 .limit(10); // Ses süresine göre azalan sıralama

      // Sadece belirtilen role sahip kullanıcıları filtrele
      const filteredVoiceTop = [];
      for (const stat of voiceTop) {
        const user = await message.guild.members.fetch(stat.userId).catch(() => null);
        if (user && user.roles.cache.has(allowedRoleId)) {
          filteredVoiceTop.push({
            tag: user.user.tag,
            voiceTime: stat.voiceTime,
          });
        }
        if (filteredVoiceTop.length >= 5) break; // İlk 5 kullanıcıyı al
      }

      if (filteredVoiceTop.length === 0) {
        return message.reply('Belirtilen role sahip hiç kimse sıralamada yok.');
      }

      let voiceRanking = 'Top 5 Ses (Ses Süresi):\n';
      for (const [index, user] of filteredVoiceTop.entries()) {
        const hours = Math.floor(user.voiceTime / 3600);
        const minutes = Math.floor((user.voiceTime % 3600) / 60);
        const seconds = user.voiceTime % 60;
        voiceRanking += `${index + 1}. ${user.tag} - ${hours} saat ${minutes} dakika ${seconds} saniye\n`;
      }

      const embed = new EmbedBuilder()
        .setColor('#FF4500')
        .setTitle('Top 5 Ses Sıralaması')
        .setDescription(voiceRanking)
        .setFooter({ text: 'Ses süresine göre sıralandı.' });

      message.reply({ embeds: [embed] });
    }
    // Eğer başka bir argüman verilmişse
    else {
      message.reply('Geçerli bir seçenek belirtmediniz. `.ytop chat` veya `.ytop voice` komutlarını kullanabilirsiniz.');
    }
  }
};

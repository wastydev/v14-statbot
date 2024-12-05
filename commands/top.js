const { EmbedBuilder } = require('discord.js');
const Stat = require('../models/stat');

module.exports = {
  name: 'top',
  description: 'Top 5 chat ve ses sıralamalarını gösterir.',
  async execute(message, args) {
    let embed = new EmbedBuilder()
      .setColor('#FF4500')
      .setTitle('Top Kullanıcılar');

    // `.top` komutu (hem chat hem ses sıralaması, ilk 5)
    if (!args[0]) {
      const chatTop = await Stat.find().sort({ messages: -1 }).limit(5);
      let chatList = chatTop.map((stat, index) => `**${index + 1}.** <@${stat.userId}> - Mesaj Sayısı: ${stat.messages}`).join('\n');
      embed.addFields({ name: 'Top 5 Chat Sıralaması:', value: chatList });

      const voiceTop = await Stat.find().sort({ voiceTime: -1 }).limit(5);
      let voiceList = voiceTop.map((stat, index) => {
        const hours = Math.floor(stat.voiceTime / 3600);
        const minutes = Math.floor((stat.voiceTime % 3600) / 60);
        return `**${index + 1}.** <@${stat.userId}> - Ses Süresi: ${hours} saat ${minutes} dakika`;
      }).join('\n');
      embed.addFields({ name: 'Top 5 Ses Sıralaması:', value: voiceList });
    } 
    // `.top chat` komutu (ilk 10 chat sıralaması)
    else if (args[0] === 'chat') {
      const chatTop = await Stat.find().sort({ messages: -1 }).limit(10);
      let chatList = chatTop.map((stat, index) => `**${index + 1}.** <@${stat.userId}> - Mesaj Sayısı: ${stat.messages}`).join('\n');
      embed.addFields({ name: 'Top 10 Chat Sıralaması:', value: chatList });
    } 
    // `.top voice` komutu (ilk 10 ses sıralaması)
    else if (args[0] === 'voice') {
      const voiceTop = await Stat.find().sort({ voiceTime: -1 }).limit(10);
      let voiceList = voiceTop.map((stat, index) => {
        const hours = Math.floor(stat.voiceTime / 3600);
        const minutes = Math.floor((stat.voiceTime % 3600) / 60);
        return `**${index + 1}.** <@${stat.userId}> - Ses Süresi: ${hours} saat ${minutes} dakika`;
      }).join('\n');
      embed.addFields({ name: 'Top 10 Ses Sıralaması:', value: voiceList });
    } 
    // Hatalı komut
    else {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Hata!')
            .setDescription('Geçersiz komut! Lütfen **chat**, **voice** veya bir şey yazmazsanız **chat ve voice** sıralamasını görmek için boş bırakın.')
        ]
      });
    }

    message.reply({ embeds: [embed] });
  }
};

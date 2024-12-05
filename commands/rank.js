const Stat = require('../models/stat'); // Stat modelini doğru yoldan import ettiğinizden emin olun
const { EmbedBuilder } = require('discord.js'); // Discord.js v14 ve sonrası için EmbedBuilder

module.exports = {
  name: 'rank',
  description: 'Kullanıcının sıralamadaki konumunu gösterir.',
  async execute(message, args) {
    const userId = message.author.id;
    const stat = await Stat.findOne({ userId });

    if (!stat) {
      return message.reply(
        new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Hata!')
          .setDescription('İstatistikleriniz bulunamadı.')
          .setTimestamp() // Zaman damgası eklenebilir
          .setFooter({ text: 'Stat botu'}) // İstediğiniz bir ikon ekleyebilirsiniz
      );
    }

    const chatTop = await Stat.find().sort({ messages: -1 });
    const chatRank = chatTop.findIndex(stat => stat.userId === userId) + 1;

    const voiceTop = await Stat.find().sort({ voiceTime: -1 });
    const voiceRank = voiceTop.findIndex(stat => stat.userId === userId) + 1;

    const embed = new EmbedBuilder()
      .setColor('#00FF00') // Başarılı sonuç için yeşil renk
      .setTitle(`${message.author.tag} - Sıralama Bilgisi`)
      .addFields(
        { name: '**Mesaj Sıralamanız:**', value: `#${chatRank}`, inline: true },
        { name: '**Ses Sıralamanız:**', value: `#${voiceRank}`, inline: true }
      )
      .setTimestamp() // Zaman damgası eklenebilir
      .setFooter({ text: 'Sıralamalar güncellenmiştir.'}); // Footer eklenebilir

    message.reply({ embeds: [embed] });
  }
};

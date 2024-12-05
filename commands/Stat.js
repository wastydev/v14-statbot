const { EmbedBuilder } = require('discord.js');
const Stat = require('../models/stat'); // Stat modelini doğru yoldan import ettiğinizden emin olun

module.exports = {
  name: 'stat',
  description: 'Kullanıcının ses ve mesaj istatistiklerini gösterir.',
  async execute(message) {
    // Eğer etiketlenen bir kullanıcı varsa, o kullanıcıyı al
    const user = message.mentions.users.first() || message.author; // Etiket yoksa, mesajı gönderen kullanıcı

    const stat = await Stat.findOne({ userId: user.id });

    if (!stat) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Hata!')
            .setDescription(`${user.tag} için istatistikler bulunamadı.`)
        ]
      });
    }

    const messageStat = stat.messages;
    const voiceStat = stat.voiceTime;
    const hours = Math.floor(voiceStat / 3600);
    const minutes = Math.floor((voiceStat % 3600) / 60);
    const seconds = voiceStat % 60;

    const embed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle(`${user.tag} - İstatistikler`)
      .addFields(
        { name: '**Toplam Mesaj Sayısı:**', value: `${messageStat}`, inline: true },
        { name: '**Toplam Ses Süresi:**', value: `${hours} saat ${minutes} dakika ${seconds} saniye`, inline: true }
      )
      .setFooter({ text: 'İstatistikleriniz güncellenmiştir.' });

    message.reply({ embeds: [embed] });
  }
};

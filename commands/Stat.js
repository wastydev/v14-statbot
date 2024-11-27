const Stat = require('../models/stat');

module.exports = {
  name: 'stat',
  description: 'Kullanıcının mesaj sayısını ve ses kanalında geçirdiği süreyi gösterir.',
  async execute(message, args) {
    // Eğer komutun ardından kullanıcı belirtilmemişse, mesajı atan kullanıcının istatistiğini göster
    let user = message.author;

    if (args.length > 0) {
      // Kullanıcı adı belirtilmişse, kullanıcıyı bul
      user = message.mentions.users.first() || message.guild.members.cache.get(args[0])?.user;
      if (!user) {
        message.reply('Geçerli bir kullanıcı bulunamadı.');
        return;
      }
    }

    // Kullanıcının istatistiklerini bulma
    const stat = await Stat.findOne({ userId: user.id });

    if (stat) {
      const messageStat = stat.messages;
      const voiceStat = stat.voiceTime;

      // Ses kanalında geçen süreyi saat:dakika:saniye formatında gösterme
      const hours = Math.floor(voiceStat / 3600);
      const minutes = Math.floor((voiceStat % 3600) / 60);
      const seconds = voiceStat % 60;

      message.reply(`${user.tag} toplamda ${messageStat} mesaj göndermiş ve ses kanalında toplamda ${hours} saat ${minutes} dakika ${seconds} saniye geçirmiş.`);
    } else {
      message.reply(`${user.tag} için istatistik bulunamadı.`);
    }
  }
};

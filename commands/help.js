const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Botun komutlarını ve açıklamalarını listeler.',
  async execute(message, args) {
    const commands = message.client.commands;
    const prefix = '.';

    // Eğer hiç argüman verilmemişse, tüm komutları listele
    if (args.length === 0) {
      const commandList = commands.map(cmd => `**${prefix}${cmd.name}** - ${cmd.description}`).join('\n');
      const embed = new EmbedBuilder()
        .setColor('#8A2BE2')
        .setTitle('Komut Listesi')
        .setDescription(commandList)
        .setFooter({ text: 'Daha fazla bilgi için: .help [komut adı]' });

      return message.reply({ embeds: [embed] });
    }

    // Belirli bir komut istenmişse
    const commandName = args[0].toLowerCase();
    const command = commands.get(commandName);

    if (!command) {
      return message.reply(
        new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Hata!')
          .setDescription(`**${commandName}** adında bir komut bulunamadı.`)
      );
    }

    // Komut hakkında detaylı bilgi
    const embed = new EmbedBuilder()
      .setColor('#00BFFF')
      .setTitle(`${command.name} Komutu`)
      .addFields(
        { name: 'Açıklama:', value: command.description },
        { name: 'Kullanım:', value: `${prefix}${command.name}` }
      )
      .setFooter({ text: 'Komut hakkında yardım alabilirsiniz.' });

    message.reply({ embeds: [embed] });
  }
};

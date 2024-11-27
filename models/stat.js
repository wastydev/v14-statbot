const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  messages: { type: Number, default: 0 }, // Kullanıcının mesaj sayısı
  voiceTime: { type: Number, default: 0 }, // Ses kanalında geçirilen süre (saniye cinsinden)
  lastVoiceEnterTime: { type: Date, default: null }, // Ses kanalına giriş zamanı
});

module.exports = mongoose.model('Stat', statSchema);

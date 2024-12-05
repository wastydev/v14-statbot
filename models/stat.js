const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true 
  }, // Kullanıcı ID'si, her kullanıcı için benzersiz olmalı
  messages: { 
    type: Number, 
    default: 0 
  }, // Kullanıcının gönderdiği toplam mesaj sayısı
  voiceTime: { 
    type: Number, 
    default: 0 
  }, // Kullanıcının toplam ses süresi (saniye cinsinden)
  lastVoiceEnterTime: { 
    type: Date, 
    default: null 
  } // Kullanıcının ses kanalına en son giriş yaptığı zaman
});

module.exports = mongoose.model('Stat', statSchema);

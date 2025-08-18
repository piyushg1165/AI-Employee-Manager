const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
     chatId: {
         type: String, required: true, unique: true
     },
     summaryContent: { type: String, default: '' }

} , { timestamps: true });

const Summary = new mongoose.model('Summary', summarySchema);

module.exports = Summary;
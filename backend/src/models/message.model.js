const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chatId: {
        type: String,
        required: true,
    },
    prompt: {
        type: String,
        required: true,
    },
    result: {
        type: String,
    }

} , { timestamps: true });

const Message = new mongoose.model('Message', messageSchema);

module.exports = Message;
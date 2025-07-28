const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    }



},{timestamps: true});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
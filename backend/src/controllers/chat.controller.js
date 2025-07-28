const Chat = require('../models/chat.model.js');

const getAllChats = async (req, res) => {

    const chats = Chat.find();

    try {
        
    } catch (error) {
        
    }
    
};
const getChatById = async (req, res) => {

    
};
const getAllMessages = async (req, res) => {

    
};



module.exports = {getAllChats, getChatById};
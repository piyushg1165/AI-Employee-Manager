const Chat = require('../models/chat.model.js');

const getAllChats = async (req, res) => {

    const chats = Chat.find();

    try {
        if(!chats){
            return res.status(404).json({message: "Chats does not exist"});
        }

        res.status(200).json({
                 chats
        });
    } catch (error) {
        
    }
    
};
const getChatById = async (req, res) => {

    
};
const getAllMessages = async (req, res) => {

    
};



module.exports = {getAllChats, getChatById, getAllMessages};
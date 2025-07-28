const Chat = require('../models/chat.model.js');

const getAllChats = async (req, res) => {
    const { userId } = req.body; 

    try {
        const chats = await Chat.find({ userId });

        if (!chats || chats.length === 0) {
            return res.status(404).json({ message: "Chats do not exist" });
        }

        res.status(200).json({ chats });
    } catch (error) {
        console.log("Error in getAllChats controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
const getChatById = async (req, res) => {
    const { id } = req.body;

    try {
        const chat = await Chat.findById(id);

        if (!chat) {
            return res.status(404).json({ message: "Chat does not exist" });
        }

        res.status(200).json({ chat });
    } catch (error) {
        console.log("Error in getChatById controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
    
};
const getAllMessages = async (req, res) => {

    
};

const createChat = async (req, res) => {
    const { userId, chatName } = req.body;

    try {

        if(!userId || !chatName ) {
            return res.status(400).json({message: "All fields are required"});
        }
        const newChat = await Chat.create({ userId, name:chatName });
        res.status(201).json({ chat: newChat });
    } catch (error) {
        console.log("Error in createChat controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {getAllChats, getChatById, getAllMessages, createChat};
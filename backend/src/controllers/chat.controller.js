const Chat = require('../models/chat.model.js');
const Message = require('../models/message.model.js');

const getAllChats = async (req, res) => {
    const { userId } = req.params; 

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
    const { id } = req.params;

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
const getAllMessagesByChatId = async (req, res) => {

    const { chatId } = req.params;

    try {
        const messages = await Message.find({ chatId });

        if (!messages || messages.length === 0) {
            return res.status(404).json({ message: "Messages do not exist" });
        }

        res.status(200).json({ messages });
    } catch (error) {
        console.log("Error in getAllMessagesByChatId controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
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

const deleteChatById = async (req, res) => {
    const { id } = req.params;

    try {

        const messages = await Message.find({ chatId: id });
        if (messages && messages.length > 0) {
            await Message.deleteMany({ chatId: id });
        }

        const deletedChat = await Chat.findByIdAndDelete(id);
        if (deletedChat) {
            console.log('Chat deleted successfully:', deletedChat);
            res.status(200).json({ message: "Chat deleted successfully" });
        } else {
            console.log('No chat found with that ID.');
            return res.status(404).json({ message: "Chat not found" });
        }
    } catch (error) {
        console.error('Error deleting chat:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {getAllChats, getChatById, getAllMessagesByChatId, createChat, deleteChatById};
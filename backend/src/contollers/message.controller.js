const Message = require('../models/message.model');

// const getMessage = async (req, res) => {

//     try {
//         const { id:incomingMessageId } = req.params;
//         const messageId = req._id;
//         const message = await Message.find({ messageId })

//         res.status(200).json(message);
//     } catch (error) {
//         console.error("Error in getMessage controller: ", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };
const getAllMessages = async (req, res) => {
    try {
        const { id:chatId } = req.params;
        const messages = await Message.find({ chatId })

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages controller: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }

};

const createMessage = async (req, res) => {

    const {chatId, prompt, result} = req.body;

try {
    const message = {
        chatId,
        prompt,
        result
    }

    await message.save();
    res.status(201).json({
             _id: message._id,
             chatId: message.chatId,
                prompt: message.firstName,
                result: message.lastName,
        });

    } catch (error) {
        console.log("Error in create message controller", error);
        res.status(500).json({message: "Internal Server Error"})
    }  
}
};

module.exports = {getMessage, getAllMessages, createMessage};

const Message = require('../models/message.model');




const createMessage = async (req, res) => {

    const {chatId, prompt, result} = req.body;

try {
    const message = new Message({
        chatId,
        prompt,
        result
    });

    await message.save();
    res.status(201).json({
             _id: message._id,
             chatId: message.chatId,
                prompt: message.prompt,
                result: message.result,
        });

    } catch (error) {
        console.log("Error in create message controller", error);
        res.status(500).json({message: "Internal Server Error"})
    }  

};

module.exports = {  createMessage};

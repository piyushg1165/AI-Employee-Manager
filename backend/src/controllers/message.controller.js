const Message = require('../models/message.model');

const createMessage = async (req, res) => {

    const {chatId, prompt, result} = req.body;

    try {
        if(!chatId || !prompt || !result ) {
                return res.status(400).json({message: "All fields are required"});
            }
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

const deleteMessage = async ( req, res ) => {

    const {id} = req.params;

    try {
            const deletedMessage = await Message.findByIdAndDelete(id);
            if (deletedMessage) {
                console.log('Message deleted successfully:', deletedMessage);
                res.status(200).json({message: "Message deleted successfully"});
            } else {
                console.log('No message found with that ID.');
                return res.status(404).json({message: "Message not found"});
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            res.status(500).json({message: "Internal Server Error"});
        }
};



module.exports = {  createMessage, deleteMessage};

const Message = require('../models/message.model');
const { qdrantClient } = require('../db/qdrantdb.js');
const { getEmbedding } = require('../utils/transformer.js');
const axios = require('axios');
const Chat = require('../models/chat.model');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;


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
      console.log("Received delete request for ID:", id);

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

const sendMessage = async (req, res) => {
  const { message,  chatId} = req.body;

  if(!chatId) {
    return res.status(400).json({message: "chatId is required"});
  }

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  // Step 1: Get Chat History for Context
  console.time('📚 Chat History Retrieval');
  let chatHistory = [];
  try {
    const previousMessages = await Message.find({ chatId }).sort({ createdAt: 1 }).limit(10);
    chatHistory = previousMessages.flatMap(msg => {
      const messages = [];
      if (msg.prompt) {
        messages.push({ role: 'user', content: msg.prompt });
      }
      if (msg.result) {
        messages.push({ role: 'assistant', content: msg.result });
      }
      return messages;
    });
  } catch (err) {
    console.error('Error fetching chat history:', err);
    // Continue without chat history if there's an error
  }
  console.timeEnd('📚 Chat History Retrieval');

  // Step 2: Get Embedding
  console.time('🧠 Embedding Generation');
  const embeddingResult = await getEmbedding(message);
  console.timeEnd('🧠 Embedding Generation');

  if (!embeddingResult?.[0]?.data) {
    return res.status(500).json({ message: 'Invalid embedding structure' });
  }
  const embedding = Array.from(embeddingResult[0].data);

  const qdrantQuery = {
    vector: embedding,
    limit: 10,
    score_threshold: 0.2,
    with_payload: true,
  };

  // Step 3: Search Qdrant
  let relevantData;
  console.time('🔍 Qdrant Vector Search');
  try {
    relevantData = await qdrantClient.search('employees', qdrantQuery);
  } catch (err) {
    console.timeEnd('🔍 Qdrant Vector Search');
    console.error('Qdrant search error:', err);
    return res.status(500).json({ message: 'Error searching Qdrant vector DB' });
  }
  console.timeEnd('🔍 Qdrant Vector Search');

  // Step 4: Prepare Context
  const contextChunks = relevantData
    .map((item) => JSON.stringify(item.payload))
    .join('\n');

  // Step 5: Prepare Messages Array with Chat History
  const messages = [
    {
      role: 'user',
      content: 'You are an AI assistant named Virox AI that answers user questions using the provided context and conversation history. Keep answers accurate and conversational, referencing previous messages when relevant.'
    }
  ];

  // Add chat history to messages
  if (chatHistory.length > 0) {
    messages.push(...chatHistory);
  }

  // Add current message with context
  messages.push({
    role: 'user',
    content: `Context:\n${contextChunks}\n\nQuestion: ${message}`
  });

  // Step 6: Call AI API
  console.time('🤖 AI Response Generation');
  try {
    const aiResponse = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-oss-20b:free',
        messages: messages,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.timeEnd('🤖 AI Response Generation');

    const aiText =
      aiResponse.data.choices?.[0]?.message?.content || 'No response from AI';

      

      await Message.create({chatId, prompt:message, result:aiText });

      const words = message.split(/\s+/);
const newName = words.slice(0, 5).join(' ');

      const chat = await Chat.findById(chatId);
if (chat.name === "new chat") {
  await Chat.findByIdAndUpdate(chatId, { name: newName }, { new: true });
}

    // Step 5: Final Response
    res.status(200).json({prompt:message, result:aiText}
    );
  } catch (err) {
    if (err.response) {
      console.error('OpenRouter error:', err.response.status, err.response.data);
      return res.status(err.response.status).json({ message: err.response.data });
    } else {
      console.error('OpenRouter error:', err.message);
      return res.status(500).json({ message: 'Error calling OpenRouter API' });
    }
  }
};

module.exports = { createMessage, deleteMessage, sendMessage };

const axios = require('axios');
const Message = require('../models/message.model.js');
const Summary = require('../models/summary.model.js');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

/**
 * Append a new message to the messages collection
 */
async function appendChatMessage(chatId, role, content) {

  if (role === 'user') {
    // Create a new message with user's prompt
    const message = new Message({
      chatId,
      prompt: content,
      result: '' // assistant result will be added later
    });
    try {
      await message.save();
    } catch (error) {
      console.error("Error saving user message:", error);
    }
    return message._id; // return the ID so we can reference it later
  } else if (role === 'assistant') {
    // Find the last message of this chat where result is empty
    const message = await Message.findOne({
      chatId,
      result: '' // find the user's message waiting for assistant response
    }).sort({ createdAt: -1 }); // get the latest one

    if (!message) {
      throw new Error('No user message found to attach assistant response');
    }

    // Update the same message with assistant response
    message.result = content;
    await message.save();
    return message._id;
  } else {
    throw new Error(`Invalid role: ${role}`);
  }
}

/**
 * Get last N messages for a chat
 */
async function getLastMessages(chatId, limit = 5) {
  return await Message.find({ chatId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

/**
 * Get existing summary for a chat
 */
async function getOrCreateSummary(chatId) {

  let doc = await Summary.findOne({ chatId });

  if(doc && doc.summaryContent){
    return doc.summaryContent;
  }

  await compressOldMessages(chatId);
  
   doc = await Summary.findOne({ chatId });

  return doc?.summaryContent || '';
}

/**
 * Compress old messages into a summary
 */
async function compressOldMessages(chatId) {

  const messages = await Message.find({ chatId }).sort({ createdAt: 1 }).lean();


  if(messages.length === 0){
    const noContent = '';
    await Summary.updateOne(
  { chatId },
  { $set: { chatId, summaryContent: noContent } }, // include chatId when upserting
  { upsert: true }
);
  }

  const older = messages.slice(0, -10);
  const last10 = messages.slice(-10);

  const textToSummarize = last10
    .map(m => `Prompt: ${m.prompt}\nResult: ${m.result || ''}`)
    .join('\n\n');


  const system = `You are a conversation summarizer. Summarize the following chat focusing on user's preferences, constraints, and relevant facts in 2-3 sentences.`;

  const body = {
    model: 'openai/gpt-oss-20b:free',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: textToSummarize }
    ],
    temperature: 0.0
  };

  const resp = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    body,
    {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const summary = resp.data.choices?.[0]?.message?.content || '';

  if (summary) {
    await Summary.updateOne(
  { chatId },
  { $set: { chatId, summaryContent: summary } }, // include chatId when upserting
  { upsert: true }
);


    // Delete older messages to save space
    await Message.deleteMany({ _id: { $in: older.map(m => m._id) } });
  } else {
    console.warn("No summary generated, skipping save.");
  }
}


module.exports = {
  appendChatMessage,
  getLastMessages,
  getOrCreateSummary,
  compressOldMessages
};

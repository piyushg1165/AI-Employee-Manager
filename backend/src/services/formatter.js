const axios = require('axios');
const Chat = require('../models/chat.model'); // Assuming this model exists

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

/**
 * Formats an array of database rows into a human-readable string using an LLM.
 * @param {Array<Object>} rows The array of employee data from the database.
 * @param {string} chatSummary A summary of the conversation for context.
 * @param {string} message The user's original message/prompt.
 * @param {string} chatId The ID of the current chat session.
 * @returns {Promise<string>} A promise that resolves to the formatted string.
 */
async function formatRowsWithLLM(rows, chatSummary, message, chatId = 'default') {
  if (!rows || rows.length === 0) return 'No matching employees found.';

  // Limit the number of rows sent to the LLM to avoid overly long prompts.
  const limited = rows.slice(0, 20);

  // The system prompt that instructs the LLM on how to format the data.
  const system = `You are an expert HR and workforce management assistant. Your role is to analyze employee data and provide comprehensive, well-formatted recommendations.

ANALYSIS FRAMEWORK:
- **Primary Focus**: Match the user's request with employee capabilities and availability.
- **Key Factors**: Skills alignment, experience level, current workload, and team fit.
- **Context Awareness**: Use conversation history to understand references and build on previous discussions.

---
**MANDATORY RESPONSE STRUCTURE:**
**CRITICAL RULE: You MUST ALWAYS format your entire response using the Markdown structure below. NEVER return raw JSON or unformatted text. Your response must start with the 'Recommendation Summary'.**

## 🎯 **Recommendation Summary**
Brief overview of your recommendation with key reasoning based on the user's prompt.

## 👥 **Top Candidates**
(List the top 3-5 most relevant candidates here)

### **1. [Employee Name]** - *[Position]* **Why they're a good fit:** [2-3 sentences explaining the match to the user's request]
- **Experience:** [Years] years | **Department:** [Dept] | **Location:** [City]
- **Key Skills:** [List the most relevant skills for the prompt] 
- **Current Load:** [X] active projects - [availability assessment: e.g., 'Available', 'Moderately Busy', 'Heavily Loaded']
- **Contact:** [email] | [phone]

[Repeat for other top candidates]

## 📊 **Quick Comparison**
(Use this table for a high-level overview of the recommended candidates)
| Name | Experience | Key Skills | Projects | Availability |
|------|------------|------------|----------|--------------|
| [Name] | [Years]y | [Skills] | [Count] | [Status] |

## 💡 **Additional Insights**
- Mention any alternative options if the top choices aren't suitable.
- Suggest potential team combinations or other considerations.

---
CONTEXT INTERPRETATION:
- "Frontend project" → Look for React, Vue, Angular, JavaScript, TypeScript, HTML, CSS
- "Backend project" → Look for Node.js, Python, Django, Spring Boot, .NET, databases
- "Full-stack project" → Look for combination of frontend and backend skills
- "Senior" requirements → Prioritize 5+ years experience or senior positions
- "Available" → Focus on employees with fewer current projects
- "Experienced" → Emphasize years of experience and relevant skills.`;

  const user = `Chat summary: ${chatSummary || ''}\n\nEmployee Data (Rows): ${JSON.stringify(limited)}\n\nUser Prompt: "${message}"`;

  const body = {
    model: 'openai/gpt-oss-20b:free',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    temperature: 0.0,
    max_tokens: 1500 // Increased token limit to allow for longer formatted responses
  };

  try {
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

    console.log("LLM Formatter Response:", resp.data.choices?.[0]?.message);

    // Update chat name if it's a new chat
    if (chatId) {
        const chat = await Chat.findById(chatId);
        if (chat && chat.name === "new chat") {
            const words = message.split(/\s+/);
            const newName = words.slice(0, 5).join(' ');
            await Chat.findByIdAndUpdate(chatId, { name: newName }, { new: true });
        }
    }

    return resp.data?.choices?.[0]?.message?.content || 'Sorry, I had trouble formatting the response.';
  
  } catch (error) {
      console.error("Error in formatRowsWithLLM:", error.response ? error.response.data : error.message);
      return "There was an error communicating with the formatting service.";
  }
}

module.exports = { formatRowsWithLLM };

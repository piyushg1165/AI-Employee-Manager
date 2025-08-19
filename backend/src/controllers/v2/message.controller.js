const {
  appendChatMessage,
  getLastMessages,
  getOrCreateSummary,
} = require('../../services/context.js');

const { formatRowsWithLLM } = require('../../services/formatter.js');
const { translateNLToSQL } = require('../../services/translator.js');
const { validateAndEnforceSelect } = require('../../services/validator.js');
const { pgPool } = require('../../db/postgres.js');

const queryHandler = async (req, res) => {
  const { chatId = 'default', message, bypassTemplates = false, pageSize = 10 } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });
  let role = 'user';

  try {
    await appendChatMessage(chatId, role, message);
    const summary = await getOrCreateSummary(chatId);
    if(summary === '') console.log("No summary found");

    const lastMessages = await getLastMessages(chatId, 5);
    
    const compactContext =
      (summary ? 'Summary: ' + summary + '\n' : '') +
      lastMessages.map(m => `${m.role}: ${m.content}`).join('\n');

    // Template shortcut (example)
    const lc = message.toLowerCase();
    const templateMatch = lc.match(/\b(list|show) (react|frontend) developers(?: with (\d+)\+? years?)?/);
    if (templateMatch && !bypassTemplates) {
      const skill = templateMatch[2] === 'frontend' ? 'React' : templateMatch[2];
      const years = templateMatch[3] ? parseInt(templateMatch[3], 10) : 0;
      const sql =
        'SELECT id,name,email,department,experience_years,skills FROM employees WHERE $1 = ANY(skills) AND experience_years >= $2 ORDER BY experience_years DESC LIMIT $3';
      const params = [skill, years, pageSize];

      const start = Date.now();
      const { rows } = await pgPool.query({ text: sql, values: params, rowMode: 'array' });
      const duration = Date.now() - start;

      const formatted = await formatRowsWithLLM(rows, summary);
      await appendChatMessage(chatId, 'assistant', formatted || JSON.stringify(rows));
      return res.json({ rows, formatted, duration });
    }

    // LLM translation
    const translation = await translateNLToSQL(message, compactContext);
    let { sql, params } = translation;

    try {
      sql = validateAndEnforceSelect(sql);
    } catch (err) {
      const clarifying =
        'I cannot run that query because it is unsafe or unsupported. Can you rephrase or be more specific?';
      await appendChatMessage(chatId, 'assistant', clarifying);
      console.log( " ===== ",err);
      return res.status(400).json({ error: 'unsafe_sql', message: clarifying });
    }

    const queryStart = Date.now();
    const queryRes = await pgPool.query({
      text: sql,
      values: params
    });
    const queryDuration = Date.now() - queryStart;

    const formatted = await formatRowsWithLLM(queryRes.rows, summary, message, chatId);
    await appendChatMessage(chatId, 'assistant', formatted || JSON.stringify(queryRes.rows));

    res.json({
      rows: queryRes.rows,
      messages: [
        {
          prompt: message,
          result: formatted
        }
      ],
      queryDuration
    });

  } catch (err) {
    console.error('ERR /query', err);
    res.status(500).json({ error: err.message || String(err) });
  }
};

module.exports = { queryHandler };
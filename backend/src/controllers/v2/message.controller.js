const {
  appendChatMessage,
  getLastMessages,
  getOrCreateSummary,
} = require('../../services/context.js');


const { formatRowsWithLLM } = require('../../services/formatter.js');
const { translateNLToSQL } = require('../../services/translator.js');
const { validateAndEnforceSelect } = require('../../services/validator.js');
const { cacheKeyFor } = require('../../utils/cacheKey.js');
const { pgPool } = require('../../db/postgres.js');
const { redisClient } = require('../../db/redis.js');
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

      const key = cacheKeyFor(sql, params);
      const cached = await redisClient.get(key);
      if (cached) {
        const rows = JSON.parse(cached);
        const formatted = await formatRowsWithLLM(rows, summary);
        await appendChatMessage(chatId, 'assistant', formatted || JSON.stringify(rows));
        return res.json({ rows, formatted, cached: true });
      }

      const start = Date.now();
      const { rows } = await pgPool.query({ text: sql, values: params, rowMode: 'array' });
      const duration = Date.now() - start;

      await redisClient.set(key, JSON.stringify(rows), { EX: 120 });
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

    const key = cacheKeyFor(sql, params);
    const cached = await redisClient.get(key);
    if (cached) {
      const rows = JSON.parse(cached);
      const formatted = await formatRowsWithLLM(rows, summary);
      await appendChatMessage(chatId, 'assistant', formatted || JSON.stringify(rows));
      return res.json({ rows, formatted, cached: true });
    }

    const queryStart = Date.now();
    const queryRes =  await pgPool.query({
            text: sql,
            values: params
        });
    const queryDuration = Date.now() - queryStart;

    await redisClient.set(key, JSON.stringify(queryRes.rows), { EX: 120 });
    const formatted = await formatRowsWithLLM(queryRes.rows, summary, message, chatId);
    await appendChatMessage(chatId, 'assistant', formatted || JSON.stringify(queryRes.rows));

    // res.json({ rows: queryRes.rows, formatted, queryDuration });
    res.json({
      rows: queryRes.rows,
  messages: [
    {
      prompt: message,         // user input
      result: formatted        // final LLM output
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






// /*
// Low-latency SQL-backed RAG scaffold (Node.js + Express)

// Files & purpose packed into a single file for easy copy-paste:
// - package.json (see comment)
// - server.js (Express app)
// - translator.js (NL -> SQL via OpenRouter)
// - validator.js (SQL AST validation using node-sql-parser)
// - db.js (Postgres connection)
// - cache.js (Redis)
// - context.js (Mongo-based chat history + summarization)
// - formatter.js (optional small LLM formatting)

// HOW TO USE
// 1. Copy this file into a new folder as `server.js` (or split into files as you like).
// 2. Create a .env file with the keys described below.
// 3. Run `npm init -y` and install deps listed in the top comment, or run the command in the comment.
// 4. Start with `node server.js`

// ENV REQUIRED
// - OPENROUTER_API_KEY  (for LLM calls)
// - PG_CONNECTION_STRING (postgres connection string)
// - REDIS_URL (redis connection)
// - MONGO_URI (mongo connection)
// - PORT (optional, default 3000)

// NOTE: This scaffold favors clarity and safety over absolute minimalism. It demonstrates the core
// end-to-end pieces you asked for: NL->SQL translation, SQL validation, safe parameterized execution,
// context summarization, caching, pagination, and optional LLM-based formatting.
// */

// /*
// Install dependencies with:
// npm i express node-fetch pg redis mongodb node-sql-parser dotenv crypto

// If you want streaming from OpenRouter, consider using "eventsource" clients or fetch with streaming.
// */

// // ---------- Imports & Setup ----------
// import express from 'express';
// import fetch from 'node-fetch';
// import dotenv from 'dotenv';
// import { Pool } from 'pg';
// import Redis from 'redis';
// import { MongoClient, ObjectId } from 'mongodb';
// import crypto from 'crypto';
// import { Parser } from 'node-sql-parser';

// dotenv.config();
// const app = express();
// app.use(express.json({ limit: '1mb' }));

// const PORT = process.env.PORT || 3000;
// const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
// const PG_CONNECTION_STRING = process.env.PG_CONNECTION_STRING;
// const REDIS_URL = process.env.REDIS_URL;
// const MONGO_URI = process.env.MONGO_URI;

// if (!OPENROUTER_API_KEY || !PG_CONNECTION_STRING || !REDIS_URL || !MONGO_URI) {
//   console.warn('Make sure OPENROUTER_API_KEY, PG_CONNECTION_STRING, REDIS_URL, and MONGO_URI are set.');
// }

// // ---------- Postgres (pg) ----------
// const pgPool = new Pool({ connectionString: PG_CONNECTION_STRING, max: 20 });

// // ---------- Redis (cache) ----------
// const redisClient = Redis.createClient({ url: REDIS_URL });
// redisClient.on('error', (err) => console.error('Redis Client Error', err));
// await redisClient.connect();

// // ---------- Mongo (chat context) ----------
// const mongoClient = new MongoClient(MONGO_URI, { useUnifiedTopology: true });
// await mongoClient.connect();
// const db = mongoClient.db(process.env.MONGO_DB || 'chatdb');
// const chats = db.collection('chats');

// // ---------- SQL Parser / Validator ----------
// const parser = new Parser();
// const ALLOWED_TABLES = ['employees'];
// const ALLOWED_COLUMNS = new Set(['id','name','email','department','experience_years','skills']);

// function validateAndEnforceSelect(sqlText) {
//   // parse -- node-sql-parser throws if invalid
//   let ast;
//   try {
//     ast = parser.astify(sqlText);
//   } catch (err) {
//     throw new Error('SQL_PARSE_ERROR:' + err.message);
//   }

//   // single statement enforcement
//   if (Array.isArray(ast)) ast = ast[0];
//   if (!ast || ast.type !== 'select') throw new Error('Only SELECT statements are allowed');

//   // check tables
//   const tables = [];
//   const extractTables = (node) => {
//     if (!node) return;
//     if (node.from) {
//       for (const f of node.from) {
//         if (f.table) tables.push(f.table);
//       }
//     }
//   };
//   extractTables(ast);
//   for (const t of tables) {
//     if (!ALLOWED_TABLES.includes(t)) throw new Error('Forbidden table in query: ' + t);
//   }

//   // check selected columns
//   const columns = (ast.columns || []).map(c => c.expr && c.expr.column ? c.expr.column : null).filter(Boolean);
//   if (columns.length > 0) {
//     for (const col of columns) {
//       if (!ALLOWED_COLUMNS.has(col)) throw new Error('Forbidden column: ' + col);
//     }
//   }

//   // enforce LIMIT if missing
//   const hasLimit = !!ast.limit;
//   if (!hasLimit) {
//     // naive - append LIMIT 50
//     sqlText = sqlText + ' LIMIT 50';
//   }

//   return sqlText;
// }

// // ---------- Helpers: cache key ----------
// function cacheKeyFor(sql, params) {
//   const h = crypto.createHash('sha256');
//   h.update(sql + '||' + JSON.stringify(params || []));
//   return 'sqlcache:' + h.digest('hex');
// }

// // ---------- LLM: NL -> SQL Translator (OpenRouter) ----------
// async function translateNLToSQL(userMessage, chatSummary) {
//   // strict instruction JSON output
//   const system = `You are a SQL generator for a Postgres DB with tables: employees(id,name,email,department,experience_years,skills).\nRules:\n- Output ONLY JSON with two keys: sql (string) and params (array).\n- Only generate SELECT queries. No INSERT/UPDATE/DELETE.\n- ALWAYS use $1, $2 parameter placeholders for user-provided values.\n- Always include LIMIT. If user did not specify, default to 50.\n- Use simple WHERE conditions; do not generate complex subqueries or dangerous constructs.\n- If user intent is ambiguous, ask a clarifying question - do NOT guess.\n`;

//   const user = `Chat summary: ${chatSummary || ''}\nUserRequest: ${userMessage}\nReturn strict JSON.`;

//   const body = {
//     model: 'openai/gpt-oss-20b:free',
//     messages: [
//       { role: 'system', content: system },
//       { role: 'user', content: user }
//     ],
//     temperature: 0.0,
//     max_tokens: 600
//   };

//   const resp = await fetch('https://api.openrouter.ai/v1/chat/completions', {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify(body)
//   });

//   if (!resp.ok) {
//     const txt = await resp.text();
//     throw new Error('LLM_TRANSLATE_ERROR: ' + resp.status + ' ' + txt);
//   }

//   const data = await resp.json();
//   // expect data.choices[0].message.content
//   const content = data?.choices?.[0]?.message?.content;
//   if (!content) throw new Error('LLM returned no content');

//   // try parse JSON strictly
//   try {
//     const parsed = JSON.parse(content);
//     if (!parsed.sql || !Array.isArray(parsed.params)) throw new Error('Translator returned invalid JSON fields');
//     return parsed;
//   } catch (err) {
//     // fallback: try to extract JSON substring
//     const m = content.match(/\{[\s\S]*\}$/m);
//     if (!m) throw new Error('Could not parse JSON from LLM response');
//     return JSON.parse(m[0]);
//   }
// }

// // ---------- Context provider: store & summarize chat ----------
// async function appendChatMessage(chatId, role, content) {
//   await chats.updateOne({ _id: chatId }, { $push: { messages: { role, content, ts: new Date() } } }, { upsert: true });
// }

// async function getLastMessages(chatId, limit = 10) {
//   const doc = await chats.findOne({ _id: chatId });
//   if (!doc || !doc.messages) return [];
//   return doc.messages.slice(-limit);
// }

// async function getOrCreateSummary(chatId) {
//   const doc = await chats.findOne({ _id: chatId });
//   if (!doc) return '';
//   return doc.summary || '';
// }

// async function compressOldMessages(chatId) {
//   // Use LLM to summarize older messages; this is optional but recommended.
//   const doc = await chats.findOne({ _id: chatId });
//   if (!doc || !doc.messages || doc.messages.length < 20) return;
//   const older = doc.messages.slice(0, -10);
//   const last10 = doc.messages.slice(-10);
//   const textToSummarize = older.map(m => `${m.role}: ${m.content}`).join('\n');

//   const system = `You are a conversation summarizer. Summarize the following chat focusing on user's preferences, constraints, and relevant facts in 2-3 sentences.`;
//   const user = textToSummarize;

//   const body = { model: 'mistral-7b-instruct', messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.0 };
//   const resp = await fetch('https://api.openrouter.ai/v1/chat/completions', {
//     method: 'POST', headers: { 'Authorization': `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body)
//   });
//   const data = await resp.json();
//   const summary = data.choices?.[0]?.message?.content || '';
//   await chats.updateOne({ _id: chatId }, { $set: { summary }, $push: { messages: { $each: last10 } }, $unset: { messages: '' } }, { upsert: true });
//   // note: the $unset step above is illustrative; in production you'd store summary and prune messages carefully
// }

// // ---------- Formatter: optional LLM-based humanization ----------
// async function formatRowsWithLLM(rows, chatSummary) {
//   if (!rows || rows.length === 0) return 'No matching employees found.';
//   // limit rows sent to formatter
//   const limited = rows.slice(0, 20);
//   const system = `You are an HR assistant. Given the rows, produce a concise 2-line recommendation per candidate. Output only markdown.`;
//   const user = `Chat summary: ${chatSummary || ''}\nRows: ${JSON.stringify(limited)}`;
//   const body = { model: 'mistral-7b-instruct', messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.0, max_tokens: 400 };
//   const resp = await fetch('https://api.openrouter.ai/v1/chat/completions', {
//     method: 'POST', headers: { 'Authorization': `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body)
//   });
//   const data = await resp.json();
//   return data.choices?.[0]?.message?.content || null;
// }

// // ---------- Route: /query (main entry) ----------
// app.post('/query', async (req, res) => {
//   /*
//     Expected body:
//     {
//       chatId: <string>,
//       message: <string>,
//       bypassTemplates: false (optional),
//       pageSize: 10 (optional)
//     }
//   */
//   const { chatId = 'default', message, bypassTemplates = false, pageSize = 10 } = req.body;
//   if (!message) return res.status(400).json({ error: 'message required' });

//   try {
//     // 1. append user message to chat store
//     await appendChatMessage(chatId, 'user', message);

//     // 2. fetch summary + last messages
//     const summary = await getOrCreateSummary(chatId);
//     const lastMessages = await getLastMessages(chatId, 5);
//     const compactContext = (summary ? 'Summary: ' + summary + '\n' : '') + lastMessages.map(m => `${m.role}: ${m.content}`).join('\n');

//     // 3. short-circuit: if matches a template (very common queries), run template
//     // naive template detection example
//     const lc = message.toLowerCase();
//     const templateMatch = lc.match(/\b(list|show) (react|frontend) developers(?: with (\d+)\+? years?)?/);
//     if (templateMatch && !bypassTemplates) {
//       const skill = templateMatch[2] === 'frontend' ? 'React' : templateMatch[2];
//       const years = templateMatch[3] ? parseInt(templateMatch[3], 10) : 0;
//       const sql = 'SELECT id,name,email,department,experience_years,skills FROM employees WHERE $1 = ANY(skills) AND experience_years >= $2 ORDER BY experience_years DESC LIMIT $3';
//       const params = [skill, years, pageSize];

//       const key = cacheKeyFor(sql, params);
//       const cached = await redisClient.get(key);
//       if (cached) {
//         const rows = JSON.parse(cached);
//         const formatted = await formatRowsWithLLM(rows, summary);
//         await appendChatMessage(chatId, 'assistant', formatted || JSON.stringify(rows));
//         return res.json({ rows, formatted, cached: true });
//       }

//       const start = Date.now();
//       const { rows } = await pgPool.query({ text: sql, values: params, rowMode: 'array' });
//       const duration = Date.now() - start;
//       // rows are in arrays because of rowMode -- you can map to objects if needed
//       await redisClient.set(key, JSON.stringify(rows), { EX: 120 });
//       const formatted = await formatRowsWithLLM(rows, summary);
//       await appendChatMessage(chatId, 'assistant', formatted || JSON.stringify(rows));
//       return res.json({ rows, formatted, duration });
//     }

//     // 4. otherwise call translator LLM to produce SQL
//     const translation = await translateNLToSQL(message, compactContext);
//     let { sql, params } = translation;

//     // 5. validate and enforce safety
//     try {
//       sql = validateAndEnforceSelect(sql);
//     } catch (err) {
//       // ask clarifying question via assistant
//       const clarifying = 'I cannot run that query because it is unsafe or unsupported. Can you rephrase or be more specific?';
//       await appendChatMessage(chatId, 'assistant', clarifying);
//       return res.status(400).json({ error: 'unsafe_sql', message: clarifying });
//     }

//     // 6. cache check
//     const key = cacheKeyFor(sql, params);
//     const cached = await redisClient.get(key);
//     if (cached) {
//       const rows = JSON.parse(cached);
//       const formatted = await formatRowsWithLLM(rows, summary);
//       await appendChatMessage(chatId, 'assistant', formatted || JSON.stringify(rows));
//       return res.json({ rows, formatted, cached: true });
//     }

//     // 7. execute safely with timeout
//     const queryStart = Date.now();
//     const queryRes = await pgPool.query({ text: sql, values: params, rowMode: 'array' });
//     const queryDuration = Date.now() - queryStart;

//     // 8. cache + format
//     await redisClient.set(key, JSON.stringify(queryRes.rows), { EX: 120 });
//     const formatted = await formatRowsWithLLM(queryRes.rows, summary);

//     // 9. append assistant reply
//     await appendChatMessage(chatId, 'assistant', formatted || JSON.stringify(queryRes.rows));

//     // 10. return
//     res.json({ rows: queryRes.rows, formatted, queryDuration });
//   } catch (err) {
//     console.error('ERR /query', err);
//     res.status(500).json({ error: err.message || String(err) });
//   }
// });

// // simple health
// app.get('/health', (req, res) => res.json({ ok: true }));

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// /*
// NOTES & NEXT STEPS
// - Split this single-file scaffold into modules in a real repo: translator.js, validator.js, db.js, cache.js, context.js.
// - Improve SQL validator: use AST inspection to detect FULL TABLE SCANS via EXPLAIN, deny wildcard '*' selects if you prefer.
// - Improve context compression/pruning logic (compress older messages and store summaries in Mongo).
// - Replace formatRowsWithLLM with a template renderer for ultra-fast responses; call LLM only when a natural-language summary is required.
// - Add authentication and per-user authorization: do not expose private columns.
// - Add unit tests for validateAndEnforceSelect and translator error paths.
// */

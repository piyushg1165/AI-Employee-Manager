const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

/**
 * Translates a natural language query into a SQL query object.
 * @param {string} userMessage The natural language message from the user.
 * @param {string} chatSummary A summary of the conversation so far for context.
 * @returns {Promise<{sql: string, params: any[], clarification?: string}>} A promise that resolves to an object containing the SQL query, parameters, and an optional clarification message.
 */
async function translateNLToSQL(userMessage, chatSummary) {
  // System prompt defining the role, schema, and rules for the AI model.
  const system = `You are an intelligent SQL generator for a Postgres DB with an employees table:

TABLE SCHEMA:
employees(
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  position TEXT,
  joining_date DATE,
  employment_type TEXT,
  department TEXT,
  location TEXT,
  manager TEXT,
  experience_years INTEGER,
  is_remote BOOLEAN,
  skills TEXT[],
  projects TEXT[]
)

ARRAY HANDLING RULES:
- skills and projects are TEXT[] arrays
- NEVER use ILIKE/LIKE directly on array columns
- For pattern matching in arrays: EXISTS (SELECT 1 FROM unnest(column_name) AS val WHERE val ILIKE $n)
- For exact array matching: column_name @> ARRAY[$n]
- For any element matching: column_name && ARRAY[$n]

CONTEXTUAL UNDERSTANDING:
- When user refers to "him/her/they/this person", look for the most recently mentioned employee or ask for clarification
- "Backend project" implies checking for backend-related skills (e.g., 'Node.js', 'Python', 'Java', 'API', 'Database', 'Server')
- "Frontend project" implies frontend skills (e.g., 'React', 'Vue', 'Angular', 'JavaScript', 'HTML', 'CSS', 'UI/UX')
- "Mobile project" implies mobile skills (e.g., 'React Native', 'Flutter', 'iOS', 'Android', 'Swift', 'Kotlin')
- "Can I assign" questions should check relevant skills and current project load
- "Available" typically means not heavily loaded with projects or has capacity
- Department context matters (e.g., "developers in marketing" vs "marketing team")

QUERY INTELLIGENCE:
- Infer intent from natural language
- For assignment questions, check skills AND project capacity
- For availability queries, consider current projects count
- For skill matching, use pattern matching with common variations
- Default sorting: name ASC (unless context suggests otherwise)

RESPONSE FORMAT:
- No matter what you have to return valid JSON as output
- Required keys: "sql" (string), "params" (array)
- Optional key: "clarification" (string) - use when user intent is truly ambiguous
- If clarification needed, still provide a reasonable default query

QUERY CONSTRAINTS:
- Only SELECT queries allowed
- Allowed columns: id, name, email, phone, position, joining_date, employment_type, department, location, manager, experience_years, is_remote, skills, projects
- Always include LIMIT (default: 49 if not specified)
- Always use parameterized queries ($1, $2, etc.)
- NO SELECT * allowed

EXAMPLES OF ENHANCED UNDERSTANDING:
- "Can I assign him on a backend project" → Check if person has backend skills
- "Who's available for frontend work" → Find people with frontend skills and reasonable project load
- "Developers with React experience" → Pattern match for React in skills
- "Remote employees in engineering" → Filter by is_remote=true AND department
- "Senior developers" → Look for experience_years > threshold OR position containing 'Senior'
- "New joiners" → Recent joining_date
- "Overloaded employees" → High project count (array_length(projects, 1))

Always prioritize user intent over literal interpretation while maintaining SQL accuracy.`;

  const body = {
    model: 'openai/gpt-oss-20b:free',
    messages: [
      { role: 'system', content: system },
      { role: 'system', content: `Conversation so far: ${chatSummary}` },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.0,
    max_tokens: 800
  };

  try {
    const resp = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      body,
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        validateStatus: () => true // let us handle non-2xx manually
      }
    );

    if (resp.status < 200 || resp.status >= 300) {
      throw new Error(
        'LLM_TRANSLATE_ERROR: ' + resp.status + ' ' + JSON.stringify(resp.data)
      );
    }

    let content = resp.data?.choices?.[0]?.message?.content || '';

    try {
      // First, try to parse the content directly. This works if the LLM returns perfect JSON.
      const parsed = JSON.parse(content);
      console.log("Successfully parsed JSON directly from LLM:", parsed);
      if (!parsed.sql || !Array.isArray(parsed.params)) {
        throw new Error('Translator returned invalid JSON fields');
      }
      return parsed;
    } catch (err) {
      console.warn("Direct JSON parsing failed, attempting to extract from markdown.");
      // If direct parsing fails, try to extract JSON from a markdown code block.
      // This handles cases like ```json\n{...}\n```
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          console.log("Successfully parsed JSON from markdown block:", parsed);
          if (!parsed.sql || !Array.isArray(parsed.params)) {
            throw new Error('Translator returned invalid JSON fields from markdown block');
          }
          return parsed;
        } catch (parseError) {
            console.error("Failed to parse JSON even after extracting from markdown.", parseError);
        }
      }

      // As a final fallback, use the original broader regex.
      const fallbackJsonMatch = content.match(/\{[\s\S]*\}/);
      if (fallbackJsonMatch) {
          try {
            const parsed = JSON.parse(fallbackJsonMatch[0]);
            console.log("Successfully parsed JSON with fallback regex:", parsed);
            if (!parsed.sql || !Array.isArray(parsed.params)) {
                throw new Error('Translator returned invalid JSON fields from fallback regex');
            }
            return parsed;
          } catch (fallbackParseError) {
             console.error("All parsing attempts failed.", fallbackParseError);
             throw new Error("Could not parse JSON from LLM response after all attempts.");
          }
      }
      
      // If no JSON is found by any method, throw the final error.
      throw new Error("Could not find any valid JSON in the LLM response.");
    }

  } catch (error) {
    // Re-throw the error to be handled by the calling function.
    console.error("An error occurred in translateNLToSQL:", error);
    throw error;
  }
}

module.exports = { translateNLToSQL };

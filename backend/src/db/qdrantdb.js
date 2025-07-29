const { QdrantClient } = require('@qdrant/js-client-rest');

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URI,
  apiKey: process.env.QDRANT_API_KEY,
});

module.exports = { qdrantClient };
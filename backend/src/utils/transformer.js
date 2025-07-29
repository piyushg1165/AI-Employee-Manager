// loadTransformer.js (CommonJS compatible)

let extractor = null;

async function loadEmbeddingModel() {
  if (!extractor) {
    const { pipeline } = await import('@xenova/transformers');
    extractor = await pipeline('feature-extraction', 'Xenova/bge-base-en-v1.5');
  }
  return extractor;
}

async function getEmbedding(text) {
  const model = await loadEmbeddingModel();

  // BGE models require this prefix for semantic search
  const input = `Represent this sentence for semantic search: ${text}`;

  const output = await model(input, { pooling: 'mean', normalize: true });
  return Array.from(output);
}

module.exports = { getEmbedding };
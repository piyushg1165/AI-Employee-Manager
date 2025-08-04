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
  try {
    const model = await loadEmbeddingModel();
    const input = `Represent this sentence for semantic search: ${text}`;
    const output = await model(input, { pooling: 'mean', normalize: true });
    const arr = Array.from(output);
    return arr;
  } catch (err) {
    console.error('Error in getEmbedding:', err);
    return undefined;
  }
}

module.exports = { getEmbedding };
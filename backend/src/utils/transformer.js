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
    const output = await model(input, {
      pooling: 'mean',
      normalize: true
    });

    const embedding = Array.isArray(output[0]) ? Array.from(output[0]) : Array.from(output);


    return embedding;
  } catch (err) {
    console.error('❌ Error generating embedding:', err);
    return undefined;
  }
}

module.exports = { getEmbedding };

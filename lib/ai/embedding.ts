import { embedMany } from 'ai';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const embeddingModel = 'text-embedding-ada-002';

const generateChunks = (input: string): string[] => {
  // Split by sentences and filter out empty chunks
  return input
    .trim()
    .split('.')
    .map(chunk => chunk.trim())
    .filter(chunk => chunk.length > 0);
};

export const generateEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);
  
  const embeddings = await Promise.all(
    chunks.map(async (chunk) => {
      const response = await openai.embeddings.create({
        model: embeddingModel,
        input: chunk,
      });
      return response.data[0].embedding;
    })
  );

  return chunks.map((content, i) => ({
    content,
    embedding: embeddings[i],
  }));
}; 
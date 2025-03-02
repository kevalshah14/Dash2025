'use server';

import { generateText, Message } from 'ai';
import { cookies } from 'next/headers';

import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
} from '@/lib/db/queries';
import { document, documentChunk } from '@/lib/db/schema';
import db from '@/lib/db/queries';
import { VisibilityType } from '@/components/visibility-selector';
import { myProvider } from '@/lib/ai/models';
import { createDocument } from '@/lib/ai/tools/create-document';
import { auth } from '../(auth)/auth';
import { openai } from '@ai-sdk/openai';
import OpenAI from 'openai';

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('chat-model', model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: Message;
}) {
  const { text: title } = await generateText({
    model: myProvider.languageModel('title-model'),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}

async function chunkText(text: string) {
  // Use regex with 's' flag to properly handle newlines and whitespace
  const regex = new RegExp('.{1,1000}', 'gs');
  const chunks = text.match(regex);

  // Process chunks to preserve formatting and handle edge cases
  return chunks?.map(chunk => {
    // Trim whitespace but preserve newlines within chunk
    const trimmed = chunk.replace(/^\s+|\s+$/g, '');
    
    // Ensure we don't split in middle of words
    const lastSpace = trimmed.lastIndexOf(' ');
    if (lastSpace > 0 && lastSpace < trimmed.length - 1) {
      return trimmed.substring(0, lastSpace);
    }
    return trimmed;
  }).filter(chunk => chunk.length > 0) ?? [];
}
export async function addDocument({ type, content }: { type: 'url' | 'text', content: string }) {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  let processedContent = content;
  let title = 'User uploaded document';

  if (type === 'url') {
    try {
      // Fetch content using r.jina.ai API
      const jinaResponse = await fetch(`https://r.jina.ai/${content}`);
      if (!jinaResponse.ok) {
        throw new Error('Failed to fetch URL content');
      }
      const jinaData = await jinaResponse.text();
      
      // Extract content and title from Jina response
      processedContent = jinaData;
      title =  'Web Document';

      if (!processedContent) {
        throw new Error('No content extracted from URL');
      }
    } catch (err) {
      const error = err as Error;
      throw new Error(`Failed to process URL: ${error.message}`);
    }
  }

  // Create document record
  const doc = await db.insert(document).values({
    title,
    kind: 'text', // Always store as text since we've processed the URL content
    content: processedContent,
    userId: session.user.id!,
    createdAt: new Date(),
  }).returning();

  const documentId = doc[0].id;

  // Split content into chunks
  const chunks = await chunkText(processedContent);

  // Generate embeddings for chunks
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Process chunks in batches to avoid rate limits
  const batchSize = 100;
  const chunkedChunks = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batchChunks = chunks.slice(i, i + batchSize);
    
    const embeddings = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: batchChunks,
      dimensions: 1536,
    });

    const batchChunkedChunks = batchChunks.map((chunk, index) => ({
      documentId,
      content: chunk,
      chunkVector: embeddings.data[index].embedding,
    }));

    chunkedChunks.push(...batchChunkedChunks);
  }

  // Save chunks with embeddings
  if (chunkedChunks.length > 0) {
    await db.insert(documentChunk).values(chunkedChunks);
  }

  return documentId;
}
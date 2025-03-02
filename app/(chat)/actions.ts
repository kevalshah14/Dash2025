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
  const chunks = text.match(/.{1,1000}/g);
  return chunks?.map((chunk) => chunk.trim()) ?? [];
}

export async function addDocument({ type, content }: { type: 'url' | 'text', content: string }) {
  // step 1. check if it's a URL or text

  // step 2: if it's a url, run it through something like this https://r.jina.ai/https://dhravya.dev

  // now that we have text, we can add it in the database
  // and we can chunk it into 1000 character chunks
  // and we can embed it using openai
  // and we can save the embedding to the database (documentChunk table)
  // and we can return the document id to the client

  const session = await auth();

  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const doc = await db.insert(document).values({
    title: 'User uploaded document',
    kind: 'text',
    content,
    userId: session.user.id!,
    createdAt: new Date(),
  }).returning()

  const documentId = doc[0].id;

  const chunks = await chunkText(content);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const embeddings = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: chunks,
  });

  const chunkedChunks = chunks.map((chunk, index) => ({
    documentId,
    content: chunk,
    chunkVector: embeddings.data[index].embedding,
  }));

  await db.insert(documentChunk).values(chunkedChunks);

  return documentId;
}
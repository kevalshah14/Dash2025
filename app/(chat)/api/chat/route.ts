import {
  type Message,
  createDataStreamResponse,
  generateObject,
  generateText,
  smoothStream,
  streamText,
} from 'ai';
import OpenAI from 'openai';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';

import { auth } from '@/app/(auth)/auth';
import { myProvider } from '@/lib/ai/models';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';
import db from '@/lib/db/queries';
import { documentChunk } from '@/lib/db/schema';

import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { z } from 'zod';

export const maxDuration = 60;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const {
    id,
    messages,
    selectedChatModel,
  }: { id: string; messages: Array<Message>; selectedChatModel: string } =
    await request.json();

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userMessage = getMostRecentUserMessage(messages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  const chat = await getChatById({ id });

  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    await saveChat({ id, userId: session.user.id, title });
  }

  await saveMessages({
    messages: [{ ...userMessage, createdAt: new Date(), chatId: id, sources: [], factCheck: [], confidence: null, perspectiveReasoning: null }],
  });

  // Generate embedding for the query
  const queryEmbedding = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: userMessage.content,
    dimensions: 1536,
  });

  // Search for similar chunks using cosine similarity
  const similarity = sql<number>`1 - (${cosineDistance(documentChunk.chunkVector, queryEmbedding.data[0].embedding)})`;
  const similarChunks = await db
    .select({
      sourceId: documentChunk.id,
      documentId: documentChunk.documentId,
      content: documentChunk.content,
      similarity
    })
    .from(documentChunk)
    .where(gt(similarity, 0.55))
    .orderBy(desc(similarity))
    .limit(10);

  const latestMessageId = userMessage.id;

  return createDataStreamResponse({
    execute: async (dataStream) => {
      // Send search results to frontend
      dataStream.writeData({
        messageId: latestMessageId,
        type: 'search',
        results: JSON.stringify(similarChunks),
      });

      // Update frontend about starting perspective analysis
      dataStream.writeData({
        messageId: latestMessageId,
        type: 'status',
        message: 'Generating different perspectives...'
      });

      // Generate two radically different perspectives and resolve the promise
      const [criticPerspective, optimistPerspective] = await Promise.all([
        generateText({
          model: myProvider.languageModel(selectedChatModel),
          system: `You are a brutal critic. Here's your context: ${JSON.stringify(similarChunks)}. DESTROY every argument. EXPOSE every flaw. Be MERCILESS but use FACTS. Every single statement needs a citation [text](#chunk-id). If you smell bullshit, call it out. Your citations must be precise - down to individual words. NO MERCY.`,
          messages,
          maxSteps: 5,
          temperature: 0.8,
        }).then((res) => res.text),

        generateText({
          model: myProvider.languageModel(selectedChatModel), 
          system: `You are a wild optimist. Here's your context: ${JSON.stringify(similarChunks)}. DREAM BIG. Find the GOLD in everything. Connect unexpected dots. Get EXCITED about possibilities. But ground EVERYTHING in citations [text](#chunk-id). Your enthusiasm must be backed by evidence. Cite precisely - even single words. GO NUTS with ideas but PROVE IT ALL.`,
          messages,
          maxSteps: 5,
          temperature: 1.0,
        }).then((res) => res.text)
      ]);

      // Send perspectives to frontend
      dataStream.writeData({
        messageId: latestMessageId,
        type: 'perspectives',
        critic: criticPerspective,
        optimist: optimistPerspective
      });

      dataStream.writeData({
        messageId: latestMessageId,
        type: 'status',
        message: 'Analyzing perspectives...'
      });

      const perspectiveChoice = await generateObject({
        model: myProvider.languageModel(selectedChatModel),
        schema: z.object({
          model: z.enum(['critic', 'optimist']),
          confidence: z.number().min(0).max(1),
          reasoning: z.string(),
        }),
        messages: [{ role: 'user', content: `Given these two perspectives, analyze which is more likely to be true and explain why:\n\nCritic: ${criticPerspective}\n\nOptimist: ${optimistPerspective}\n\nProvide:\n1. Your choice (critic/optimist)\n2. Confidence score (0-1)\n3. Detailed reasoning` }],
      });

      const chosenPerspective = {
        text: perspectiveChoice.object.model === 'critic' ? criticPerspective : optimistPerspective,
        confidence: perspectiveChoice.object.confidence,
        reasoning: perspectiveChoice.object.reasoning
      };

      // Send choice analysis to frontend
      dataStream.writeData({
        messageId: latestMessageId,
        type: 'perspective_analysis',
        choice: perspectiveChoice.object.model,
        confidence: perspectiveChoice.object.confidence,
        reasoning: perspectiveChoice.object.reasoning
      });

      dataStream.writeData({
        messageId: latestMessageId,
        type: 'status',
        message: 'Fact checking response...'
      });

      // Add fact-checking step
      const factCheck = await generateText({
        model: myProvider.languageModel(selectedChatModel),
        system: `You are a meticulous fact-checker. Review this response and verify each claim against the provided sources. Flag any unsupported statements. Your output should be a JSON array of {claim: string, supported: boolean, evidence: string}`,
        messages: [{ role: 'user', content: chosenPerspective.text }],
      });

      // Send fact check results to frontend
      dataStream.writeData({
        messageId: latestMessageId,
        type: 'fact_check',
        results: JSON.stringify(factCheck)
      });

      const result = streamText({
        model: myProvider.languageModel(selectedChatModel),
        system: systemPrompt({ selectedChatModel }) + `\n\n\nUse the following context to help answer questions:\n${JSON.stringify(similarChunks)}. For every single thing you say, you must inline cite the source. Do inline citation using: [text related to chunk](#chunk-id). REMEMBER THIS. INLINE CITE EVERYTHING. REMEMBER TO USE #CHUNKDID. BE very granular with the citations. like, word or phrase level.\n\nFact check results: ${factCheck}\n\nConfidence in perspective: ${chosenPerspective.confidence}\nReasoning: ${chosenPerspective.reasoning}`,
        messages,
        maxSteps: 5,
        experimental_activeTools:
          selectedChatModel === 'chat-model-reasoning'
            ? []
            : [
                'getWeather',
                'createDocument',
                'updateDocument',
                'requestSuggestions',
              ],
        experimental_transform: smoothStream({ chunking: 'word' }),
        experimental_generateMessageId: generateUUID,
        tools: {
          getWeather,
          createDocument: createDocument({ session, dataStream }),
          updateDocument: updateDocument({ session, dataStream }),
          requestSuggestions: requestSuggestions({
            session,
            dataStream,
          }),
        },
        onFinish: async ({ response, reasoning }) => {
          if (session.user?.id) {
            try {
              const sanitizedResponseMessages = sanitizeResponseMessages({
                messages: response.messages,
                reasoning,
              });

              await saveMessages({
                messages: sanitizedResponseMessages.map((message) => ({
                  id: message.id,
                  chatId: id,
                  role: message.role,
                  content: message.content,
                  createdAt: new Date(),
                  sources: similarChunks,
                  factCheck: factCheck,
                  confidence: chosenPerspective.confidence,
                  perspectiveReasoning: chosenPerspective.reasoning
                })),
              });
            } catch (error) {
              console.error('Failed to save chat');
            }
          }
        },
        experimental_telemetry: {
          isEnabled: true,
          functionId: 'stream-text',
        },
      });

      result.consumeStream();

      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true
      });
    },
    onError: () => {
      return 'Oops, an error occured!';
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}

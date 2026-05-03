import OpenAI from 'openai';
import { BUFFETT_SYSTEM_PROMPT } from '../../../lib/buffettPrompt';

export const runtime = 'edge';

export async function POST(req) {
  const { messages } = await req.json();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'tp-cb2mf19u2cctrwxzdtgr1r7lybg1fhtgbg5483l96gr82iyb',
    baseURL: process.env.OPENAI_BASE_URL || 'https://token-plan-cn.xiaomimimo.com/v1',
  });

  const systemMessage = {
    role: 'system',
    content: BUFFETT_SYSTEM_PROMPT,
  };

  const response = await openai.chat.completions.create({
    model: 'mimo-v2.5-pro',
    messages: [systemMessage, ...messages],
    temperature: 0.7,
    max_tokens: 2048,
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (err) {
        console.error('Stream error:', err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

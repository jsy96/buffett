import OpenAI from 'openai';
import { BUFFETT_SYSTEM_PROMPT } from '../../../lib/buffettPrompt';

export const runtime = 'edge';

const SEARCH_TRIGGER_PHRASES = [
  '让我先查一下',
  '我需要搜索',
  '让我搜索一下',
  '让我查一下最新',
  '我需要查一下',
  '让我研究一下',
  '查一下最新',
  '最新的情况',
  '目前的市场',
];

async function searchWithTavily(query) {
  const tavilyApiKey = process.env.TAVILY_API_KEY;

  if (!tavilyApiKey) {
    return null;
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: tavilyApiKey,
        query: query,
        search_depth: 'basic',
        max_results: 3,
      }),
    });

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Tavily search error:', error);
    return null;
  }
}

function needsSearch(content) {
  for (const phrase of SEARCH_TRIGGER_PHRASES) {
    if (content.includes(phrase)) {
      return true;
    }
  }
  return false;
}

export async function POST(req) {
  const { messages } = await req.json();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
  });

  const systemMessage = {
    role: 'system',
    content: BUFFETT_SYSTEM_PROMPT,
  };

  const allMessages = [systemMessage, ...messages];

  // First call to check if search is needed
  const firstResponse = await openai.chat.completions.create({
    model: 'mimo-v2.5-pro',
    messages: allMessages,
    temperature: 0.7,
    max_tokens: 500,
  });

  const firstContent = firstResponse.choices[0].message.content;
  const shouldSearch = needsSearch(firstContent);

  let finalMessages = allMessages;
  let searchPerformed = false;

  // If search is triggered, perform search and continue
  if (shouldSearch) {
    // Extract the actual search query from the user's last message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const queryToSearch = lastUserMessage ? lastUserMessage.content : '';

    const searchResults = await searchWithTavily(queryToSearch);

    if (searchResults && searchResults.length > 0) {
      searchPerformed = true;

      // Format search results
      const searchContext = searchResults.map((result, index) =>
        `[来源${index + 1}] ${result.title}\n${result.content}\n`
      ).join('\n');

      // Add the assistant's thought and search context
      finalMessages.push({
        role: 'assistant',
        content: firstContent
      });

      finalMessages.push({
        role: 'user',
        content: `以下是最新的搜索结果，请基于这些信息用巴菲特的风格继续回答：\n\n${searchContext}\n\n请基于以上信息回答问题，保持幽默和智慧。`
      });
    }
  }

  // Stream the final response
  const streamResponse = await openai.chat.completions.create({
    model: 'mimo-v2.5-pro',
    messages: finalMessages,
    temperature: 0.7,
    max_tokens: 2048,
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        // If search was performed, send a prefix message
        if (searchPerformed) {
          const prefix = encoder.encode('🔍 刚刚查阅了最新资料...\n\n');
          controller.enqueue(prefix);
        }

        for await (const chunk of streamResponse) {
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

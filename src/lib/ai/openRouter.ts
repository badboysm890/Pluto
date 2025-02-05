import { authService } from '../auth';
import { chatDB } from '../indexedDB';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatMetadata {
  chat_title: string;
  summary: string;
  keywords: string[];
}

export async function getOpenRouterResponse(
  messages: Message[],
  onStream?: (content: string) => void
): Promise<string> {
  try {
    const { data: { user } } = await authService.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get OpenRouter settings
    const settings = await chatDB.getInferenceSettings(user.id);
    if (!settings?.apiKey || settings.provider !== 'openrouter') {
      throw new Error('OpenRouter is not configured');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Pluto AI Platform',
      },
      body: JSON.stringify({
        model: "nvidia/llama-3.1-nemotron-70b-instruct:free",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: !!onStream,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error?.message || `OpenRouter API error: ${response.statusText}`
      );
    }

    // Handle streaming response
    if (onStream) {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (!reader) throw new Error('Stream reader not available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(5);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                fullResponse += content;
                onStream(content);
              }
            } catch (e) {
              console.error('Error parsing streaming response:', e);
            }
          }
        }
      }

      return fullResponse;
    }

    // Handle non-streaming response
    const data = await response.json();
    if (!data.choices || !data.choices.length || !data.choices[0].message?.content) {
      throw new Error('Invalid API response structure');
    }
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting OpenRouter response:', error);
    throw error;
  }
}

export async function getChatMetadata(content: string): Promise<ChatMetadata> {
  try {
    const { data: { user } } = await authService.getUser();
    if (!user) throw new Error('Not authenticated');

    // Retrieve inference settings for the current user
    const settings = await chatDB.getInferenceSettings(user.id);
    if (!settings?.apiKey || settings.provider !== 'openrouter') {
      throw new Error('OpenRouter is not configured');
    }

    // Call the OpenRouter API with structured output parameters
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Pluto AI Platform',
      },
      body: JSON.stringify({
        model: 'google/learnlm-1.5-pro-experimental:free',
        messages: [
          {
            role: 'user',
            content: `Generate metadata for this chat message: "${content}"`
          }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'chat_metadata',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                chat_title: {
                  type: 'string',
                  description: 'Title of the chat based on the conversation content',
                },
                summary: {
                  type: 'string',
                  description: 'A short summary of the chat',
                },
                keywords: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'List of key topics or terms mentioned in the chat',
                },
              },
              required: ['chat_title', 'summary', 'keywords'],
              // "additionalProperties" is omitted as it is not supported by the API.
            },
          },
        },
      }),
    });

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error?.message ||
        `OpenRouter API error: ${response.statusText}`
      );
    }

    // Parse the JSON response from the API
    const data = await response.json();

    // Ensure the expected structure exists
    if (
      !data.choices ||
      !Array.isArray(data.choices) ||
      data.choices.length === 0 ||
      !data.choices[0].message ||
      !data.choices[0].message.content
    ) {
      throw new Error('Invalid API response structure');
    }

    // Extract and parse the metadata JSON from the message content
    try {
      const metadata: ChatMetadata = JSON.parse(data.choices[0].message.content);
      return metadata;
    } catch (parseError) {
      throw new Error('Failed to parse metadata JSON');
    }
  } catch (error) {
    console.error('Error getting chat metadata:', error);
    // Return default metadata if any error occurs
    return {
      chat_title: 'New Chat',
      summary: 'Chat started',
      keywords: [],
    };
  }
}
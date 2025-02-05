import { chatDB } from '../indexedDB';
import { supabase } from '../supabase';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function getLMStudioResponse(messages: Message[]): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get LM Studio settings
    const settings = await chatDB.getInferenceSettings(user.id);
    if (!settings?.baseUrl || settings.provider !== 'lmstudio') {
      throw new Error('LM Studio is not configured');
    }

    const response = await fetch(`${settings.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-r1-distill-qwen-14b',
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`LM Studio API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting LM Studio response:', error);
    throw error;
  }
}
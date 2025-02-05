import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ChatMessage {
  id: string;
  chatId: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  userId: string;
  appType: string;
}

interface ChatHistory {
  id: string;
  userId: string;
  appType: string;
  title: string;
  timestamp: string;
  metadata?: {
    summary?: string;
    keywords?: string[];
  };
}

interface InferenceSettings {
  id: string;
  userId: string;
  provider: 'openai' | 'openrouter' | 'ollama' | null;
  apiKey?: string;
  baseUrl?: string;
  timestamp: string;
}

interface ChatDB extends DBSchema {
  'chat-history': {
    key: string;
    value: ChatHistory;
    indexes: {
      'by-user-app': [string, string];
      'by-timestamp': string;
    };
  };
  'chat-messages': {
    key: string;
    value: ChatMessage;
    indexes: {
      'by-chat': string;
      'by-timestamp': string;
    };
  };
  'inference-settings': {
    key: string;
    value: InferenceSettings;
    indexes: {
      'by-user': string;
    };
  };
}

class ChatDBService {
  private db: IDBPDatabase<ChatDB> | null = null;
  private dbName = 'pluto-chat-db';
  private version = 2;

  async initDB() {
    if (this.db) return this.db;

    this.db = await openDB<ChatDB>(this.dbName, this.version, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const historyStore = db.createObjectStore('chat-history', {
            keyPath: 'id',
          });
          historyStore.createIndex('by-user-app', ['userId', 'appType']);
          historyStore.createIndex('by-timestamp', 'timestamp');

          const messagesStore = db.createObjectStore('chat-messages', {
            keyPath: 'id',
          });
          messagesStore.createIndex('by-chat', 'chatId');
          messagesStore.createIndex('by-timestamp', 'timestamp');
        }

        if (oldVersion < 2) {
          const settingsStore = db.createObjectStore('inference-settings', {
            keyPath: 'id',
          });
          settingsStore.createIndex('by-user', 'userId');
        }
      },
    });

    return this.db;
  }

  async getChatHistory(userId: string, appType: string): Promise<ChatHistory[]> {
    const db = await this.initDB();
    return db.getAllFromIndex(
      'chat-history',
      'by-user-app',
      [userId, appType]
    );
  }

  async createChat(chat: Omit<ChatHistory, 'id' | 'timestamp'>): Promise<ChatHistory> {
    const db = await this.initDB();
    const newChat: ChatHistory = {
      ...chat,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    await db.add('chat-history', newChat);
    return newChat;
  }

  async updateChatTitle(chatId: string, title: string): Promise<void> {
    const db = await this.initDB();
    const chat = await db.get('chat-history', chatId);
    if (chat) {
      chat.title = title;
      await db.put('chat-history', chat);
    }
  }

  async updateChatMetadata(chatId: string, metadata: { summary: string; keywords: string[] }): Promise<void> {
    const db = await this.initDB();
    const chat = await db.get('chat-history', chatId);
    if (chat) {
      chat.metadata = metadata;
      await db.put('chat-history', chat);
    }
  }

  async deleteChat(chatId: string): Promise<void> {
    const db = await this.initDB();
    await db.delete('chat-history', chatId);
    
    // Delete all messages for this chat
    const messages = await db.getAllFromIndex('chat-messages', 'by-chat', chatId);
    const tx = db.transaction('chat-messages', 'readwrite');
    await Promise.all(messages.map(msg => tx.store.delete(msg.id)));
    await tx.done;
  }

  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    const db = await this.initDB();
    const messages = await db.getAllFromIndex('chat-messages', 'by-chat', chatId);
    return messages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  async addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    const db = await this.initDB();
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    await db.add('chat-messages', newMessage);
    return newMessage;
  }

  async updateMessage(messageId: string, content: string): Promise<void> {
    const db = await this.initDB();
    const message = await db.get('chat-messages', messageId);
    if (message) {
      message.content = content;
      message.timestamp = new Date().toISOString();
      await db.put('chat-messages', message);
    }
  }

  async getInferenceSettings(userId: string): Promise<InferenceSettings | undefined> {
    const db = await this.initDB();
    const settings = await db.getAllFromIndex('inference-settings', 'by-user', userId);
    return settings[0];
  }

  async updateInferenceSettings(settings: Omit<InferenceSettings, 'id' | 'timestamp'>): Promise<InferenceSettings> {
    const db = await this.initDB();
    
    // Get existing settings
    const existing = await db.getAllFromIndex('inference-settings', 'by-user', settings.userId);
    
    const updatedSettings: InferenceSettings = {
      ...settings,
      id: existing[0]?.id || crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    await db.put('inference-settings', updatedSettings);
    return updatedSettings;
  }

  async clearProviderSettings(userId: string): Promise<void> {
    const db = await this.initDB();
    const settings = await db.getAllFromIndex('inference-settings', 'by-user', userId);
    if (settings[0]) {
      const clearedSettings: InferenceSettings = {
        ...settings[0],
        apiKey: '',
        baseUrl: '',
        timestamp: new Date().toISOString(),
      };
      await db.put('inference-settings', clearedSettings);
    }
  }
}

export const chatDB = new ChatDBService();
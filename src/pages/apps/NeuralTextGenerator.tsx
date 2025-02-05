import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatInput from '../../components/chat/ChatInput';
import ChatBubble from '../../components/chat/ChatBubble';
import { chatDB } from '../../lib/indexedDB';
import { Loader2 } from 'lucide-react';
import { authService } from '../../lib/auth';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

export default function NeuralTextGenerator() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const lastUserMessageRef = useRef<string>('');

  useEffect(() => {
    if (!chatId) {
      loadMostRecentChat();
    } else {
      loadMessages();
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const loadMostRecentChat = async () => {
    try {
      const { data: { user } } = await authService.getUser();
      if (!user) return;

      const history = await chatDB.getChatHistory(user.id, 'neural_text');
      if (history.length > 0) {
        navigate(`/apps/neural-text/${history[0].id}`);
      } else {
        const newChat = await chatDB.createChat({
          userId: user.id,
          appType: 'neural_text',
          title: 'New Chat',
        });
        navigate(`/apps/neural-text/${newChat.id}`);
      }
    } catch (error) {
      console.error('Error loading recent chat:', error);
    }
  };

  const loadMessages = async () => {
    if (!chatId) return;
    
    setLoading(true);
    try {
      const messages = await chatDB.getChatMessages(chatId);
      setMessages(messages);
      // Store the last user message for potential regeneration
      const lastUserMessage = messages.filter(m => m.isUser).pop();
      if (lastUserMessage) {
        lastUserMessageRef.current = lastUserMessage.content;
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRegenerate = async () => {
    if (!chatId || !lastUserMessageRef.current || generating) return;

    try {
      const { data: { user } } = await authService.getUser();
      if (!user) return;

      // Start generating response
      setGenerating(true);

      // Get inference settings
      const settings = await chatDB.getInferenceSettings(user.id);
      if (!settings?.provider) {
        throw new Error('No AI provider configured. Please configure one in Settings.');
      }

      let botResponse = '';
      if (settings.provider === 'openrouter') {
        // Convert messages to OpenRouter format
        const chatMessages = messages
          .slice(0, -1) // Remove the last bot message
          .map(msg => ({
            role: msg.isUser ? 'user' : 'assistant' as const,
            content: msg.content,
          }));

        // Add system message for context
        chatMessages.unshift({
          role: 'system',
          content: 'You are a helpful AI assistant. Provide clear, accurate, and engaging responses.',
        });

        // Add the last user message
        chatMessages.push({
          role: 'user',
          content: lastUserMessageRef.current,
        });

        try {
          const { getOpenRouterResponse } = await import('../../lib/ai/openRouter');
          
          // Create a temporary message for streaming
          const tempMessage: Message = {
            id: 'streaming-' + Date.now(),
            content: '',
            isUser: false,
            timestamp: new Date().toISOString(),
          };
          setStreamingMessage(tempMessage);

          botResponse = await getOpenRouterResponse(chatMessages, (chunk) => {
            setStreamingMessage(prev => prev ? {
              ...prev,
              content: prev.content + chunk,
            } : null);
          });
        } catch (error) {
          console.error('OpenRouter error:', error);
          botResponse = 'Sorry, there was an error communicating with OpenRouter. Please check your settings and try again.';
        }
      } else {
        botResponse = 'Please configure OpenRouter in the settings to use this feature.';
      }

      // Update the last bot message with the new response
      const lastMessage = messages[messages.length - 1];
      const updatedMessage = {
        ...lastMessage,
        content: botResponse,
        timestamp: new Date().toISOString(),
      };

      // Update the message in the database
      await chatDB.updateMessage(lastMessage.id, botResponse);

      // Update the messages state
      setMessages(prev => [...prev.slice(0, -1), updatedMessage]);
      setStreamingMessage(null);
    } catch (error) {
      console.error('Error regenerating response:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSendMessage = async (content: string, useStreaming?: boolean) => {
    if (!chatId) return;

    try {
      const { data: { user } } = await authService.getUser();
      if (!user) return;

      // Store the user message for potential regeneration
      lastUserMessageRef.current = content;

      // Get inference settings
      const settings = await chatDB.getInferenceSettings(user.id);
      if (!settings?.provider) {
        throw new Error('No AI provider configured. Please configure one in Settings.');
      }

      // Add user message
      const userMessage = await chatDB.addMessage({
        chatId,
        content,
        isUser: true,
        userId: user.id,
        appType: 'neural_text'
      });
      setMessages(prev => [...prev, userMessage]);

      // Start generating response
      setGenerating(true);

      let botResponse = '';
      if (settings.provider === 'openrouter') {
        // Get chat metadata for the first message
        if (messages.length === 0) {
          try {
            const { getChatMetadata } = await import('../../lib/ai/openRouter');
            const metadata = await getChatMetadata(content);
            await chatDB.updateChatMetadata(chatId, {
              summary: metadata.summary,
              keywords: metadata.keywords,
            });
          } catch (error) {
            console.error('Error updating chat metadata:', error);
          }
        }

        // Convert messages to OpenRouter format
        const chatMessages = messages.map(msg => ({
          role: msg.isUser ? 'user' : 'assistant' as const,
          content: msg.content,
        }));

        // Add system message for context
        chatMessages.unshift({
          role: 'system',
          content: 'You are a helpful AI assistant. Provide clear, accurate, and engaging responses.',
        });

        // Add current message
        chatMessages.push({
          role: 'user',
          content,
        });

        // Get response from OpenRouter
        try {
          const { getOpenRouterResponse } = await import('../../lib/ai/openRouter');

          if (useStreaming) {
            // Create a temporary message for streaming
            const tempMessage: Message = {
              id: 'streaming-' + Date.now(),
              content: '',
              isUser: false,
              timestamp: new Date().toISOString(),
            };
            setStreamingMessage(tempMessage);

            botResponse = await getOpenRouterResponse(chatMessages, (chunk) => {
              setStreamingMessage(prev => prev ? {
                ...prev,
                content: prev.content + chunk,
              } : null);
            });
          } else {
            botResponse = await getOpenRouterResponse(chatMessages);
          }
        } catch (error) {
          console.error('OpenRouter error:', error);
          botResponse = 'Sorry, there was an error communicating with OpenRouter. Please check your settings and try again.';
        }
      } else {
        botResponse = 'Please configure OpenRouter in the settings to use this feature.';
      }
      
      // Add bot response
      const botMessage = await chatDB.addMessage({
        chatId,
        content: botResponse,
        isUser: false,
        userId: user.id,
        appType: 'neural_text'
      });

      setStreamingMessage(null);
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Layout>
      <div className="fixed inset-0 pt-16 pb-12">
        <div className="relative h-full">
          <ChatSidebar />
          
          <div className="absolute inset-0 left-16 flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto pb-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                </div>
              ) : (
                <div className="max-w-4xl mx-auto p-4 space-y-4">
                  {messages.map((message, index) => (
                    <ChatBubble
                      key={message.id}
                      message={message.content}
                      isUser={message.isUser}
                      timestamp={message.timestamp}
                      onReload={!message.isUser && index === messages.length - 1 ? handleRegenerate : undefined}
                      isLatest={index === messages.length - 1}
                    />
                  ))}
                  {streamingMessage && (
                    <ChatBubble
                      message={streamingMessage.content}
                      isUser={false}
                      timestamp={streamingMessage.timestamp}
                      isLatest={true}
                    />
                  )}
                  {generating && !streamingMessage && (
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating response...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            {chatId && (
              <div className="flex-shrink-0 z-50">
                <ChatInput
                  chatId={chatId}
                  onSendMessage={handleSendMessage}
                  disabled={generating}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
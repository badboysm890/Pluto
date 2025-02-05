import React, { useState } from 'react';
import { Send, Upload, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ChatInputProps {
  chatId: string;
  onSendMessage: (message: string, useStreaming?: boolean) => void;
  disabled?: boolean;
}

export default function ChatInput({ chatId, onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [streamingEnabled, setStreamingEnabled] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message, streamingEnabled);
      setMessage('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || disabled) return;

    setIsUploading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${chatId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat_attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('chat_attachments').getPublicUrl(filePath);

      onSendMessage(`[File: ${file.name}](${publicUrl})`);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center space-x-2">
          {/* Pill-shaped container for upload icon, streaming toggle and text input */}
          <div className="flex items-center flex-1 space-x-2 bg-white/10 rounded-full p-3 shadow-xl border border-white/20">
            {/* Upload Icon */}
            <label
              className={`flex items-center justify-center p-2 rounded-full cursor-pointer text-gray-300 hover:text-purple-400 hover:bg-white/10 transition-all duration-200 ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload className="h-5 w-5" />
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading || disabled}
              />
            </label>

            {/* Streaming Toggle (Bolt Icon) */}
            <button
              type="button"
              className={`flex items-center justify-center p-2 rounded-full transition-all duration-200 ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                streamingEnabled
                  ? 'text-purple-400 bg-white/10'
                  : 'text-gray-300 hover:text-purple-400 hover:bg-white/10'
              }`}
              disabled={disabled}
              onClick={() => setStreamingEnabled(!streamingEnabled)}
              title={streamingEnabled ? 'Chat Streaming enabled' : 'Chat Streaming disabled'}
            >
              <Zap className="h-5 w-5" />
            </button>

            {/* Text Input Area */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={disabled ? 'Please wait...' : 'Type your message...'}
              className={`flex-1 px-4 py-2 bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none border-none ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={disabled}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              style={{
                minHeight: '24px',
                maxHeight: '120px',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
              }}
            />
          </div>

          {/* Send Button (kept separate) */}
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className={`flex items-center justify-center p-3 rounded-full transition-all duration-200 ${
              message.trim() && !disabled
                ? 'text-purple-400 hover:text-purple-300 hover:bg-white/10'
                : 'text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

import React, { useState } from 'react';
import { Bot, Server, Key, Save, Loader2 } from 'lucide-react';
import { chatDB } from '../../lib/indexedDB';
import { supabase } from '../../lib/supabase';

interface InferenceSettings {
  provider: 'openai' | 'openrouter' | 'ollama' | null;
  apiKey?: string;
  baseUrl?: string;
}

interface Props {
  settings: InferenceSettings;
  onUpdate: (settings: InferenceSettings) => void;
}

export default function InferenceSettings({ settings, onUpdate }: Props) {
  const [tempApiKey, setTempApiKey] = useState(settings.apiKey || '');
  const [tempBaseUrl, setTempBaseUrl] = useState(settings.baseUrl || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const updateInferenceSettings = async (updates: Partial<InferenceSettings>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (updates.provider && updates.provider !== settings.provider) {
        // Load existing settings for the new provider
        const existingSettings = await chatDB.getInferenceSettings(user.id);
        
        if (existingSettings?.provider === updates.provider) {
          // Restore saved credentials for this provider
          setTempApiKey(existingSettings.apiKey || '');
          setTempBaseUrl(existingSettings.baseUrl || '');
          onUpdate({
            ...settings,
            ...updates,
            apiKey: existingSettings.apiKey,
            baseUrl: existingSettings.baseUrl,
          });
        } else {
          // Clear credentials for new provider
          setTempApiKey('');
          setTempBaseUrl('');
          await chatDB.clearProviderSettings(user.id);
          onUpdate({
            ...settings,
            ...updates,
            apiKey: '',
            baseUrl: '',
          });
        }
      } else {
        onUpdate({ ...settings, ...updates });
      }
    } catch (err) {
      console.error('Error updating inference settings:', err);
      setError('Failed to update inference settings');
    }
  };

  const saveInferenceCredentials = async () => {
    setSaving(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updatedSettings = {
        ...settings,
        apiKey: tempApiKey,
        baseUrl: tempBaseUrl,
      };

      await chatDB.updateInferenceSettings({
        userId: user.id,
        ...updatedSettings,
      });

      onUpdate(updatedSettings);
      setSuccessMessage('Credentials saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving credentials:', err);
      setError('Failed to save credentials');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="backdrop-blur-lg bg-white/5 rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-semibold text-white mb-6">Inference Settings</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500 rounded-lg text-green-500">
          {successMessage}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            AI Provider
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['openai', 'openrouter', 'ollama'].map((provider) => (
              <button
                key={provider}
                onClick={() => updateInferenceSettings({ provider: provider as InferenceSettings['provider'] })}
                className={`flex items-center justify-center space-x-2 p-4 rounded-lg border ${
                  settings.provider === provider
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                {provider === 'openai' && <Bot className="h-5 w-5 text-purple-400" />}
                {provider === 'openrouter' && <Server className="h-5 w-5 text-purple-400" />}
                {provider === 'ollama' && <Bot className="h-5 w-5 text-purple-400" />}
                <span className="text-white capitalize">{provider}</span>
              </button>
            ))}
          </div>
        </div>

        {settings.provider && (
          <div className="space-y-4">
            {(settings.provider === 'openai' || settings.provider === 'openrouter') && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {settings.provider === 'openai' ? 'OpenAI API Key' : 'OpenRouter API Key'}
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="password"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    placeholder={`Enter your ${settings.provider === 'openai' ? 'OpenAI' : 'OpenRouter'} API key`}
                  />
                </div>
                {settings.provider === 'openrouter' && (
                  <p className="mt-2 text-sm text-gray-400">
                    Get your free API key at{' '}
                    <a 
                      href="https://openrouter.ai/keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300"
                    >
                      openrouter.ai/keys
                    </a>
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-400">
                  Your API key is stored locally and never leaves your browser
                </p>
              </div>
            )}

            {settings.provider === 'ollama' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Base URL
                </label>
                <div className="relative">
                  <Server className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    value={tempBaseUrl}
                    onChange={(e) => setTempBaseUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    placeholder="Enter the Ollama endpoint URL"
                  />
                </div>
              </div>
            )}

            <button
              onClick={saveInferenceCredentials}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              <span>{saving ? 'Saving...' : 'Save Credentials'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
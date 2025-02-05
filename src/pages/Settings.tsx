import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Bell, Eye, Moon, Globe, Shield, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { chatDB } from '../lib/indexedDB';
import InferenceSettings from '../components/settings/InferenceSettings';

interface UserSettings {
  notifications_enabled: boolean;
  dark_mode_enabled: boolean;
  profile_visibility: 'public' | 'private' | 'friends';
}

interface InferenceSettings {
  provider: 'openai' | 'lmstudio' | 'ollama' | null;
  apiKey?: string;
  baseUrl?: string;
}

const Settings = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [settings, setSettings] = useState<UserSettings>({
    notifications_enabled: true,
    dark_mode_enabled: darkMode,
    profile_visibility: 'public',
  });
  const [inferenceSettings, setInferenceSettings] = useState<InferenceSettings>({
    provider: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Load user settings from Supabase
      const { data: existingSettings, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingSettings) {
        setSettings({
          notifications_enabled: existingSettings.notifications_enabled,
          dark_mode_enabled: existingSettings.dark_mode_enabled,
          profile_visibility: existingSettings.profile_visibility,
        });
      }

      // Load inference settings from IndexedDB
      const inferenceConfig = await chatDB.getInferenceSettings(user.id);
      if (inferenceConfig) {
        setInferenceSettings({
          provider: inferenceConfig.provider,
          apiKey: inferenceConfig.apiKey,
          baseUrl: inferenceConfig.baseUrl,
        });
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Settings
          </h1>
          <p className="text-xl text-gray-400">
            Manage your account preferences and security
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          {/* Account Settings */}
          <div className="backdrop-blur-lg bg-white/5 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-6">Account Settings</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-purple-400" />
                  <div>
                    <h3 className="text-white font-medium">Notifications</h3>
                    <p className="text-sm text-gray-400">Receive updates and alerts</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications_enabled}
                    onChange={() => updateSetting('notifications_enabled', !settings.notifications_enabled)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Moon className="h-5 w-5 text-purple-400" />
                  <div>
                    <h3 className="text-white font-medium">Dark Mode</h3>
                    <p className="text-sm text-gray-400">Toggle dark theme</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.dark_mode_enabled}
                    onChange={() => updateSetting('dark_mode_enabled', !settings.dark_mode_enabled)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Inference Settings */}
          <InferenceSettings
            settings={inferenceSettings}
            onUpdate={setInferenceSettings}
          />

          {/* Security Settings */}
          <div className="backdrop-blur-lg bg-white/5 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-6">Security</h2>
            <div className="space-y-6">
              <button 
                className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
                onClick={() => {/* TODO: Implement password change */}}
              >
                <Eye className="h-5 w-5" />
                <span>Change Password</span>
              </button>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="backdrop-blur-lg bg-white/5 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-6">Privacy</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-purple-400" />
                <div>
                  <h3 className="text-white font-medium">Profile Visibility</h3>
                  <select
                    value={settings.profile_visibility}
                    onChange={(e) => updateSetting('profile_visibility', e.target.value as UserSettings['profile_visibility'])}
                    className="mt-1 block w-full rounded-md bg-gray-900/50 border border-gray-700 text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="friends">Friends Only</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-purple-400" />
                <div>
                  <h3 className="text-white font-medium">Data Usage</h3>
                  <p className="text-sm text-gray-400">
                    Control how your data is collected and used
                  </p>
                  <button className="mt-2 text-purple-400 hover:text-purple-300 text-sm">
                    View Privacy Policy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
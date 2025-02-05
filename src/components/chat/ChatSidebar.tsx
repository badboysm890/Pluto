import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, Edit2, Check, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { chatDB } from '../../lib/indexedDB';
import { MessageSquare, Brain, Sparkles, Lightbulb, Stars, Zap, Coffee, Palette, Feather, Cloud, Heart, Magnet as Magic } from 'lucide-react';

interface ChatHistory {
  id: string;
  title: string;
  timestamp: string;
  metadata?: {
    summary?: string;
    keywords?: string[];
  };
}

const chatIcons = [
  MessageSquare, Brain, Sparkles, Lightbulb, Stars, Zap,
  Coffee, Palette, Feather, Cloud, Heart, Magic
];

export default function ChatSidebar() {
  const [chats, setChats] = useState<ChatHistory[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const navigate = useNavigate();
  const { chatId } = useParams();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Store chat icons in a Map to keep them consistent
  const [chatIconsMap] = useState(() => new Map());

  useEffect(() => {
    loadChatHistory();

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsExpanded(false);
    };

    // Add click outside listener
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !event.composedPath().some(el => 
          el instanceof Element && el.classList.contains('sidebar-toggle')
        )
      ) {
        if (isMobile || event.clientX > 300) { // Only collapse if mobile or clicked outside expanded area
          setIsExpanded(false);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile]);

  // Get a random icon for a chat
  const getChatIcon = (chatId: string) => {
    if (!chatIconsMap.has(chatId)) {
      const randomIcon = chatIcons[Math.floor(Math.random() * chatIcons.length)];
      chatIconsMap.set(chatId, randomIcon);
    }
    return chatIconsMap.get(chatId);
  };

  const loadChatHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const history = await chatDB.getChatHistory(user.id, 'neural_text');
      setChats(history);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleChatClick = (chatId: string) => {
    navigate(`/apps/neural-text/${chatId}`);
    if (isMobile) setIsExpanded(false);
    // Focus the chat input
    const chatInput = document.querySelector<HTMLTextAreaElement>('textarea');
    if (chatInput) {
      chatInput.focus();
    }
  };

  return (
    <div 
      ref={sidebarRef}
      className={`fixed left-16 top-16 h-[calc(100vh-4rem)] backdrop-blur-xl bg-black/10 transition-all duration-300 ease-in-out z-30
        ${isExpanded ? 'w-72' : 'w-0 md:w-16'} 
        shadow-[0_0_15px_rgba(0,0,0,0.1)]
        ${isExpanded ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* New Chat Button */}
      <div className={`p-4 ${isExpanded ? '' : 'px-2'}`}>
        <button
          onClick={() => {
            const createChat = async () => {
              try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                const newChat = await chatDB.createChat({
                  userId: user.id,
                  appType: 'neural_text',
                  title: 'New Chat',
                });
                setChats([newChat, ...chats]);
                navigate(`/apps/neural-text/${newChat.id}`);
                if (isMobile) setIsExpanded(false);
              } catch (error) {
                console.error('Error creating chat:', error);
              }
            };
            createChat();
          }}
          className={`w-full flex items-center justify-center py-2.5 px-4 
            bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800
            rounded-lg text-white transition-all duration-200 shadow-lg hover:shadow-purple-500/25
            backdrop-blur-lg border border-white/10
            ${isExpanded ? 'space-x-2' : 'px-2'}`}
        >
          <Plus className="h-5 w-5 flex-shrink-0" />
          {isExpanded && <span>New Chat</span>}
        </button>
      </div>

      {/* Chat List */}
      <div className="overflow-y-auto h-[calc(100%-5rem)] px-2">
        {chats.map((chat) => {
          const ChatIcon = getChatIcon(chat.id);
          return (
            <div
              key={chat.id}
              onClick={() => handleChatClick(chat.id)}
              className={`group relative flex items-center p-3 my-1 rounded-lg cursor-pointer
                transition-all duration-200 hover:bg-white/5
                ${chatId === chat.id ? 'bg-white/10 shadow-lg' : ''}
                ${isExpanded ? 'mx-2' : 'mx-0 justify-center'}
              `}
              title={chat.metadata?.summary}
            >
              {isExpanded ? (
                <>
                  <ChatIcon className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0" />
                  {editingChatId === chat.id ? (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const saveTitle = async () => {
                          try {
                            await chatDB.updateChatTitle(chat.id, editingTitle);
                            setChats(chats.map(c => 
                              c.id === chat.id ? { ...c, title: editingTitle } : c
                            ));
                          } catch (error) {
                            console.error('Error updating title:', error);
                          } finally {
                            setEditingChatId(null);
                          }
                        };
                        saveTitle();
                      }} 
                      className="flex-1 flex items-center space-x-2"
                      onClick={e => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="flex-1 bg-black/30 border border-purple-500/30 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        autoFocus
                      />
                      <button type="submit" className="text-green-500 hover:text-green-400">
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingChatId(null)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </form>
                  ) : (
                    <>
                      <span className="text-gray-300 truncate flex-1">{chat.title}</span>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingChatId(chat.id);
                            setEditingTitle(chat.title);
                          }}
                          className="text-gray-500 hover:text-purple-400 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const deleteChat = async () => {
                              try {
                                await chatDB.deleteChat(chat.id);
                                setChats(chats.filter(c => c.id !== chat.id));
                                navigate('/apps/neural-text');
                              } catch (error) {
                                console.error('Error deleting chat:', error);
                              }
                            };
                            deleteChat();
                          }}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <ChatIcon className="h-5 w-5 text-purple-400" />
              )}
            </div>
          );
        })}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`sidebar-toggle absolute -right-4 top-1/2 transform -translate-y-1/2 
          bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800
          rounded-full p-1.5 text-white transition-all duration-200 z-40
          shadow-lg hover:shadow-purple-500/25 border border-white/10
          ${isMobile ? 'md:hidden' : ''}`}
      >
        {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
    </div>
  );
}
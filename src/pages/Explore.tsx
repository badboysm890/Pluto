import React from 'react';
import Layout from '../components/Layout';
import { Brain, Bot, Sparkles, Camera, Mic, PenTool, MessageSquare, Code2, Palette, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const aiApps = [
  {
    icon: Brain,
    title: 'Neural Text Generator',
    description: 'Advanced language model for creative writing and content generation',
    category: 'Language',
    path: '/apps/neural-text'
  },
  {
    icon: Camera,
    title: 'AI Image Creator',
    description: 'Transform text descriptions into stunning visual artwork',
    category: 'Image',
    path: '/apps/image-creator'
  },
  {
    icon: Mic,
    title: 'Voice Assistant',
    description: 'Natural language processing for voice commands and dictation',
    category: 'Audio',
    path: '/apps/voice-assistant'
  },
  {
    icon: PenTool,
    title: 'Design Assistant',
    description: 'AI-powered design suggestions and layout optimization',
    category: 'Design',
    path: '/apps/design-assistant'
  },
  {
    icon: MessageSquare,
    title: 'Chat Companion',
    description: 'Intelligent conversational AI for support and companionship',
    category: 'Chat',
    path: '/apps/chat-companion'
  },
  {
    icon: Code2,
    title: 'Code Generator',
    description: 'AI-assisted coding with smart suggestions and debugging',
    category: 'Development',
    path: '/apps/code-generator'
  },
  {
    icon: Palette,
    title: 'Style Transfer',
    description: 'Apply artistic styles to images using neural networks',
    category: 'Art',
    path: '/apps/style-transfer'
  },
  {
    icon: Music,
    title: 'Music Creator',
    description: 'Generate original music and melodies with AI',
    category: 'Music',
    path: '/apps/music-creator'
  },
  {
    icon: Bot,
    title: 'Task Automator',
    description: 'Automate repetitive tasks with AI workflows',
    category: 'Automation',
    path: '/apps/task-automator'
  },
  {
    icon: Sparkles,
    title: 'Content Enhancer',
    description: 'Improve and optimize content with AI suggestions',
    category: 'Content',
    path: '/apps/content-enhancer'
  },
];

const Explore = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Explore AI Apps
          </h1>
          <p className="text-xl text-gray-400">
            Discover our collection of powerful AI applications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiApps.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.title}
                onClick={() => navigate(app.path)}
                className="backdrop-blur-lg bg-white/5 rounded-xl p-6 border border-gray-800 hover:border-purple-500 transition-all hover:scale-[1.02] group cursor-pointer"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                    <Icon className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{app.title}</h3>
                    <p className="text-gray-400">{app.description}</p>
                    <span className="inline-block mt-3 text-sm px-3 py-1 rounded-full bg-purple-500/10 text-purple-400">
                      {app.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Explore;
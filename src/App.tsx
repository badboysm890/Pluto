import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import { Brain, Shield, Code, GraduationCap } from 'lucide-react';
import { supabase } from './lib/supabase';

function App() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check authentication status
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
      }
    });
  }, [navigate]);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Apps',
      description: 'Discover curated AI applications for every need',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data stays yours with our privacy-focused approach',
    },
    {
      icon: Code,
      title: 'Open Source',
      description: 'Transparent, community-driven development',
    },
    {
      icon: GraduationCap,
      title: 'Learn & Grow',
      description: 'Educational resources for AI development',
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Welcome to Pluto
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Your gateway to curated AI applications. Discover, learn, and build with privacy-focused, open-source AI tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="backdrop-blur-lg bg-white/5 rounded-xl p-6 border border-gray-800 hover:border-purple-500 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                <Icon className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-gray-400">{description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button className="px-8 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors">
            Explore AI Apps
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default App;
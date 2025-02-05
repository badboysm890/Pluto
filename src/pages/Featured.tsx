import React from 'react';
import Layout from '../components/Layout';
import { Star, TrendingUp, Award, Crown } from 'lucide-react';

const featuredApps = [
  {
    icon: Crown,
    title: 'AI Writing Assistant Pro',
    description: 'Professional-grade writing assistance powered by advanced AI',
    rating: 4.9,
    users: '50K+',
    featured: true,
  },
  {
    icon: TrendingUp,
    title: 'SmartAnalytics AI',
    description: 'Data analysis and visualization with artificial intelligence',
    rating: 4.8,
    users: '35K+',
    featured: true,
  },
  {
    icon: Award,
    title: 'AI Image Master',
    description: 'Create stunning artwork with state-of-the-art AI models',
    rating: 4.7,
    users: '45K+',
    featured: true,
  },
];

const Featured = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Featured Apps
          </h1>
          <p className="text-xl text-gray-400">
            Top-rated and most popular AI applications
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {featuredApps.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.title}
                className="backdrop-blur-lg bg-white/5 rounded-xl p-6 border border-purple-500/30 hover:border-purple-500 transition-all hover:scale-[1.02] group cursor-pointer"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                    <Icon className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">{app.title}</h3>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-gray-400">{app.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-400 mb-3">{app.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-400">{app.users} users</span>
                      <span className="inline-block text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-400">
                        Featured
                      </span>
                    </div>
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

export default Featured;
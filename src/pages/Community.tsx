import React from 'react';
import Layout from '../components/Layout';
import { Users, MessageSquare, Heart, Share2 } from 'lucide-react';

const posts = [
  {
    id: 1,
    author: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    title: 'Building Ethical AI Systems',
    content: 'Sharing my experience on implementing ethical guidelines in AI development...',
    likes: 234,
    comments: 45,
    timeAgo: '2 hours ago',
  },
  {
    id: 2,
    author: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    title: 'Advanced NLP Techniques',
    content: 'Here\'s a comprehensive guide on implementing state-of-the-art NLP models...',
    likes: 189,
    comments: 32,
    timeAgo: '4 hours ago',
  },
  {
    id: 3,
    author: 'Maria Kim',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    title: 'AI for Social Good',
    content: 'Exploring how we can use AI to address global challenges and make a positive impact...',
    likes: 312,
    comments: 67,
    timeAgo: '6 hours ago',
  },
];

const Community = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Community
          </h1>
          <p className="text-xl text-gray-400">
            Connect with AI developers and enthusiasts
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="backdrop-blur-lg bg-white/5 rounded-xl p-6 border border-gray-800 hover:border-purple-500 transition-all"
            >
              <div className="flex items-start space-x-4">
                <img
                  src={post.avatar}
                  alt={post.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{post.author}</h3>
                    <span className="text-sm text-gray-400">{post.timeAgo}</span>
                  </div>
                  <h4 className="text-lg font-medium text-purple-400 mb-2">{post.title}</h4>
                  <p className="text-gray-400 mb-4">{post.content}</p>
                  <div className="flex items-center space-x-6">
                    <button className="flex items-center space-x-2 text-gray-400 hover:text-purple-400">
                      <Heart className="h-5 w-5" />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-400 hover:text-purple-400">
                      <MessageSquare className="h-5 w-5" />
                      <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-400 hover:text-purple-400">
                      <Share2 className="h-5 w-5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Community;
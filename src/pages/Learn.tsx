import React from 'react';
import Layout from '../components/Layout';
import { BookOpen, Play, FileText, Users, Clock, Award } from 'lucide-react';

const courses = [
  {
    icon: BookOpen,
    title: 'AI Fundamentals',
    description: 'Learn the basics of artificial intelligence and machine learning',
    duration: '6 hours',
    level: 'Beginner',
  },
  {
    icon: FileText,
    title: 'Natural Language Processing',
    description: 'Master text analysis and language understanding with AI',
    duration: '8 hours',
    level: 'Intermediate',
  },
  {
    icon: Users,
    title: 'AI Ethics & Privacy',
    description: 'Understanding ethical considerations in AI development',
    duration: '4 hours',
    level: 'All Levels',
  },
];

const Learn = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Learn AI Development
          </h1>
          <p className="text-xl text-gray-400">
            Comprehensive courses to master AI technology
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {courses.map((course) => {
            const Icon = course.icon;
            return (
              <div
                key={course.title}
                className="backdrop-blur-lg bg-white/5 rounded-xl p-6 border border-gray-800 hover:border-purple-500 transition-all hover:scale-[1.02] group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
                <p className="text-gray-400 mb-4">{course.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-400">{course.duration}</span>
                  </div>
                  <span className="inline-block text-sm px-3 py-1 rounded-full bg-purple-500/10 text-purple-400">
                    {course.level}
                  </span>
                </div>
                <button className="mt-4 w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium flex items-center justify-center space-x-2 group">
                  <Play className="h-4 w-4" />
                  <span>Start Learning</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Learn;
import React from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const session = supabase.auth.getSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="backdrop-blur-lg bg-white/5 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">Welcome to Your Dashboard</h2>
            <p className="text-gray-400">Your personalized AI journey starts here.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
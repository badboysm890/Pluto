import React from 'react';
import { Github } from 'lucide-react';

const BottomBar = () => {
  return (
    <div className="fixed bottom-0 w-full backdrop-blur-md bg-black/30 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
        <div className="text-gray-400 text-sm">
          Made with ❤️ by Indian Dev
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default BottomBar;
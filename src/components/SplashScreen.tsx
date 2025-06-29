import React from 'react';
import { Zap } from 'lucide-react';

const SplashScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-orange-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="text-center z-10 animate-fade-in">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full animate-spin-slow opacity-20 w-40 h-40 mx-auto"></div>
          <div className="relative flex items-center justify-center">
            <div className="w-36 h-36 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 p-1 shadow-2xl">
              <div className="w-full h-full rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                <img 
                  src="/logo.png.png" 
                  alt="Battle Burn FF Challenge" 
                  className="w-32 h-32 object-contain animate-pulse"
                />
              </div>
            </div>
          </div>
        </div>
        
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent font-orbitron">
          BATTLE BURN FF
        </h1>
        
        <p className="text-xl text-gray-300 mb-8 animate-fade-in-delay">
          Ultimate Free Fire Tournament Platform
        </p>
        
        <div className="flex items-center justify-center space-x-2 text-orange-400 animate-bounce">
          <Zap className="w-5 h-5" />
          <span className="font-semibold">Loading...</span>
          <Zap className="w-5 h-5" />
        </div>
        
        <div className="mt-8 flex justify-center">
          <div className="w-64 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-orange-500 to-yellow-500 animate-loading-bar"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
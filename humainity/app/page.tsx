'use client';

import { useState } from 'react';
import GameScene from './components/Game/GameScene';

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [leaderName, setLeaderName] = useState('');
  const [inputValue, setInputValue] = useState('');

  const handleStart = () => {
    if (inputValue.trim()) {
      setLeaderName(inputValue.trim());
      setGameStarted(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStart();
    }
  };

  if (!gameStarted) {
    // 界面 A - 启动页（古典墨与铜配色）
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#f0f0e0] via-[#F2EEE5] to-[#e8e4d0] relative overflow-hidden">
        {/* 纸质纹理叠加 */}
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")'}}></div>
        
        {/* 装饰性古典边框元素 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-[#B08D55]/30 rotate-45"></div>
          <div className="absolute bottom-32 right-32 w-40 h-40 border-2 border-[#8C6B3D]/20 rotate-12"></div>
          <div className="absolute top-1/2 right-20 w-24 h-24 border-2 border-[#B08D55]/25 -rotate-45"></div>
          {/* 角落装饰 */}
          <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-[#8C6B3D]/40"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-[#8C6B3D]/40"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8 max-w-2xl mx-auto px-4">
          {/* 时代标签 */}
          <div className="inline-block mb-4 animate-pulse">
            <span className="py-2 px-6 border-y-2 border-stone-400/60 text-stone-600 text-xs font-bold tracking-[0.3em] uppercase font-serif">
              200 B.C. - The Reconstruction
            </span>
          </div>

          {/* 标题 */}
          <h1 className="text-7xl font-bold font-serif mb-4 tracking-tight">
            <span className="text-[#2B2B2B]">Hum</span>
            <span className="text-[#B08D55]">AI</span>
            <span className="text-[#2B2B2B]">nity</span>
          </h1>

          {/* 副标题 */}
          <p className="text-xl text-stone-600 mb-8 font-serif italic text-center border-l-2 border-[#B08D55]/40 pl-6">
            文明启程，从这里开始
          </p>

          {/* 输入框容器 */}
          <div className="flex flex-col items-center gap-6 w-full max-w-md px-4">
            {/* 输入框 */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="刻下文明的代号"
              className="w-full px-6 py-4 text-lg bg-white border-2 border-stone-300 
                       focus:outline-none focus:border-[#B08D55] focus:ring-2 focus:ring-[#B08D55]/20
                       placeholder:text-stone-400 transition-all duration-300
                       shadow-md font-serif text-[#2B2B2B]"
            />

            {/* 启动按钮 */}
            <button
              onClick={handleStart}
              className="w-full px-8 py-4 text-lg font-semibold text-[#F2EEE5] bg-[#8C6B3D]
                       shadow-lg hover:bg-[#B08D55]
                       hover:shadow-xl hover:scale-105
                       active:scale-95
                       transition-all duration-300
                       border-2 border-[#8C6B3D] hover:border-[#B08D55]
                       font-serif tracking-wider"
            >
              执行启动协议
            </button>
          </div>

          {/* 装饰文字 */}
          <div className="mt-12 text-sm text-stone-500 flex items-center gap-2 font-serif">
            <span className="inline-block w-2 h-2 bg-[#B08D55] rounded-full animate-pulse"></span>
            领袖殿堂，等待您的莅临
          </div>
        </div>
      </div>
    );
  }

  // 界面 B - 3D 场景（古典墨与铜配色）
  return (
    <div className="relative w-full h-screen" style={{ backgroundColor: '#f0f0e0' }}>
      {/* 纸质纹理叠加 */}
      <div className="absolute inset-0 opacity-15 pointer-events-none" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")'}}></div>

      {/* 3D 场景 */}
      <GameScene leaderName={leaderName} />
    </div>
  );
}

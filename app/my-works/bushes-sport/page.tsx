"use client";

import { useState } from "react";
import TamagochiScene from "./components/tamagochi";
import DancingScene from "./components/dancing";
import ClothScene from "./components/cloth"; // 🌟 引入新的布料场景

import { useProjectTracker } from "@/app/hooks/useProjectTracker";

export default function Page() {
  useProjectTracker('Bushes-Sport');

  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 🌟 场景总数变更为 3
  const totalScenes = 3;

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalScenes - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <main className="h-screen bg-[#eaeaea] overflow-hidden flex flex-col">
      
      {/* 1. 顶部导航栏 */}
      <div className="relative flex items-center justify-between px-12 w-full z-50 h-10 bg-[#C4C4C4] shrink-0">
        <span className="font-heading text-[#000000] tracking-[0.1em] leading-1 text-md uppercase">
          BUSHES SPORT-2022/
        </span>
        <button 
          onClick={() => {}}
          className="relative flex items-center justify-center px-2 py-1 rounded-full border border-[#a1a1a1] text-[11px] leading-none font-table font-black uppercase cursor-pointer bg-gradient-to-b from-[#eaeaea] via-[#e6e6e6] to-[#ababab] text-[#4a4a4a] [text-shadow:0_1px_0_rgba(255,255,255,0.8)] shadow-[inset_0_1px_0_rgba(255,255,255,1),0_1.5px_3px_rgba(0,0,0,0.5)] bg-transparent text-gray-950 transition-all ease-in-out duration-150 outline-none select-none hover:-translate-y-px hover:border-red-900/60 hover:from-red-100 hover:via-red-500 hover:to-red-700 hover:stops-[0%,50%,50%,100%] hover:bg-gradient-to-b hover:text-white hover:[text-shadow:0_-1px_0_rgba(0,0,0,0.5)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_8px_4px_-3px_white,inset_0_-3px_6px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.2)] active:translate-y-px active:scale-[0.98] active:from-red-800 active:to-red-600 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_1px_1px_rgba(0,0,0,0.1)]"
        >
          Back
        </button>
      </div>

      {/* 2. 主体区域 */}
      <div className="flex-1 relative w-full overflow-hidden">
        
        {currentIndex > 0 && (
          <button
            title="prev scene"
            onClick={handlePrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/40 hover:bg-white/80 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer text-gray-800 hover:scale-110 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

        {currentIndex < totalScenes - 1 && (
          <button
            title="next scene"
            onClick={handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/40 hover:bg-white/80 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer text-gray-800 hover:scale-110 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}

        {/* --- 🌟 核心修改区：3 个场景的滑动轨道 --- */}
        {/* 宽度设为 300% (3个场景)。移动距离改为计算 100/3，即 33.333% */}
        <div 
          className="w-[300%] h-full flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ transform: `translateX(-${currentIndex * 33.33333}%)` }}
        >
          
          {/* 场景 1: 拓麻歌子 (占据轨道的 1/3，即屏幕的 100%) */}
          <div className="w-1/3 h-full relative">
            <TamagochiScene />
          </div>
          
          {/* 场景 2: 跳舞小人 */}
          <div className="w-1/3 h-full relative">
            <DancingScene />
          </div>

          {/* 场景 3: 🌟 互动视频布料 */}
          <div className="w-1/3 h-full relative">
            <ClothScene />
          </div>

        </div>

      </div>
    </main>
  );
}
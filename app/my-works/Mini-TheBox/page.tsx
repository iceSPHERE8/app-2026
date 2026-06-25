"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import MediaCanvas, { MediaItem } from "@/app/components/MediaCanvas";

import { useProjectTracker } from "@/app/hooks/useProjectTracker";

export default function Page() {
  useProjectTracker('Bushes-Sport');
  
  const router = useRouter();
  const params = useParams(); 
  
  const projectId = "1780654876589";

  const [mediaData, setMediaData] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setIsLoading(false);
      return;
    }

    const fetchDetailMedia = async () => {
      try {
        const res = await fetch(`/api/admin/get-detail-media?projectId=${projectId}`);
        if (res.ok) {
          const data = await res.json();
          setMediaData(data);
        }
      } catch (error) {
        console.error("Failed to fetch detail media:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetailMedia();
  }, [projectId]);

  return (
    <main className="h-screen bg-[#eaeaea] overflow-hidden flex flex-col">
      
      {/* 1. 顶部导航栏 (修改文字颜色为浅灰色) */}
      <div className="relative flex items-center justify-between px-12 w-full mt-auto z-50 h-10
          bg-[#C4C4C4]">
        <span className="font-bold text-[#000000] tracking-wide leading-1 text-md uppercase">
          MINI THEBOX-2024/
        </span>
        <button 
          onClick={() => router.back()}
          className="/* 1. 核心外观：完全还原你最新发来的精致紧凑全圆角、单层细边框布局 */
    relative flex items-center justify-center
    px-2 py-1 rounded-full border border-[#a1a1a1]
    text-[11px] leading-none font-normal uppercase cursor-pointer
    bg-gradient-to-b from-[#eaeaea] via-[#e6e6e6] to-[#ababab] text-[#4a4a4a] [text-shadow:0_1px_0_rgba(255,255,255,0.8)] shadow-[inset_0_1px_0_rgba(255,255,255,1),0_1.5px_3px_rgba(0,0,0,0.5)]
    
    /* 2. 常态文字颜色与背景清透感 */
    bg-transparent text-gray-950
    
    /* 核心动画曲线：使用你指定的 ease-in-out duration-150 */
    transition-all ease-in-out duration-150 outline-none select-none
    
    /* === 交互状态：当鼠标悬停时，立刻优雅地注入早期 macOS 标志性的果冻红三维光影 === */
    hover:-translate-y-px
    hover:border-red-900/60
    hover:from-red-100 hover:via-red-500 hover:to-red-700 hover:stops-[0%,50%,50%,100%]
    hover:bg-gradient-to-b
    hover:text-white hover:[text-shadow:0_-1px_0_rgba(0,0,0,0.5)]
    hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_8px_4px_-3px_white,inset_0_-3px_6px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.2)]

    /* === 按下状态：实体按键按压反馈 === */
    active:translate-y-px active:scale-[0.98]
    active:from-red-800 active:to-red-600
    active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_1px_1px_rgba(0,0,0,0.1)]"
        >
          Back
        </button>
      </div>

      {/* 2. 主体区域容器 */}
      <div className="relative flex-1 w-full h-full">
        
        

        {/* 2.2 MediaCanvas 区域 (层级提升至 z-30，确保在 Z 轴最上方) */}
        <div className="absolute inset-0 w-full h-full z-30">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center font-normal tracking-wide text-[#a1a1a1]/50">
              LOADING ASSETS...
            </div>
          ) : (
            <MediaCanvas items={mediaData} vacuumRadius={320} />
          )}
        </div>

      </div>
    </main>
  );
}
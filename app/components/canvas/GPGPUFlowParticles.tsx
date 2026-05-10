'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import InnerFlowParticles from './InnerFlowParticles';

interface GPGPUFlowParticlesProps {
  count?: number;
}

const GPGPUFlowParticles: React.FC<GPGPUFlowParticlesProps> = ({
  count = 128,
}) => {
  const [textureUrls, setTextureUrls] = useState<string[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isTexturesReady, setIsTexturesReady] = useState(false);
  
  // 用于记录加载百分比
  const [loadProgress, setLoadProgress] = useState(0);

  // 1. 获取 API 数据
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`/api/admin/get-data?type=particle-config`);
        if (res.ok) {
          const data = await res.json();
          const urls = data.textures?.map((t: any) => t.url) || [];
          if (urls.length > 0) {
            setTextureUrls(urls);
            setIsDataLoaded(true);
          }
        }
      } catch (e) {
        console.error("Failed to load particle config", e);
      }
    };
    fetchConfig();
  }, []);

  // 2. 增强预加载逻辑：支持百分比计算
  useEffect(() => {
    if (!isDataLoaded || textureUrls.length === 0) return;

    let loadedCount = 0;
    const total = textureUrls.length;

    textureUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      
      const onImageLoad = () => {
        loadedCount++;
        // 计算并更新进度 (0 - 100)
        setLoadProgress(Math.round((loadedCount / total) * 100));
        
        if (loadedCount === total) {
          // 全部完成，轻微延迟后进入
          setTimeout(() => setIsTexturesReady(true), 400);
        }
      };

      img.onload = onImageLoad;
      img.onerror = onImageLoad; // 报错也计入进度，防止卡死
    });
  }, [isDataLoaded, textureUrls]);

  return (
    // 父容器必须有 inset-0 和 relative/absolute，以便 Loading 撑满
    <div className="w-full h-full absolute inset-0 z-1 bg-transparent overflow-hidden">
      
      {/* 统一的加载界面：仅撑满当前组件宽高 */}
      {!isTexturesReady && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-500">
          <div className="flex flex-col items-center gap-3">
            {/* 圆形进度或简单的百分比数字 */}
            <div className="relative flex items-center justify-center">
               <div className="w-12 h-12 border-2 border-white/10 border-t-white animate-spin rounded-full" />
               <span className="absolute text-[10px] text-white font-mono">
                 {loadProgress}%
               </span>
            </div>
            
            <p className="text-white text-[10px] tracking-[0.3em] opacity-70 uppercase">
              Loading Assets
            </p>
          </div>
        </div>
      )}

      {/* Canvas 渲染部分 */}
      {/* 只有在数据彻底准备好后才挂载，确保不会闪烁或消失 */}
      {isTexturesReady && (
        <Canvas
          camera={{ position: [0, 0, 25], fov: 45 }}
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance",
          }}
          dpr={[1, 2]}
        >
          <InnerFlowParticles 
            count={count} 
            textureUrls={textureUrls}
          />
        </Canvas>
      )}
    </div>
  );
};

export default GPGPUFlowParticles;
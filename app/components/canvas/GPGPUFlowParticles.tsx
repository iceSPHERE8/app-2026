'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import InnerFlowParticles from './InnerFlowParticles';

interface GPGPUFlowParticlesProps {
  count?: number;
}

const GPGPUFlowParticles: React.FC<GPGPUFlowParticlesProps> = ({
  count = 128, // 建议使用 2 的幂次方根，如 64x64=4096 或 128x128=16384
}) => {
  const [textureUrls, setTextureUrls] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  // 1. 在最外层获取配置，确保拿到 URL 后再渲染 Canvas 内部
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`/api/admin/get-data?type=particle-config`);
        if (res.ok) {
          const data = await res.json();
          // 这里的逻辑要和你 API 返回的结构对齐
          const urls = data.textures?.map((t: any) => t.url) || [];
          
          if (urls.length > 0) {
            setTextureUrls(urls);
            setIsReady(true);
          }
        }
      } catch (e) {
        console.error("Failed to load particle textures", e);
      }
    };
    fetchConfig();
  }, []);

  return (
    <div className="w-full h-full absolute inset-0 bg-transparent">
      <Canvas
        camera={{ position: [0, 0, 25], fov: 45 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance" 
        }}
        dpr={[1, 2]}
      >
        {/* 2. 使用 Suspense 包裹内部组件 */}
        {/* fallback 可以是空的，也可以是一个简单的 Loading 指示器 */}
        <Suspense fallback={<Loader />}>
          {isReady && (
            <InnerFlowParticles 
              count={count} 
              textureUrls={textureUrls}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};

// 一个简单的加载提示组件
function Loader() {
  return (
    <Html center>
      <div className="text-white text-xs tracking-widest opacity-50 uppercase">
        Loading Textures...
      </div>
    </Html>
  );
}

export default GPGPUFlowParticles;
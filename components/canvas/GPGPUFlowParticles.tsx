'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import InnerFlowParticles from './InnerFlowParticles';

interface GPGPUFlowParticlesProps {
  count?: number;
  imageFolder?: string;
}

const GPGPUFlowParticles: React.FC<GPGPUFlowParticlesProps> = ({
  count = 2500,                    // 适当增加数量
  imageFolder = '/images/display/',
}) => {
  return (
    <div className="w-full h-[720] absolute inset-0">   {/* 改成 absolute + inset-0 更占满 */}
      <Canvas
        camera={{ 
          position: [0, 0, 22],       // 拉远相机，让视野更大
          fov: 45,                    // 稍小一点 fov，画面更“广角”
          near: 0.1,
          far: 1000 
        }}
        gl={{ 
          antialias: true, 
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance"
        }}
        style={{ 
          background: 'transparent',
          width: '100%',
          height: '100%'
        }}
        dpr={[1, 2]}                  // 支持高分屏
      >
        <InnerFlowParticles 
          count={count} 
          imageFolder={imageFolder} 
        />
      </Canvas>
    </div>
  );
};

export default GPGPUFlowParticles;
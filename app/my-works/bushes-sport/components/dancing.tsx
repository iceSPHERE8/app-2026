'use client';

import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  useGLTF, 
  useAnimations, 
  OrbitControls, 
  Environment, 
  ContactShadows 
} from '@react-three/drei';
import * as THREE from 'three';

// 使用 %23 转义文件名中的 # 号，防止网络请求被截断
const MODEL_PATH = '/bushes-sport/swing_dance_man%232.glb';

// 预加载模型
useGLTF.preload(MODEL_PATH);

function DancingModel() {
  // 1. 创建一个 ref，用于包裹模型，useAnimations 需要它来绑定动画上下文
  const groupRef = useRef<THREE.Group>(null);
  
  // 2. 加载模型，提取场景 (scene) 和动画数据 (animations)
  const { scene, animations } = useGLTF(MODEL_PATH);
  
  // 3. 将动画数据和 group 绑定，提取可用的动作 (actions) 和动画名称列表 (names)
  const { actions, names } = useAnimations(animations, groupRef);

  useEffect(() => {
    // 4. 当模型和动画加载完成后，自动播放第一个动画
    if (names.length > 0) {
      const currentAction = actions[names[0]]; // 获取第一个动画动作
      if (currentAction) {
        // reset() 确保从头开始，fadeIn(0.5) 提供 0.5 秒的淡入过渡，play() 开始播放
        currentAction.reset().fadeIn(0.5).play();
      }
    }

    // 可选：组件卸载时停止动画
    return () => {
      if (names.length > 0 && actions[names[0]]) {
        actions[names[0]]?.fadeOut(0.5);
      }
    };
  }, [actions, names]);

  return (
    // 将 primitive 包裹在带有 ref 的 group 中，这是使用 useAnimations 的标准做法
    <group ref={groupRef} dispose={null}>
      <primitive 
        object={scene} 
        // 你可能需要根据模型的原始大小调整 scale 和 position
        scale={1} 
        position={[0, -1, 0]} 
      />
    </group>
  );
}

export default function DancingScene() {
  return (
    <div className="w-full h-full bg-transparent flex items-center justify-center relative">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        {/* 灯光设置 */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
        
        {/* 环境贴图，提供真实的反射光照 */}
        <Environment preset="city" />

        <Suspense fallback={null}>
          <DancingModel />
          {/* 添加底部阴影增强落地感 */}
          <ContactShadows position={[0, -1, 0]} opacity={0.5} scale={10} blur={2} far={4} />
        </Suspense>

        <OrbitControls 
          enablePan={false}
          enableZoom={false}
          minDistance={2} 
          maxDistance={10} 
          target={[0, 0, 0]} 
        />
      </Canvas>
    </div>
  );
}
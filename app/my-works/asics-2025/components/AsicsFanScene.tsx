"use client";

import React, { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
    useGLTF,
    OrbitControls,
    Stage,
    useAnimations, // 新增：用于解析和播放模型动画
    Center         // 新增：用于强制模型居中
} from "@react-three/drei";
import * as THREE from "three";

// 1. 定义模型组件
function FanModel() {
    const groupRef = useRef<THREE.Group>(null);
    
    // 注意这里我们不仅解构出了 scene，还解构出了 animations 数组
    const { scene, animations } = useGLTF("/asics-2025/fan.glb");
    
    // 将动画数据和外层 group 绑定
    const { actions, names } = useAnimations(animations, groupRef);

    // 在组件加载时，自动播放模型里的动画
    useEffect(() => {
        // 如果模型中包含至少一个动画片段 (Action)
        if (names.length > 0) {
            // names[0] 通常是模型默认的第一个动画名字
            const action = actions[names[0]];
            if (action) {
                action.reset().fadeIn(0.5).play();
            }
        }
    }, [actions, names]);

    // 逐帧更新：保留你的整体“悬浮微动”效果
    useFrame((state) => {
        if (groupRef.current) {
            const t = state.clock.getElapsedTime();
            // 注意：这里我去掉了 Math.PI / 2 的基础旋转，把它移到了下面的 primitive 里
            groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.08;
            groupRef.current.rotation.y = Math.cos(t * 0.4) * 0.08;
            groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.05;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Center 组件：无论内部怎么旋转，最终都会将它的几何中心强制居中到屏幕 */}
            <Center>
                <primitive 
                    object={scene} 
                    scale={1.5} 
                    // 将 90 度的翻转放在 primitive 上，Center 会在翻转后重新计算居中
                    rotation={[Math.PI / 2, 0.2, 0]} 
                />
            </Center>
        </group>
    );
}

// 2. 主场景组件 (保持不变)
const AsicsFanScene: React.FC = () => {
    return (
        <div className="w-full h-full min-h-[500px] bg-transparent">
            <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
                <ambientLight intensity={0.7} />
                <spotLight
                    position={[10, 10, 10]}
                    angle={0.15}
                    penumbra={1}
                />

                <Suspense fallback={null}>
                    <Stage
                        environment="city"
                        intensity={0.5}
                        shadows={false} 
                        adjustCamera={1}
                    >
                        <FanModel />
                    </Stage>
                </Suspense>

                <OrbitControls makeDefault enableZoom={true} />
            </Canvas>
        </div>
    );
};

useGLTF.preload("/asics-2025/fan.glb");

export default AsicsFanScene;
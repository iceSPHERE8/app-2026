"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useVideoTexture, Environment } from "@react-three/drei";
import * as THREE from "three";

// --- 🌟 进阶逼真 GPU 布料着色器 ---
const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;
  
  varying vec2 vUv;
  varying float vElevation;

  // 分形布朗运动 (FBM) 噪声，用于生成更真实、无规律的自然风力场
  float fbm(vec2 p, float t) {
      float f = 0.0;
      f += 0.5000 * sin(dot(p, vec2(1.5, 1.0)) + t);
      f += 0.2500 * sin(dot(p, vec2(2.5, 3.0)) - t * 1.2);
      f += 0.1250 * sin(dot(p, vec2(4.0, 5.0)) + t * 1.5);
      return f;
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    // 1. 物理约束：顶部固定
    // uv.y 的范围是 0(底部) 到 1(顶部)。
    // pinMap 表示活动权重：顶部权重为0(不动)，底部权重为1(随风飘动最大)
    float pinMap = 1.0 - uv.y; 

    // 2. 真实风力场模拟
    float wind = fbm(pos.xy * 2.0, uTime * 2.5) * 0.35;
    
    // Z轴：前后摆动 (受约束限制)
    pos.z += wind * pinMap;
    // Y轴：重力悬垂效果，底部布料因重力和飘动会产生轻微的下坠与褶皱收缩
    pos.y -= (pinMap * pinMap) * 0.15; 
    // X轴：风向导致轻微的横向拉扯
    pos.x += wind * pinMap * 0.1; 

    // 3. 鼠标交互排斥力
    float dist = distance(vUv, uMouse);
    // 缩小排斥半径，让受力点更集中
    float force = smoothstep(0.25, 0.0, dist); 
    float ripple = force * -0.6 * uHover;
    
    // 鼠标只能推开未被固定的部分
    pos.z += ripple * pinMap;

    // 将 Z 轴位移传递给片元着色器用于计算光影
    vElevation = pos.z;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    // 获取视频颜色
    vec4 texColor = texture2D(uTexture, vUv);
    
    // 逼真的物理布料褶皱阴影
    // 根据 Z 轴的高度差异，计算受光面和背光面
    float shadow = smoothstep(-0.15, 0.2, vElevation);
    
    // 基础亮度 0.75，加上光照变化，呈现丝滑的光泽感
    vec3 color = texColor.rgb * (0.75 + shadow * 0.4);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

function InteractiveCloth() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // 🌟 替换为你指定的视频资源
  const videoTexture = useVideoTexture("/bushes-sport/bushes-sports-b.mp4");

  useEffect(() => {
    if (videoTexture) {
      videoTexture.flipY = true;
      videoTexture.colorSpace = THREE.SRGBColorSpace;
    }
  }, [videoTexture]);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      const targetHover = isHovered ? 1.0 : 0.0;
      materialRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uHover.value, 
        targetHover, 
        10 * delta
      );
    }
  });

  const handlePointerMove = (e: any) => {
    if (materialRef.current && e.uv) {
      materialRef.current.uniforms.uMouse.value.set(e.uv.x, e.uv.y);
    }
  };

  return (
    <mesh 
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      onPointerMove={handlePointerMove}
      // 稍微倾斜一点角度，让下垂感更明显
      rotation={[0, 0, 0]} 
    >
      {/* 提高细分数到 128x128，使布料的高频褶皱和鼠标交互更加细腻 */}
      <planeGeometry args={[3, 4, 128, 128]} />
      
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.DoubleSide}
        uniforms={{
          uTime: { value: 0 },
          uTexture: { value: videoTexture },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uHover: { value: 0 }
        }}
      />
    </mesh>
  );
}

export default function ClothScene() {
  return (
    <div className="w-full h-full bg-transparent flex items-center justify-center relative">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1} />
        <Environment preset="city" />

        <InteractiveCloth />

        <OrbitControls 
          enablePan={false}
          enableZoom={false}
          enableRotate={false}
          minDistance={3} 
          maxDistance={12} 
        />
      </Canvas>
    </div>
  );
}
'use client';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useControls, folder } from 'leva';

// ==========================================
// 1. 底层网格 (Grid Layer) 着色器
// ==========================================
const GridVertexShader = `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uWaveFreq;
  uniform float uWaveAmp;
  uniform float uStretchAmp;
  
  attribute vec3 aOffset;
  
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vec3 pos = position;
    
    float time = uTime * uSpeed;
    
    // 基于 X 轴的波动
    float wave = sin(aOffset.x * uWaveFreq + time);
    
    // Y 轴缩放变形 (让细线伸缩)
    pos.y *= 1.0 + wave * uStretchAmp;
    
    vec3 offset = aOffset;
    // Y 轴整体上下位移
    offset.y += wave * uWaveAmp;

    vec4 worldPos = modelMatrix * instanceMatrix * vec4(pos + offset, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const GridFragmentShader = `
  uniform vec3 uColorGrid;
  uniform vec3 uColorDot;
  
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    // 绘制极细的中心线
    float lineDist = abs(vUv.x - 0.5);
    float line = smoothstep(0.05, 0.0, lineDist) * 0.3; // 线条较暗
    
    // 绘制上下两个顶点的粒子 (UV y=0 和 y=1 处)
    float dotTop = smoothstep(0.1, 0.05, length(vUv - vec2(0.5, 1.0)));
    float dotBottom = smoothstep(0.1, 0.05, length(vUv - vec2(0.5, 0.0)));
    float dots = max(dotTop, dotBottom);
    
    float alpha = max(line, dots);
    if (alpha < 0.01) discard;

    // 粒子高亮，线条偏暗
    vec3 finalColor = mix(uColorGrid, uColorDot, dots);
    
    // 随深度淡出
    float depthAlpha = smoothstep(-30.0, 10.0, vWorldPos.z);
    
    gl_FragColor = vec4(finalColor, alpha * depthAlpha);
  }
`;

// ==========================================
// 2. 上层几何体 (Block Layer) 着色器
// ==========================================
const BlockVertexShader = `
  uniform float uTime;
  uniform float uAnimSpeed;
  uniform float uAnimAmpX;
  uniform float uAnimAmpY;
  uniform float uDisplaceX;
  
  attribute vec3 aOffset;
  attribute vec4 aData; // x: seed, y: phaseX, z: phaseY, w: type
  attribute vec2 aScale;
  
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vSeed;
  varying float vType;

  void main() {
    vUv = uv;
    vSeed = aData.x;
    float phaseX = aData.y;
    float phaseY = aData.z;
    vType = aData.w;
    
    float time = uTime * uAnimSpeed;
    
    vec3 pos = position;
    pos.x *= aScale.x;
    pos.y *= aScale.y;
    
    vec3 offset = aOffset;
    
    // 连续区域的分组运动动画 (正弦波)
    offset.x += sin(time + phaseX) * uAnimAmpX;
    offset.y += cos(time * 0.8 + phaseY) * uAnimAmpY;
    
    // 额外的 X 轴绝对位移拉扯
    offset.x += sin(time * 0.5 + vSeed * 10.0) * uDisplaceX;

    vec4 worldPos = modelMatrix * instanceMatrix * vec4(pos + offset, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const BlockFragmentShader = `
  uniform vec3 uColorWhite;
  uniform vec3 uColorShadow;
  uniform vec3 uColorAccent;
  uniform float uDepthMin;
  uniform float uDepthMax;
  
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vSeed;
  varying float vType;

  void main() {
    // 四角粒子检测
    float dX = min(vUv.x, 1.0 - vUv.x);
    float dY = min(vUv.y, 1.0 - vUv.y);
    float cornerDist = length(vec2(dX, dY));
    float isCorner = smoothstep(0.08, 0.05, cornerDist); // 边角处生成粒子
    
    // === 基于深度的伪光影效果 (Ambient Occlusion & Shadow) ===
    // 归一化深度值: 1.0 = 最前方，0.0 = 最后方
    float depthNorm = clamp((vWorldPos.z - uDepthMin) / (uDepthMax - uDepthMin), 0.0, 1.0);
    
    // 加入一点位置噪点，让阴影不那么死板
    float noise = fract(sin(dot(vWorldPos.xy, vec2(12.9898, 78.233))) * 43758.5453) * 0.1;
    float shadowFactor = depthNorm - noise;
    
    // 基础颜色: 前面白，后面暗黑/深灰
    vec3 baseColor = mix(uColorShadow, uColorWhite, smoothstep(0.0, 1.0, shadowFactor));
    
    vec4 finalColor = vec4(0.0);
    
    if (vType == 0.0) {
      // 实体发光/亮色块 (偶发)
      if (isCorner > 0.5) {
        finalColor = vec4(uColorAccent, 1.0); // 顶点高亮
      } else {
        finalColor = vec4(baseColor, 1.0);
        // 中心偶尔镂空
        if(vSeed > 0.9 && (vUv.x > 0.1 && vUv.x < 0.9 && vUv.y > 0.1 && vUv.y < 0.9)) discard;
      }
    } 
    else if (vType == 1.0) {
      // 纯线框 / 点阵模式
      if (isCorner > 0.5) {
        finalColor = vec4(uColorWhite, 1.0);
      } else {
        discard;
      }
    }

    gl_FragColor = finalColor;
  }
`;

// ==========================================
// 3. React 组件实现
// ==========================================
const SymmetricalArt = () => {
  const gridMeshRef = useRef<THREE.InstancedMesh>(null);
  const blockMeshRef = useRef<THREE.InstancedMesh>(null);
  
  const gridMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const blockMaterialRef = useRef<THREE.ShaderMaterial>(null);

  // Leva 控制参数体系
  const controls = useControls({
    Animation: folder({
      globalSpeed: { value: 1.0, min: 0.0, max: 3.0 },
      blockWaveX: { value: 1.5, min: 0.0, max: 5.0 },
      blockWaveY: { value: 0.8, min: 0.0, max: 5.0 },
      blockDisplace: { value: 2.0, min: 0.0, max: 10.0 },
      gridWaveFreq: { value: 0.2, min: 0.0, max: 1.0 },
      gridWaveAmp: { value: 2.0, min: 0.0, max: 10.0 },
      gridStretch: { value: 1.5, min: 0.0, max: 5.0 },
    }),
    Structure: folder({
      spreadX: { value: 30.0, min: 10.0, max: 50.0 },
      spreadY: { value: 20.0, min: 10.0, max: 40.0 },
      depthZ: { value: 15.0, min: 5.0, max: 30.0 },
      gridDensity: { value: 1.5, min: 0.5, max: 3.0 },
      blockSize: { value: 1.2, min: 0.5, max: 3.0 },
    }),
    Colors: folder({
      colorWhite: '#ffffff',
      colorShadow: '#0a0d14', // 深邃的阴影色
      colorAccent: '#60e0ff', // 顶点粒子点缀色
      colorGrid: '#222233',
      colorGridDot: '#88aaff',
    })
  });

  // 生成 Grid 数据
  const gridData = useMemo(() => {
    const countX = 40;
    const countZ = 15;
    const count = countX * countZ * 2; // 上下对称不需要，因为线本身是贯穿的
    
    const offsets = new Float32Array(count * 3);
    let i = 0;
    
    for(let x = 0; x < countX; x++) {
      for(let z = 0; z < countZ; z++) {
        // 生成右半边
        let posX = (x + 0.5) * controls.gridDensity * 1.5;
        let posZ = -10.0 - z * controls.gridDensity * 2.0; // 放到后方
        
        // 右
        offsets.set([posX, 0, posZ], i * 3); i++;
        // 左镜像
        offsets.set([-posX, 0, posZ], i * 3); i++;
      }
    }
    return { count: i, offsets };
  }, [controls.gridDensity]);

  // 生成 Block 数据 (四向完全对称)
  const blockData = useMemo(() => {
    const quadrantCount = 2000; 
    const totalCount = quadrantCount * 4;
    
    const offsets = new Float32Array(totalCount * 3);
    const dataArray = new Float32Array(totalCount * 4);
    const scaleMap = new Float32Array(totalCount * 2);
    let i = 0;
    
    for (let j = 0; j < quadrantCount; j++) {
      // 仅在第一象限 (X>0, Y>0) 生成基础形状
      let x = Math.random() * controls.spreadX;
      let y = Math.random() * controls.spreadY;
      let z = (Math.random() - 0.5) * controls.depthZ;

      // 网格吸附，产生结构化模板感
      const snap = 1.2;
      x = Math.round(x / snap) * snap;
      y = Math.round(y / snap) * snap;

      // 分区域连贯运动的 Phase
      const phaseX = x * 0.2 + y * 0.1;
      const phaseY = y * 0.3;
      
      const seed = Math.random();
      const type = Math.random() > 0.4 ? 0.0 : 1.0; // 0: 实体面, 1: 仅顶点粒子

      // 长宽比例
      let sX = (Math.random() * 3.0 + 0.5) * controls.blockSize;
      let sY = (Math.random() * 1.5 + 0.5) * controls.blockSize;
      // 偶尔产生极端水平长条
      if (Math.random() > 0.85) {
        sX *= 4.0; sY *= 0.2;
      }

      // 四象限镜像克隆
      const quadrants = [
        [x, y], [-x, y], [x, -y], [-x, -y] // 右上, 左上, 右下, 左下
      ];

      quadrants.forEach(([qx, qy]) => {
        offsets.set([qx, qy, z], i * 3);
        dataArray.set([seed, phaseX, phaseY, type], i * 4);
        scaleMap.set([sX, sY], i * 2);
        i++;
      });
    }
    return { count: totalCount, offsets, dataArray, scaleMap };
  }, [controls.spreadX, controls.spreadY, controls.depthZ, controls.blockSize]);

  // Uniforms 管理
  const gridUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSpeed: { value: controls.globalSpeed },
    uWaveFreq: { value: controls.gridWaveFreq },
    uWaveAmp: { value: controls.gridWaveAmp },
    uStretchAmp: { value: controls.gridStretch },
    uColorGrid: { value: new THREE.Color(controls.colorGrid) },
    uColorDot: { value: new THREE.Color(controls.colorGridDot) },
  }), [controls]);

  const blockUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAnimSpeed: { value: controls.globalSpeed },
    uAnimAmpX: { value: controls.blockWaveX },
    uAnimAmpY: { value: controls.blockWaveY },
    uDisplaceX: { value: controls.blockDisplace },
    uColorWhite: { value: new THREE.Color(controls.colorWhite) },
    uColorShadow: { value: new THREE.Color(controls.colorShadow) },
    uColorAccent: { value: new THREE.Color(controls.colorAccent) },
    uDepthMin: { value: -controls.depthZ / 2 },
    uDepthMax: { value: controls.depthZ / 2 + 5.0 },
  }), [controls]);

  useFrame((state) => {
    if (gridMaterialRef.current) gridMaterialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    if (blockMaterialRef.current) blockMaterialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group>
      {/* 底层网格粒子层 */}
      <instancedMesh ref={gridMeshRef} args={[undefined, undefined, gridData.count]}>
        <planeGeometry args={[0.2, 10.0]}>
          <instancedBufferAttribute attach="attributes-aOffset" args={[gridData.offsets, 3]} />
        </planeGeometry>
        <shaderMaterial
          ref={gridMaterialRef}
          vertexShader={GridVertexShader}
          fragmentShader={GridFragmentShader}
          uniforms={gridUniforms}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>

      {/* 上层几何面板层 */}
      <instancedMesh ref={blockMeshRef} args={[undefined, undefined, blockData.count]}>
        <planeGeometry args={[1, 1]}>
          <instancedBufferAttribute attach="attributes-aOffset" args={[blockData.offsets, 3]} />
          <instancedBufferAttribute attach="attributes-aData" args={[blockData.dataArray, 4]} />
          <instancedBufferAttribute attach="attributes-aScale" args={[blockData.scaleMap, 2]} />
        </planeGeometry>
        <shaderMaterial
          ref={blockMaterialRef}
          vertexShader={BlockVertexShader}
          fragmentShader={BlockFragmentShader}
          uniforms={blockUniforms}
          transparent={false}
          alphaTest={0.5}
          depthWrite={true}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
    </group>
  );
};

export default function GenerativeArchitect() {
  return (
    <div className="w-full h-full absolute inset-0 bg-[#020204] overflow-hidden">
      <Canvas camera={{ position: [0, 0, 50], fov: 45 }}>
        <SymmetricalArt />
        <OrbitControls enableZoom={true} maxDistance={150} minDistance={10} />
      </Canvas>
    </div>
  );
}
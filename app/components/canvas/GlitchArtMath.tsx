'use client';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useControls, folder } from 'leva';

// ==========================================
// GLSL Simplex 3D Noise 核心算法库
// ==========================================
const noiseGLSL = `
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  float snoise(vec3 v){
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod(i, 289.0 );
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 1.0/7.0;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }
`;

// ==========================================
// 1. 底层网格 (Grid Layer) 
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
    float wave = sin(abs(aOffset.x) * uWaveFreq - time);
    pos.y *= 1.0 + wave * uStretchAmp;
    
    vec3 offset = aOffset;
    float signY = aOffset.y >= 0.0 ? 1.0 : -1.0;
    offset.y += wave * uWaveAmp * signY;

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
    float lineDist = abs(vUv.x - 0.5);
    float line = smoothstep(0.05, 0.0, lineDist) * 0.3;
    float dotTop = smoothstep(0.1, 0.05, length(vUv - vec2(0.5, 1.0)));
    float dotBottom = smoothstep(0.1, 0.05, length(vUv - vec2(0.5, 0.0)));
    float dots = max(dotTop, dotBottom);
    
    float alpha = max(line, dots);
    if (alpha < 0.01) discard;

    vec3 finalColor = mix(uColorGrid, uColorDot, dots);
    float depthAlpha = smoothstep(-30.0, 10.0, vWorldPos.z);
    gl_FragColor = vec4(finalColor, alpha * depthAlpha);
  }
`;

// ==========================================
// 2. 上层几何体 (Block Layer)
// ==========================================
const BlockVertexShader = `
  ${noiseGLSL} 

  uniform float uTime;
  uniform float uAnimSpeed;
  uniform float uAnimAmpX;
  uniform float uAnimAmpY;
  
  uniform float uScaleAnimSpeed;
  uniform float uScaleAnimAmp;
  
  uniform float uCornerDotSize;
  uniform float uCornerDistance;
  
  uniform float uRingCount;       
  uniform float uNoiseOffsetAmp;  
  
  uniform float uNoiseScale;
  uniform float uNoiseThreshold;
  uniform vec3  uNoiseOffset;
  uniform float uRingRadius;
  uniform float uRingWidth;
  uniform float uRingThreshold;
  
  uniform float uSmoothEdge;
  
  attribute vec3 aOffset;
  attribute vec4 aData;
  attribute vec2 aScale;
  
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vSeed;
  varying float vType;
  varying vec2 vFinalScale; 
  varying float vLayerType; 
  varying float vVisibility;
  
  varying vec3 vOffset;

  void main() {
    vUv = uv;
    vSeed = aData.x;
    float phaseX = aData.y;
    float phaseY = aData.z;
    vType = aData.w;
    
    vOffset = aOffset; 
    
    float time = uTime * uAnimSpeed;
    vec3 pos = position;
    
    vec3 symPos = abs(aOffset); 
    
    float n0 = snoise(symPos * uNoiseScale + time * 0.2); 
    float mask0 = smoothstep(uNoiseThreshold - uSmoothEdge, uNoiseThreshold + uSmoothEdge, n0); 
    
    float finalMask = mask0; 
    vLayerType = 1.0;
    
    float distToCenter = length(symPos.xy);
    
    for(int i = 1; i < 5; i++) {
        float fi = float(i);
        if (fi < uRingCount) {
            vec3 currentOffset = uNoiseOffset * (fi * uNoiseOffsetAmp);
            vec3 offsetPos = symPos + currentOffset;
            float n_i = snoise(offsetPos * uNoiseScale * (1.0 + fi * 0.1) - time * 0.15);
            
            float currentRadius = uRingRadius * fi; 
            float ringMask = smoothstep(currentRadius + uRingWidth, currentRadius, distToCenter) * smoothstep(currentRadius - uRingWidth, currentRadius, distToCenter);
            
            float ringStep = smoothstep(uRingThreshold - uSmoothEdge, uRingThreshold + uSmoothEdge, n_i);
            float currentLayerMask = ringStep * ringMask;
            
            if (currentLayerMask > finalMask) {
                vLayerType = fi + 1.0; 
            }
            finalMask = max(finalMask, currentLayerMask);
        }
    }
    
    if (finalMask <= 0.001) {
      gl_Position = vec4(0.0);
      return; 
    }
    
    vVisibility = finalMask;

    float scaleCycle = sin(time * uScaleAnimSpeed + phaseX);
    float animScaleX = 1.0 + max(0.0, scaleCycle) * uScaleAnimAmp;
    float animScaleY = 1.0 + max(0.0, -scaleCycle) * uScaleAnimAmp;
    
    float squashX = mix(1.0, finalMask, step(0.5, vSeed));
    float squashY = mix(finalMask, 1.0, step(0.5, vSeed));
    
    animScaleX *= squashX;
    animScaleY *= squashY;
    
    vec2 finalScale = aScale * vec2(animScaleX, animScaleY);
    vFinalScale = finalScale;
    
    float margin = uCornerDistance + uCornerDotSize + 0.1; 
    vec2 expandedScale = finalScale + vec2(margin * 2.0);
    
    pos.x *= expandedScale.x;
    pos.y *= expandedScale.y;
    
    vec3 offset = aOffset;
    float signX = aOffset.x >= 0.0 ? 1.0 : -1.0;
    float signY = aOffset.y >= 0.0 ? 1.0 : -1.0;
    
    float moveX = sin(time + phaseX) * uAnimAmpX;
    float moveY = cos(time * 0.8 + phaseY) * uAnimAmpY;
    
    offset.x += moveX * signX;
    offset.y += moveY * signY;

    vec4 worldPos = modelMatrix * instanceMatrix * vec4(pos + offset, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const BlockFragmentShader = `
  ${noiseGLSL} 

  uniform float uTime;
  uniform vec3 uColorWhite;
  uniform vec3 uColorShadow;
  uniform vec3 uColorAccent;
  uniform float uDepthMin;
  uniform float uDepthMax;
  
  uniform float uCornerDotSize; 
  uniform float uCornerDistance; 
  
  uniform vec3 uGradColor1;
  uniform vec3 uGradColor2;
  uniform vec3 uGradColor3;
  uniform vec3 uGradColor4;
  uniform float uGradRange;
  uniform float uGradNoiseScale;
  uniform float uGradNoiseAmp;
  
  // 【新增参数】：Alpha 与 发光强度
  uniform float uPlaneAlpha;
  uniform float uGlowIntensity;
  
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vSeed;
  varying float vType;
  varying vec2 vFinalScale; 
  varying float vLayerType; 
  varying float vVisibility; 
  varying vec3 vOffset;

  void main() {
    float currentDotSize = uCornerDotSize * smoothstep(0.0, 0.5, vVisibility);

    float margin = uCornerDistance + uCornerDotSize + 0.1;
    vec2 expandedScale = vFinalScale + vec2(margin * 2.0);
    vec2 absPhysicalPos = abs(vUv - 0.5) * expandedScale;
    
    vec2 blockHalfSize = vFinalScale * 0.5;
    bool inBlock = (absPhysicalPos.x <= blockHalfSize.x) && (absPhysicalPos.y <= blockHalfSize.y);
    
    vec2 dotCenter = blockHalfSize + vec2(uCornerDistance);
    float cornerDist = length(absPhysicalPos - dotCenter);
    float isCorner = smoothstep(currentDotSize + 0.02, currentDotSize, cornerDist);
    
    vec3 symPos = abs(vOffset);
    
    float gradNoise = snoise(vec3(symPos.xy * uGradNoiseScale, uTime * 0.15));
    float organicDist = length(symPos.xy) + gradNoise * uGradNoiseAmp;
    float t = clamp(organicDist / uGradRange, 0.0, 1.0);
    
    vec3 gradColor;
    if (t < 0.333) {
        gradColor = mix(uGradColor1, uGradColor2, smoothstep(0.0, 0.333, t));
    } else if (t < 0.666) {
        gradColor = mix(uGradColor2, uGradColor3, smoothstep(0.333, 0.666, t));
    } else {
        gradColor = mix(uGradColor3, uGradColor4, smoothstep(0.666, 1.0, t));
    }
    
    // 给渐变色乘以发光强度 (产生过曝/高亮效果)
    gradColor *= uGlowIntensity;
    
    vec3 currentThemeWhite = mix(gradColor, uColorWhite, smoothstep(0.8, 1.0, t));
    
    float depthNorm = clamp((vWorldPos.z - uDepthMin) / (uDepthMax - uDepthMin), 0.0, 1.0);
    float shadowFactor = depthNorm - fract(sin(dot(vWorldPos.xy, vec2(12.9898, 78.233))) * 43758.5453) * 0.1;
    
    vec3 baseColor = mix(uColorShadow, currentThemeWhite, smoothstep(0.0, 1.0, shadowFactor));
    
    if (vLayerType > 1.0) {
       float colorIntensity = min(0.1 + vLayerType * 0.15, 0.8);
       baseColor = mix(baseColor, uColorAccent * uGlowIntensity, colorIntensity); 
    }

    vec4 finalColor = vec4(0.0);
    
    if (vType == 0.0) {
      if (isCorner > 0.5) {
        // 顶点粒子增加发光
        finalColor = vec4(uColorAccent * uGlowIntensity * 1.5, 1.0);
      } else if (inBlock) {
        // 【核心修改】：平面的最终颜色输出使用 uPlaneAlpha 作为透明度
        finalColor = vec4(baseColor, uPlaneAlpha);
        if (vSeed > 0.9 && absPhysicalPos.x < blockHalfSize.x * 0.8 && absPhysicalPos.y < blockHalfSize.y * 0.8) discard;
      } else {
        discard;
      }
    } 
    else if (vType == 1.0) {
      if (isCorner > 0.5) {
        finalColor = vec4(uColorWhite * uGlowIntensity, 1.0);
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

  const controls = useControls({
    Animation: folder({
      globalSpeed: { value: 1.0, min: 0.0, max: 3.0 },
      blockWaveX: { value: 1.5, min: 0.0, max: 5.0 }, 
      blockWaveY: { value: 0.8, min: 0.0, max: 5.0 }, 
      scaleAnimSpeed: { value: 3.0, min: 0.0, max: 10.0 },
      scaleAnimAmp: { value: 0.8, min: 0.0, max: 3.0 },
    }),
    OrganicGradient: folder({ 
      gradColor1: '#ff2a6d', 
      gradColor2: '#b100ff', 
      gradColor3: '#05d9e8', 
      gradColor4: '#010048', 
      gradRange: { value: 50.0, min: 10.0, max: 150.0, step: 1.0 }, 
      gradNoiseScale: { value: 0.06, min: 0.01, max: 0.3, step: 0.01 }, 
      gradNoiseAmp: { value: 20.0, min: 0.0, max: 80.0, step: 1.0 }, 
      
      // 【新增】：透明度和发光参数
      planeAlpha: { value: 0.85, min: 0.1, max: 1.0, step: 0.05 },
      glowIntensity: { value: 1.5, min: 1.0, max: 10.0, step: 0.1 },
    }),
    NoisePattern: folder({ 
      noiseScale: { value: 0.05, min: 0.01, max: 0.2, step: 0.01 },
      noiseThreshold: { value: 0.0, min: -1.0, max: 1.0, step: 0.05 }, 
      smoothEdge: { value: 0.2, min: 0.01, max: 1.0, step: 0.01 },
      ringCount: { value: 2.0, min: 1.0, max: 5.0, step: 1.0 },
      noiseOffsetAmp: { value: 1.5, min: 0.0, max: 5.0, step: 0.1 },
      
      noiseOffsetX: { value: 15.0, min: -50.0, max: 50.0 }, 
      noiseOffsetY: { value: 20.0, min: -50.0, max: 50.0 },
      ringRadius: { value: 25.0, min: 10.0, max: 60.0 }, 
      ringWidth: { value: 12.0, min: 1.0, max: 30.0 }, 
      ringThreshold: { value: 0.1, min: -1.0, max: 1.0, step: 0.05 },
    }),
    Structure: folder({
      spreadX: { value: 80.0, min: 20.0, max: 150.0 },
      spreadY: { value: 60.0, min: 20.0, max: 120.0 },
      depthZ: { value: 15.0, min: 5.0, max: 30.0 },
      gridDensity: { value: 1.5, min: 0.5, max: 3.0 },
      blockSize: { value: 1.2, min: 0.5, max: 3.0 },
      cornerDotSize: { value: 0.15, min: 0.01, max: 0.8, step: 0.01 },
      cornerDistance: { value: 0.2, min: 0.0, max: 2.0, step: 0.01 },
    }),
    Colors: folder({
      colorWhite: '#ffffff',
      colorShadow: '#0a0d14',
      colorAccent: '#60e0ff',
      colorGrid: '#222233',
      colorGridDot: '#88aaff',
    })
  });

  const gridData = useMemo(() => {
    const countX = 80;
    const countZ = 15;
    const count = countX * countZ * 2;
    const offsets = new Float32Array(count * 3);
    let i = 0;
    
    for(let x = 0; x < countX; x++) {
      for(let z = 0; z < countZ; z++) {
        let posX = (x + 0.5) * controls.gridDensity * 1.5;
        let posZ = -10.0 - z * controls.gridDensity * 2.0; 
        let posY = (z % 2 === 0) ? 0.5 : -0.5;

        offsets.set([posX, posY, posZ], i * 3); i++;
        offsets.set([-posX, posY, posZ], i * 3); i++;
      }
    }
    return { count: i, offsets };
  }, [controls.gridDensity]);

  const blockData = useMemo(() => {
    const quadrantCount = 6000; 
    const totalCount = quadrantCount * 4;
    const offsets = new Float32Array(totalCount * 3);
    const dataArray = new Float32Array(totalCount * 4);
    const scaleMap = new Float32Array(totalCount * 2);
    let i = 0;
    
    for (let j = 0; j < quadrantCount; j++) {
      let x = Math.random() * controls.spreadX;
      let y = Math.random() * controls.spreadY;
      let z = (Math.random() - 0.5) * controls.depthZ;

      const snap = 1.0; 
      x = Math.round(x / snap) * snap;
      y = Math.round(y / snap) * snap;

      const phaseX = x * 0.2 + y * 0.1;
      const phaseY = y * 0.3;
      
      const seed = Math.random();
      const type = Math.random() > 0.4 ? 0.0 : 1.0; 

      let sX = (Math.random() * 3.0 + 0.5) * controls.blockSize;
      let sY = (Math.random() * 1.5 + 0.5) * controls.blockSize;
      if (Math.random() > 0.85) {
        sX *= 4.0; sY *= 0.2;
      }

      const quadrants = [ [x, y], [-x, y], [x, -y], [-x, -y] ];
      quadrants.forEach(([qx, qy]) => {
        offsets.set([qx, qy, z], i * 3);
        dataArray.set([seed, phaseX, phaseY, type], i * 4);
        scaleMap.set([sX, sY], i * 2);
        i++;
      });
    }
    return { count: totalCount, offsets, dataArray, scaleMap };
  }, [controls.spreadX, controls.spreadY, controls.depthZ, controls.blockSize]);

  const gridUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSpeed: { value: controls.globalSpeed },
    uWaveFreq: { value: 0.2 },
    uWaveAmp: { value: 2.0 },
    uStretchAmp: { value: 1.5 },
    uColorGrid: { value: new THREE.Color(controls.colorGrid) },
    uColorDot: { value: new THREE.Color(controls.colorGridDot) },
  }), [controls]);

  const blockUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAnimSpeed: { value: controls.globalSpeed },
    uAnimAmpX: { value: controls.blockWaveX },
    uAnimAmpY: { value: controls.blockWaveY },
    uScaleAnimSpeed: { value: controls.scaleAnimSpeed },
    uScaleAnimAmp: { value: controls.scaleAnimAmp },
    uCornerDotSize: { value: controls.cornerDotSize },
    uCornerDistance: { value: controls.cornerDistance },
    
    uRingCount: { value: controls.ringCount },
    uNoiseOffsetAmp: { value: controls.noiseOffsetAmp },
    
    uNoiseScale: { value: controls.noiseScale },
    uNoiseThreshold: { value: controls.noiseThreshold },
    uSmoothEdge: { value: controls.smoothEdge }, 
    uNoiseOffset: { value: new THREE.Vector3(controls.noiseOffsetX, controls.noiseOffsetY, 0.0) },
    uRingRadius: { value: controls.ringRadius },
    uRingWidth: { value: controls.ringWidth },
    uRingThreshold: { value: controls.ringThreshold },
    
    uGradColor1: { value: new THREE.Color(controls.gradColor1) },
    uGradColor2: { value: new THREE.Color(controls.gradColor2) },
    uGradColor3: { value: new THREE.Color(controls.gradColor3) },
    uGradColor4: { value: new THREE.Color(controls.gradColor4) },
    uGradRange: { value: controls.gradRange },
    uGradNoiseScale: { value: controls.gradNoiseScale },
    uGradNoiseAmp: { value: controls.gradNoiseAmp },
    
    // 【新增 Uniforms注入】
    uPlaneAlpha: { value: controls.planeAlpha },
    uGlowIntensity: { value: controls.glowIntensity },

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

  useEffect(() => {
    if(blockMaterialRef.current) {
        blockMaterialRef.current.uniforms.uScaleAnimSpeed.value = controls.scaleAnimSpeed;
        blockMaterialRef.current.uniforms.uScaleAnimAmp.value = controls.scaleAnimAmp;
        blockMaterialRef.current.uniforms.uCornerDotSize.value = controls.cornerDotSize;
        blockMaterialRef.current.uniforms.uCornerDistance.value = controls.cornerDistance;
        
        blockMaterialRef.current.uniforms.uRingCount.value = controls.ringCount;
        blockMaterialRef.current.uniforms.uNoiseOffsetAmp.value = controls.noiseOffsetAmp;
        
        blockMaterialRef.current.uniforms.uNoiseScale.value = controls.noiseScale;
        blockMaterialRef.current.uniforms.uNoiseThreshold.value = controls.noiseThreshold;
        blockMaterialRef.current.uniforms.uSmoothEdge.value = controls.smoothEdge; 
        blockMaterialRef.current.uniforms.uNoiseOffset.value.set(controls.noiseOffsetX, controls.noiseOffsetY, 0.0);
        blockMaterialRef.current.uniforms.uRingRadius.value = controls.ringRadius;
        blockMaterialRef.current.uniforms.uRingWidth.value = controls.ringWidth;
        blockMaterialRef.current.uniforms.uRingThreshold.value = controls.ringThreshold;
        
        blockMaterialRef.current.uniforms.uGradColor1.value.set(controls.gradColor1);
        blockMaterialRef.current.uniforms.uGradColor2.value.set(controls.gradColor2);
        blockMaterialRef.current.uniforms.uGradColor3.value.set(controls.gradColor3);
        blockMaterialRef.current.uniforms.uGradColor4.value.set(controls.gradColor4);
        blockMaterialRef.current.uniforms.uGradRange.value = controls.gradRange;
        blockMaterialRef.current.uniforms.uGradNoiseScale.value = controls.gradNoiseScale;
        blockMaterialRef.current.uniforms.uGradNoiseAmp.value = controls.gradNoiseAmp;
        
        // 【新增】：更新 Alpha 和 Glow 参数
        blockMaterialRef.current.uniforms.uPlaneAlpha.value = controls.planeAlpha;
        blockMaterialRef.current.uniforms.uGlowIntensity.value = controls.glowIntensity;
    }
  }, [controls]);

  return (
    <group>
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
          // 【关键修改】：将 transparent 设为 true，这样 uPlaneAlpha 才会生效
          transparent={true}
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
      <Canvas camera={{ position: [0, 0, 80], fov: 45 }}>
        <SymmetricalArt />
        <OrbitControls enableZoom={true} maxDistance={250} minDistance={10} />
      </Canvas>
    </div>
  );
}
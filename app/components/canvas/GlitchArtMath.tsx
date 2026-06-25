'use client';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

import GridVertexShader from "./shader/matrix-art/grid-vertex-shader.glsl"
import GridFragmentShader from "./shader/matrix-art/grid-fragment-shader.glsl"
import BlockVertexShader from "./shader/matrix-art/block-vertex-shader.glsl"
import BlockFragmentShader from "./shader/matrix-art/block-fragment-shader.glsl"

const SymmetricalArt = ({ controls }: { controls: any }) => {
  const gridMeshRef = useRef<THREE.InstancedMesh>(null);
  const blockMeshRef = useRef<THREE.InstancedMesh>(null);
  const gridMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const blockMaterialRef = useRef<THREE.ShaderMaterial>(null);

  const gridData = useMemo(() => {
    const countX = 80; const countZ = 15;
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
      if (Math.random() > 0.85) { sX *= 4.0; sY *= 0.2; }
      const quadrants = [ [x, y], [-x, y], [x, -y], [-x, -y] ];
      quadrants.forEach(([qx, qy]) => {
        offsets.set([qx, qy, z], i * 3);
        dataArray.set([seed, phaseX, phaseY, type], i * 4);
        scaleMap.set([sX, sY], i * 2); i++;
      });
    }
    return { count: totalCount, offsets, dataArray, scaleMap };
  }, [controls.spreadX, controls.spreadY, controls.depthZ, controls.blockSize]);

  const gridUniforms = useMemo(() => ({
    uTime: { value: 0 }, uSpeed: { value: controls.globalSpeed },
    uWaveFreq: { value: 0.2 }, uWaveAmp: { value: 2.0 }, uStretchAmp: { value: 1.5 },
    uColorGrid: { value: new THREE.Color(controls.colorGrid) },
    uColorDot: { value: new THREE.Color(controls.colorGridDot) },
  }), [controls]);

  const blockUniforms = useMemo(() => ({
    uTime: { value: 0 }, uAnimSpeed: { value: controls.globalSpeed },
    uAnimAmpX: { value: controls.blockWaveX }, uAnimAmpY: { value: controls.blockWaveY },
    uScaleAnimSpeed: { value: controls.scaleAnimSpeed }, uScaleAnimAmp: { value: controls.scaleAnimAmp },
    uCornerDotSize: { value: controls.cornerDotSize }, uCornerDistance: { value: controls.cornerDistance },
    uRingCount: { value: controls.ringCount }, uNoiseOffsetAmp: { value: controls.noiseOffsetAmp },
    uNoiseScale: { value: controls.noiseScale }, uNoiseThreshold: { value: controls.noiseThreshold },
    uSmoothEdge: { value: controls.smoothEdge }, uNoiseOffset: { value: new THREE.Vector3(controls.noiseOffsetX, controls.noiseOffsetY, 0.0) },
    uRingRadius: { value: controls.ringRadius }, uRingWidth: { value: controls.ringWidth }, uRingThreshold: { value: controls.ringThreshold },
    uGradColor1: { value: new THREE.Color(controls.gradColor1) }, uGradColor2: { value: new THREE.Color(controls.gradColor2) },
    uGradColor3: { value: new THREE.Color(controls.gradColor3) }, uGradColor4: { value: new THREE.Color(controls.gradColor4) },
    uGradRange: { value: controls.gradRange }, uGradNoiseScale: { value: controls.gradNoiseScale }, uGradNoiseAmp: { value: controls.gradNoiseAmp },
    uPlaneAlpha: { value: controls.planeAlpha }, uGlowIntensity: { value: controls.glowIntensity },
    uColorWhite: { value: new THREE.Color(controls.colorWhite) }, uColorShadow: { value: new THREE.Color(controls.colorShadow) },
    uColorAccent: { value: new THREE.Color(controls.colorAccent) }, uDepthMin: { value: -controls.depthZ / 2 }, uDepthMax: { value: controls.depthZ / 2 + 5.0 },
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
        <shaderMaterial ref={gridMaterialRef} vertexShader={GridVertexShader} fragmentShader={GridFragmentShader} uniforms={gridUniforms} transparent={true} depthWrite={false} blending={THREE.AdditiveBlending} />
      </instancedMesh>
      <instancedMesh ref={blockMeshRef} args={[undefined, undefined, blockData.count]}>
        <planeGeometry args={[1, 1]}>
          <instancedBufferAttribute attach="attributes-aOffset" args={[blockData.offsets, 3]} />
          <instancedBufferAttribute attach="attributes-aData" args={[blockData.dataArray, 4]} />
          <instancedBufferAttribute attach="attributes-aScale" args={[blockData.scaleMap, 2]} />
        </planeGeometry>
        <shaderMaterial ref={blockMaterialRef} vertexShader={BlockVertexShader} fragmentShader={BlockFragmentShader} uniforms={blockUniforms} transparent={true} alphaTest={0.5} depthWrite={true} side={THREE.DoubleSide} />
      </instancedMesh>
    </group>
  );
};

export default function GenerativeArchitect({ controls }: { controls: any }) {
  // 仅仅保留纯净的画布渲染容器，充满父级
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 80], fov: 45 }}>
        <SymmetricalArt controls={controls} />
        <OrbitControls enableZoom={true} maxDistance={250} minDistance={10} />
      </Canvas>
    </div>
  );
}
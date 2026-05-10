"use client";

import * as THREE from "three";
import React, { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useVideoTexture } from "@react-three/drei";

interface PixelVideoProps {
  src: string;
  resX?: number;
  resY?: number;
  gap?: number;
  pixelScale?: number;
  pixelAspect?: number;
}

export default function PixelVideo({
  src,
  resX = 120,
  resY = 72,
  gap = 0.3,
  pixelScale = 1.0,
  pixelAspect = 1.0,
}: PixelVideoProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { viewport } = useThree();
  const { width, height } = viewport;

  // 1. 加载视频纹理
  const texture = useVideoTexture(src);

  // 2. 计算像素点几何尺寸
  const { pointW, pointH } = useMemo(() => {
    const baseW = width / resX;
    const pW = baseW * pixelScale;
    const pH = (baseW / pixelAspect) * pixelScale;
    return { pointW: pW, pointH: pH };
  }, [width, resX, pixelScale, pixelAspect]);

  // 3. 计算位置与修正后的 UV (实现 Object-fit: Cover)
  const numInstances = resX * resY;
  const { instancePositions, instanceUVs } = useMemo(() => {
    const pos = new Float32Array(numInstances * 3);
    const uvs = new Float32Array(numInstances * 2);

    const stepX = width / resX;
    const stepY = height / resY;

    // --- 裁剪逻辑开始 ---
    // 获取视频比例 (默认 16/9 防止初次加载报错)
    const videoAspect = texture.image ? texture.image.videoWidth / texture.image.videoHeight : 16 / 9;
    const canvasAspect = width / height;

    let scaleX = 1;
    let scaleY = 1;
    let offsetX = 0;
    let offsetY = 0;

    if (videoAspect > canvasAspect) {
      // 视频太宽，裁剪两侧
      scaleX = canvasAspect / videoAspect;
      offsetX = (1 - scaleX) / 2;
    } else {
      // 视频太高，裁剪上下
      scaleY = videoAspect / canvasAspect;
      offsetY = (1 - scaleY) / 2;
    }
    // --- 裁剪逻辑结束 ---

    for (let i = 0; i < resX; i++) {
      for (let j = 0; j < resY; j++) {
        const idx = i * resY + j;
        pos[idx * 3 + 0] = i * stepX - width / 2 + stepX / 2;
        pos[idx * 3 + 1] = j * stepY - height / 2 + stepY / 2;
        pos[idx * 3 + 2] = 0;

        // 应用修正后的 UV 映射
        uvs[idx * 2 + 0] = (i / resX) * scaleX + offsetX;
        uvs[idx * 2 + 1] = (j / resY) * scaleY + offsetY;
      }
    }
    return { instancePositions: pos, instanceUVs: uvs };
  }, [width, height, resX, resY, texture.image]); // 依赖 texture.image 确保视频加载后重算

  const materialArgs = useMemo(() => ({
    uniforms: {
      uTexture: { value: texture },
      uGap: { value: gap },
    },
    vertexShader: `
      attribute vec3 instancePosition;
      attribute vec2 instanceUV;
      varying vec2 vUv;
      varying vec2 vInstanceUV;
      varying vec3 vColor;
      uniform sampler2D uTexture;

      void main() {
        vUv = uv;
        vInstanceUV = instanceUV;
        vec4 texColor = texture2D(uTexture, instanceUV);
        vColor = texColor.rgb;

        float brightness = (vColor.r + vColor.g + vColor.b) / 3.0;
        vec3 transformed = position;
        transformed.z += brightness * 0.2;

        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(transformed + instancePosition, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 vColor;
      uniform float uGap;

      void main() {
        // 圆角裁剪
        vec2 centerUV = vUv * 2.0 - 1.0;
        float dist = length(max(abs(centerUV) - (1.0 - uGap), 0.0));
        if(dist > 0.1) discard; 

        gl_FragColor = vec4(vColor, 1.0);
      }
    `
  }), [texture, gap]);

  return (
    <instancedMesh ref={meshRef} args={[null!, null!, numInstances]}>
      <planeGeometry args={[pointW, pointH]}>
        <instancedBufferAttribute
          attach="attributes-instancePosition"
          args={[instancePositions, 3]}
        />
        <instancedBufferAttribute
          attach="attributes-instanceUV"
          args={[instanceUVs, 2]}
        />
      </planeGeometry>
      <shaderMaterial attach="material" args={[materialArgs]} transparent />
    </instancedMesh>
  );
}
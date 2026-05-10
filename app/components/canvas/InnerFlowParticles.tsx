"use client";

import React, { Suspense, useState, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree, Canvas } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";

import gpgpuVelShader from "./shader/gpgpu/velocity.glsl"
import gpgpuPosShader from "./shader/gpgpu/position.glsl"

// 2. 修改你的主组件接口
interface InnerProps {
    count?: number;
    textureUrls: string[]; // 改为直接接收 URL 数组
}

// --- 着色器代码 ---

const velocityShader = gpgpuVelShader;
const positionShader = gpgpuPosShader;

// --- 组件部分 ---

interface Item {
    mainMedia: {
        url: string;
    };
}

const InnerFlowParticlesGPGPU: React.FC<InnerProps> = ({
    count = 128,
    textureUrls,
}) => {
    const { gl, viewport } = useThree();
    const size = Math.ceil(Math.sqrt(count));

    const particleTextures = useTexture(textureUrls);
    useEffect(() => {
        particleTextures.forEach((tex) => {
            // 重要：确保贴图使用正确的颜色空间
            // 否则图片颜色在渲染时会显得灰白、不鲜艳
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.needsUpdate = true;
        });
    }, [particleTextures]);

    const textureIndexAttribute = useMemo(() => {
        const indices = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            indices[i] = Math.floor(Math.random() * particleTextures.length);
        }
        console.log("Current Count:", count);
        return new THREE.InstancedBufferAttribute(indices, 1, false);
    }, [count, particleTextures.length]);

    // 用于追踪鼠标是否悬停在画布上
    const [isHovered, setIsHovered] = useState(false);

    const { gpuCompute, variables } = useMemo(() => {
        const gpu = new GPUComputationRenderer(size, size, gl);
        const dtPosition = gpu.createTexture();
        const dtVelocity = gpu.createTexture();

        const posData = dtPosition.image.data as Float32Array;
        const velData = dtVelocity.image.data as Float32Array;

        for (let i = 0; i < posData.length; i += 4) {
            posData[i + 0] = (Math.random() - 0.5) * 30.0;
            posData[i + 1] = (Math.random() - 0.5) * 15.0;
            posData[i + 2] = 0;
            posData[i + 3] = Math.random() * 100.0;

            velData[i + 0] = (Math.random() - 0.5) * 0.1;
            velData[i + 1] = (Math.random() - 0.5) * 0.1;
            velData[i + 2] = 0;
            velData[i + 3] = 1.0;
        }

        const velVar = gpu.addVariable(
            "textureVelocity",
            velocityShader,
            dtVelocity,
        );
        const posVar = gpu.addVariable(
            "texturePosition",
            positionShader,
            dtPosition,
        );

        gpu.setVariableDependencies(velVar, [posVar, velVar]);
        gpu.setVariableDependencies(posVar, [posVar, velVar]);

        // 初始化新的 Uniforms
        velVar.material.uniforms = {
            uTime: { value: 0.0 },
            uDelta: { value: 0.0 },
            uForceStrength: { value: 2 },
            uMouse: { value: new THREE.Vector3() },
            uHasMouse: { value: 0.0 },
        };

        gpu.init();
        return { gpuCompute: gpu, variables: { posVar, velVar } };
    }, [size, gl, count]);

    const material = useMemo(() => {
        const mat = new THREE.MeshBasicMaterial({
            transparent: true,
            depthTest: false,
            depthWrite: false, // 建议加上，防止半透明遮挡冲突
            alphaTest: 0.2, // 提高阈值，过滤掉边缘虚化的部分
        });

        mat.onBeforeCompile = (shader) => {
            // 1. 准备 Uniforms
            shader.uniforms.uPosTexture = { value: null };
            shader.uniforms.uTexSize = { value: size };
            shader.uniforms.uTextureCount = { value: particleTextures.length };
            particleTextures.forEach((tex, i) => {
                shader.uniforms[`uTexture${i}`] = { value: tex };
            });

            // 2. Vertex Shader 修复
            // 将声明放在 main 之前
            shader.vertexShader =
                `
                attribute float textureIndex;
                varying float vTexIndex;
                varying vec2 vInstanceUv; // 我们自己传 UV，避免和内置 vUv 冲突
                uniform sampler2D uPosTexture;
                uniform float uTexSize;
            ` + shader.vertexShader;

            shader.vertexShader = shader.vertexShader.replace(
                "#include <begin_vertex>",
                `
                #include <begin_vertex>
                
                float instanceIdx = float(gl_InstanceID);
                vec2 dataUV = vec2(mod(instanceIdx, uTexSize) + 0.5, floor(instanceIdx / uTexSize) + 0.5) / uTexSize;
                vec4 posSample = texture2D(uPosTexture, dataUV);

                vTexIndex = textureIndex;
                vInstanceUv = uv; // uv 是 geometry 提供的原始属性

                float vScale = posSample.w;
                // 这里的 transformed 是 Three.js 内部变量
                transformed = position * vScale + posSample.xyz;
                `,
            );

            // 3. Fragment Shader 修复
            shader.fragmentShader =
                `
                varying float vTexIndex;
                varying vec2 vInstanceUv;
                uniform float uTextureCount;
                ${particleTextures.map((_, i) => `uniform sampler2D uTexture${i};`).join("\n")}
            ` + shader.fragmentShader;

            shader.fragmentShader = shader.fragmentShader.replace(
                "#include <map_fragment>",
                `
                vec4 texColor = vec4(1.0);
                float idx = floor(vTexIndex + 0.5);

                ${particleTextures
                    .map(
                        (_, i) => `
                    if (abs(idx - ${i}.0) < 0.1) {
                        texColor = texture2D(uTexture${i}, vInstanceUv);
                    }
                `,
                    )
                    .join("\n")}

                diffuseColor *= texColor;
                `,
            );

            mat.userData.shader = shader;
        };

        return mat;
    }, [particleTextures, size]);

    useFrame((state, delta) => {
        // --- 关键保护：如果 Shader 还没准备好，或者 WebGL 正在忙于处理控制台缩放，直接跳过这一帧 ---
        if (!material.userData.shader || !gpuCompute) return;

        // 检查具体的 Uniforms 是否存在，防止控制台开启时的空指针错误
        if (!material.userData.shader.uniforms.uPosTexture) return;

        const d = Math.min(delta, 0.05);
        const velUniforms = variables.velVar.material.uniforms;

        // 修改坐标映射：确保鼠标位置直接映射到世界坐标
        // state.mouse 是归一化坐标 (-1 到 1)
        // 我们需要将其与 viewport 结合
        velUniforms.uMouse.value.set(
            (state.mouse.x * viewport.width) / 2,
            (state.mouse.y * viewport.height) / 2,
            0,
        );

        // 强制更新 hover 状态（如果上述事件没触发，可以用 state.mouse 判断是否在动）
        velUniforms.uHasMouse.value = isHovered ? 1.0 : 0.0;

        velUniforms.uTime.value = state.clock.elapsedTime;
        velUniforms.uDelta.value = d;

        gpuCompute.compute();

        if (material.userData.shader) {
            material.userData.shader.uniforms.uPosTexture.value =
                gpuCompute.getCurrentRenderTarget(variables.posVar).texture;
        }
    });

    return (
        <group>
            {/* 核心修改：添加一个不可见的平面来捕捉全屏鼠标事件 */}
            <mesh
                visible={false}
                onPointerOver={() => setIsHovered(true)}
                onPointerOut={() => setIsHovered(false)}
            >
                <planeGeometry
                    args={[viewport.width * 2, viewport.height * 2]}
                />
            </mesh>

            <instancedMesh args={[null!, null!, count]} frustumCulled={false}>
                <planeGeometry args={[0.32, 0.32]}>
                    {/* 添加 per-instance 属性 */}
                    <instancedBufferAttribute
                        attach="attributes-textureIndex" // 注意这里，Shader 里对应的就是 textureIndex
                        args={[textureIndexAttribute.array, 1]}
                    />
                </planeGeometry>
                <primitive object={material} attach="material" />
            </instancedMesh>
        </group>
    );
};

export default InnerFlowParticlesGPGPU;

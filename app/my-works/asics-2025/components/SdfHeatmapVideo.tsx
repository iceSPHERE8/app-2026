'use client'

import React, { useRef, useMemo, Suspense, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useVideoTexture } from "@react-three/drei";
import * as THREE from "three";

// --- 1. Shader Uniforms 接口 ---
interface ChromaColoramaUniforms {
    uTexture: { value: THREE.VideoTexture | null };
    uBlur: { value: number };
    uBlackPoint: { value: number };
    uWhitePoint: { value: number };
    uPhase: { value: number };
    uInvert: { value: number };
    uBgColor: { value: THREE.Color };
    uMaskThreshold: { value: number };
    uMaskFeather: { value: number };
}

// --- 2. 核心 Shader ---
const ChromaColoramaMaterial = {
    uniforms: {
        uTexture: { value: null },
        uBlur: { value: 0.015 },
        uBlackPoint: { value: 0.05 },
        uWhitePoint: { value: 0.8 },
        uPhase: { value: 0.0 },
        uInvert: { value: 0.0 },
        uBgColor: { value: new THREE.Color("#000000") },
        uMaskThreshold: { value: 0.05 },
        uMaskFeather: { value: 0.08 },
    } as ChromaColoramaUniforms,
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform sampler2D uTexture;
    uniform float uBlur;
    uniform float uBlackPoint;
    uniform float uWhitePoint;
    uniform float uPhase;
    uniform float uInvert;
    uniform vec3 uBgColor;
    uniform float uMaskThreshold;
    uniform float uMaskFeather;

    varying vec2 vUv;

    const vec2 poissonDisk[16] = vec2[](
        vec2( -0.94201624, -0.39906216 ), vec2( 0.94558609, -0.76890725 ),
        vec2( -0.094184101, -0.92938870 ), vec2( 0.34495938, 0.29387760 ),
        vec2( -0.91588581, 0.45771432 ), vec2( -0.81544232, -0.87912464 ),
        vec2( -0.38277543, 0.27676845 ), vec2( 0.97484398, 0.75648379 ),
        vec2( 0.44323325, -0.97511554 ), vec2( 0.53742981, -0.47373420 ),
        vec2( -0.26496911, -0.41893023 ), vec2( 0.79197514, 0.19090188 ),
        vec2( -0.24188840, 0.99706507 ), vec2( -0.81409955, 0.91437590 ),
        vec2( 0.19984126, 0.78641367 ), vec2( 0.14383161, -0.14100790 )
    );

    float random(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    vec3 getColorama(float t) {
        t = fract(t + uPhase);
        vec3 darkBlue = vec3(0.02, 0.05, 0.25);
        vec3 magenta  = vec3(0.9, 0.0, 0.9);
        vec3 yellow   = vec3(1.0, 0.9, 0.0);
        vec3 green    = vec3(0.0, 1.0, 0.2);
        vec3 cyan     = vec3(0.0, 0.9, 1.0);

        vec3 color = mix(darkBlue, magenta, smoothstep(0.0, 0.25, t));
        color = mix(color, yellow,  smoothstep(0.25, 0.5, t));
        color = mix(color, green,   smoothstep(0.5, 0.75, t));
        color = mix(color, cyan,    smoothstep(0.75, 1.0, t));
        return color;
    }

    vec4 getBlurredTexture(sampler2D tex, vec2 uv, float radius) {
        if (radius <= 0.001) return texture2D(tex, uv);
        vec4 color = vec4(0.0);
        float noise = random(uv) * 6.2831853; 
        float s = sin(noise);
        float c = cos(noise);
        mat2 rot = mat2(c, -s, s, c); 
        
        for(int i = 0; i < 16; i++) {
            vec2 offset = rot * poissonDisk[i] * radius;
            color += texture2D(tex, uv + offset);
        }
        return color / 16.0;
    }

    float dither(vec2 uv) {
        return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
        vec4 texColor = getBlurredTexture(uTexture, vUv, uBlur);
        float luma = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
        if (uInvert > 0.5) luma = 1.0 - luma;
        
        float mask = smoothstep(uMaskThreshold - uMaskFeather, uMaskThreshold + uMaskFeather, luma);
        float mappedLuma = smoothstep(uBlackPoint, uWhitePoint, luma);
        vec3 foregroundColor = getColorama(mappedLuma);
        vec3 finalColor = mix(uBgColor, foregroundColor, mask);
        finalColor += (dither(vUv) - 0.5) / 128.0; 
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
};

// --- 3. 渲染平面的子组件 ---
interface VideoPlaneProps {
    videoPath: string;
    params: {
        blur: number;
        blackPoint: number;
        whitePoint: number;
        phase: number;
        invert: boolean;
        bgColor: string;
        maskThreshold: number;
        maskFeather: number;
    };
}

const VideoPlane: React.FC<VideoPlaneProps> = ({ videoPath, params }) => {
    const texture = useVideoTexture(videoPath, {
        start: true,
        loop: true,
        muted: true,
        crossOrigin: "Anonymous",
    });

    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const bgThreeColor = useMemo(
        () => new THREE.Color(params.bgColor),
        [params.bgColor],
    );

    useFrame(() => {
        if (materialRef.current) {
            materialRef.current.uniforms.uBlur.value = params.blur;
            materialRef.current.uniforms.uBlackPoint.value = params.blackPoint;
            materialRef.current.uniforms.uWhitePoint.value = params.whitePoint;
            materialRef.current.uniforms.uPhase.value = params.phase;
            materialRef.current.uniforms.uInvert.value = params.invert ? 1.0 : 0.0;
            materialRef.current.uniforms.uBgColor.value = bgThreeColor;
            materialRef.current.uniforms.uMaskThreshold.value = params.maskThreshold;
            materialRef.current.uniforms.uMaskFeather.value = params.maskFeather;
        }
    });

    const uniforms = useMemo(
        () => ({
            uTexture: { value: texture },
            uBlur: { value: params.blur },
            uBlackPoint: { value: params.blackPoint },
            uWhitePoint: { value: params.whitePoint },
            uPhase: { value: params.phase },
            uInvert: { value: params.invert ? 1.0 : 0.0 },
            uBgColor: { value: bgThreeColor },
            uMaskThreshold: { value: params.maskThreshold },
            uMaskFeather: { value: params.maskFeather },
        }),
        [texture, params, bgThreeColor],
    );

    return (
        <mesh>
            <planeGeometry args={[10, 10]} />
            <shaderMaterial
                ref={materialRef}
                uniforms={uniforms}
                vertexShader={ChromaColoramaMaterial.vertexShader}
                fragmentShader={ChromaColoramaMaterial.fragmentShader}
            />
        </mesh>
    );
};

// --- 4. 主组件 ---
export default function ChromaColorama() {
    const videoPath = "/asics-2025/resized-1080x1080-Running-Sequence.mp4";

    const [params, setParams] = useState({
        blur: 0.015,
        blackPoint: 0.05,
        whitePoint: 0.8,
        phase: 0.0,
        invert: false,
        bgColor: "#000000",
        maskThreshold: 0.05,
        maskFeather: 0.08,
    });

    const handleChange = (
        key: keyof typeof params,
        value: number | boolean | string,
    ) => {
        setParams((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="relative w-full min-h-screen flex items-center justify-center bg-[#eaeaea] p-6">
            <style>{`
        .clean-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          background: #d4d4d8; 
          border-radius: 999px;
          outline: none;
        }

        .clean-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 6px;
          height: 18px;
          border-radius: 9999px;
          border: 1px solid #a1a1a1;
          cursor: pointer;
          background: linear-gradient(to bottom, #eaeaea, #e6e6e6, #ababab);
          box-shadow: inset 0 1px 0 rgba(255,255,255,1), 0 1px 2px rgba(0,0,0,0.2);
        }

        .clean-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          border: 1px solid #a1a1a1;
          cursor: pointer;
          background: linear-gradient(to bottom, #eaeaea, #e6e6e6, #ababab);
          box-shadow: inset 0 1px 0 rgba(255,255,255,1), 0 1.5px 3px rgba(0,0,0,0.5);
        }
        
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #a1a1a1;
        }

        /* 重置 Webkit (Chrome/Safari/Edge) 颜色选择器的默认 Padding */
        .clean-color-picker::-webkit-color-swatch-wrapper {
          padding: 0;
        }

        /* 移除色块自身的默认边框 */
        .clean-color-picker::-webkit-color-swatch {
          border: none;
        }

        /* 重置 Firefox 颜色选择器的默认边框 */
        .clean-color-picker::-moz-color-swatch {
          border: none;
        }
      `}</style>

            <div className="flex flex-col md:flex-row h-[85vh] max-h-[860px] w-full max-w-[1200px] gap-6">
                
                {/* 左侧画布容器 */}
                <div className="aspect-square h-full bg-black shrink-0 relative">
                    
                    {/* --- 新增：左上角原视频参考画面 --- */}
                    <video
                        src={videoPath}
                        autoPlay
                        loop
                        muted
                        playsInline
                        crossOrigin="anonymous"
                        className="absolute top-0 left-0 w-1/4 aspect-square object-cover z-20 pointer-events-none"
                    />

                    <Canvas
                        orthographic
                        camera={{ position: [0, 0, 1], zoom: 100 }}
                    >
                        <Suspense fallback={null}>
                            <VideoPlane videoPath={videoPath} params={params} />
                        </Suspense>
                    </Canvas>
                </div>

                {/* 右侧交互 UI 面板 */}
                <div className="h-full w-full md:w-[360px] shrink-0 bg-[#c4c4c4] p-6 flex flex-col z-10 overflow-y-auto custom-scroll text-[#000000]">
                    <div className="pb-4 shrink-0">
                        <h2 className="text-xl font-bold leading-none">
                            CHROMA SETTINGS
                        </h2>
                        <p className="text-sm font-normal">
                            SDF Luma Key Processor
                        </p>
                    </div>

                    <div className="flex flex-col gap-6 pt-6 pb-4">
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase">
                                Background:/
                            </h3>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-normal">
                                    Color:
                                </span>
                                <div className="w-6 h-6 border border-[#a1a1a1] overflow-hidden flex items-center justify-center">
                                    <input
                                        title="bg color"
                                        type="color"
                                        value={params.bgColor}
                                        onChange={(e) =>
                                            handleChange(
                                                "bgColor",
                                                e.target.value,
                                            )
                                        }
                                        className="clean-color-picker w-full h-full cursor-pointer border-0 bg-transparent outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-normal">
                                        Threshold:
                                    </span>
                                    <span className="font-normal">
                                        {params.maskThreshold.toFixed(2)}
                                    </span>
                                </div>
                                <input
                                    title="mask threshold"
                                    type="range"
                                    min="0"
                                    max="0.5"
                                    step="0.01"
                                    value={params.maskThreshold}
                                    onChange={(e) =>
                                        handleChange(
                                            "maskThreshold",
                                            parseFloat(e.target.value),
                                        )
                                    }
                                    className="clean-slider"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-normal">
                                        Feather:
                                    </span>
                                    <span className="font-normal">
                                        {params.maskFeather.toFixed(2)}
                                    </span>
                                </div>
                                <input
                                    title="mask feather"
                                    type="range"
                                    min="0"
                                    max="0.5"
                                    step="0.01"
                                    value={params.maskFeather}
                                    onChange={(e) =>
                                        handleChange(
                                            "maskFeather",
                                            parseFloat(e.target.value),
                                        )
                                    }
                                    className="clean-slider"
                                />
                            </div>
                        </div>

                        <div className="w-full h-px bg-[#a1a1a1]"></div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase">
                                Color Mapping:/
                            </h3>

                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-normal">
                                        Pre-Blur:
                                    </span>
                                    <span className="font-normal">
                                        {params.blur.toFixed(3)}
                                    </span>
                                </div>
                                <input
                                    title="blur"
                                    type="range"
                                    min="0"
                                    max="0.05"
                                    step="0.001"
                                    value={params.blur}
                                    onChange={(e) =>
                                        handleChange(
                                            "blur",
                                            parseFloat(e.target.value),
                                        )
                                    }
                                    className="clean-slider"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-normal">
                                        Black Point:
                                    </span>
                                    <span className="font-normal">
                                        {params.blackPoint.toFixed(2)}
                                    </span>
                                </div>
                                <input
                                    title="black point"
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={params.blackPoint}
                                    onChange={(e) =>
                                        handleChange(
                                            "blackPoint",
                                            parseFloat(e.target.value),
                                        )
                                    }
                                    className="clean-slider"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-normal">
                                        White Point:
                                    </span>
                                    <span className="font-normal">
                                        {params.whitePoint.toFixed(2)}
                                    </span>
                                </div>
                                <input
                                    title="white point"
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={params.whitePoint}
                                    onChange={(e) =>
                                        handleChange(
                                            "whitePoint",
                                            parseFloat(e.target.value),
                                        )
                                    }
                                    className="clean-slider"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-normal">Phase:</span>
                                    <span className="font-normal">
                                        {params.phase.toFixed(2)}
                                    </span>
                                </div>
                                <input
                                    title="phase"
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={params.phase}
                                    onChange={(e) =>
                                        handleChange(
                                            "phase",
                                            parseFloat(e.target.value),
                                        )
                                    }
                                    className="clean-slider"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 底部数据回显装饰 */}
                    <div className="mt-auto pt-8 pb-2">
                        <div className="font-mono text-[10px] leading-tight text-[#000000]">
                            <p className="font-bold text-[#000000] mb-1 uppercase tracking-widest">
                                ASICS_PROJECT_2025
                            </p>
                            <div className="grid grid-cols-2 gap-x-2 leading-none">
                                <span>HEX: {params.bgColor.toUpperCase()}</span>
                                <span>
                                    INV: {params.invert ? "TRUE" : "FALSE"}
                                </span>
                                <span>
                                    THR: {params.maskThreshold.toFixed(3)}
                                </span>
                                <span>
                                    FTH: {params.maskFeather.toFixed(3)}
                                </span>
                                <span>BLR: {params.blur.toFixed(3)}</span>
                                <span>BLK: {params.blackPoint.toFixed(3)}</span>
                                <span>WHT: {params.whitePoint.toFixed(3)}</span>
                                <span>PHS: {params.phase.toFixed(3)}</span>
                            </div>
                            <p className="mt-3 text-[9px] text-[#1c8d00] tracking-widest animate-pulse leading-none">
                                SYS_STATE // RENDER_ACTIVE...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
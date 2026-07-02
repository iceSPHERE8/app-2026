"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
    useGLTF,
    OrbitControls,
    Environment,
    ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

export const VIDEO_LIST = [
    "/bushes-sport/2_1.mp4",
    "/bushes-sport/3_1.mp4",
    "/bushes-sport/4_1.mp4",
    "/bushes-sport/5_1.mp4",
    "/bushes-sport/6_1.mp4",
    "/bushes-sport/7_1.mp4",
    "/bushes-sport/8_1.mp4",
    "/bushes-sport/9_1.mp4",
    "/bushes-sport/10_1.mp4",
];

useGLTF.preload("/bushes-sport/tamagochi.glb");

function TamagochiModel() {
    const { scene } = useGLTF("/bushes-sport/tamagochi.glb");

    const [videoIndex, setVideoIndex] = useState(0);
    const [pressedBtn, setPressedBtn] = useState<string | null>(null);

    const videoElRef = useRef<HTMLVideoElement | null>(null);
    const textureRef = useRef<THREE.VideoTexture | null>(null);
    const markerMatRef = useRef<THREE.SpriteMaterial | null>(null);

    // 1. 初始化
    useEffect(() => {
        if (!scene) return;

        // --- 视频与屏幕材质初始化 ---
        const video = document.createElement("video");
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.crossOrigin = "Anonymous";
        video.src = VIDEO_LIST[0];
        const initialPlayPromise = video.play();
        if (initialPlayPromise !== undefined) {
            initialPlayPromise.catch(() => {});
        }
        videoElRef.current = video;

        const texture = new THREE.VideoTexture(video);
        texture.flipY = false;
        texture.colorSpace = THREE.SRGBColorSpace;
        textureRef.current = texture;

        // --- 动态生成交互呼吸标记的材质 ---
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            // 内核实心白点
            ctx.beginPath();
            ctx.arc(32, 32, 14, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
            ctx.fill();
            // 外圈半透光晕
            ctx.beginPath();
            ctx.arc(32, 32, 24, 0, Math.PI * 2);
            ctx.lineWidth = 4;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
            ctx.stroke();
        }
        const spriteTex = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({
            map: spriteTex,
            transparent: true,
            opacity: 1.0,
            depthTest: false, // 设为 false 让标记始终显示在最上层
        });
        markerMatRef.current = spriteMat;

        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh && child.name === "screen") {
                const mesh = child as THREE.Mesh;
                mesh.material = new THREE.MeshBasicMaterial({
                    map: texture,
                    color: new THREE.Color("white"),
                });
            }

            // 记录按钮初始位置并挂载标记
            if (child.name === "btn_prev" || child.name === "btn_next") {
                child.userData.originalPosition = child.position.clone();
                
                // 防止 React 热更新时重复添加
                if (!child.getObjectByName("interaction_marker")) {
                    const sprite = new THREE.Sprite(spriteMat);
                    sprite.name = "interaction_marker";
                    // 缩放标记大小 (视你模型具体比例微调)
                    sprite.scale.set(0.1, 0.1, 1);
                    // 将标记稍微沿Y轴悬浮于按钮表面之上
                    sprite.position.set(0, 0.05, 0); 
                    child.add(sprite);
                }
            }
        });

        return () => {
            video.pause();
            video.removeAttribute("src");
            video.load();
            texture.dispose();
            
            // 清理标记材质资源
            spriteTex.dispose();
            spriteMat.dispose();
            markerMatRef.current = null;
        };
    }, [scene]);

    // 2. 监听视频切换
    useEffect(() => {
        const video = videoElRef.current;
        if (video && !video.src.endsWith(VIDEO_LIST[videoIndex])) {
            video.src = VIDEO_LIST[videoIndex];
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {});
            }
        }
    }, [videoIndex]);

    // 3. 动画循环：按钮按压物理反馈 + 标记呼吸动画
    useFrame((state, delta) => {
        // 更新呼吸标记的透明度
        if (markerMatRef.current) {
            // 通过 Math.sin 产生 0.2 ~ 0.8 的透明度波动，倍率控制呼吸快慢
            markerMatRef.current.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
        }

        scene.traverse((child) => {
            if (child.name === "btn_prev" || child.name === "btn_next") {
                if (!child.userData.originalPosition) return;

                const isPressed = pressedBtn === child.name;
                const targetYOffset = isPressed ? -0.05 : 0;

                const targetPosition = child.userData.originalPosition.clone();
                targetPosition.y += targetYOffset;

                child.position.lerp(targetPosition, 15 * delta);
            }
        });
    });

    // --- 事件处理 ---

    const handlePointerDown = (e: any) => {
        e.stopPropagation();
        if (e.object.name === "btn_prev" || e.object.name === "btn_next") {
            setPressedBtn(e.object.name);
        }
    };

    const handlePointerUp = (e: any) => {
        e.stopPropagation();
        const meshName = e.object.name;

        if (meshName === "btn_prev" || meshName === "btn_next") {
            setPressedBtn(null);

            if (meshName === "btn_prev") {
                setVideoIndex(
                    (prev) =>
                        (prev - 1 + VIDEO_LIST.length) % VIDEO_LIST.length,
                );
            } else if (meshName === "btn_next") {
                setVideoIndex((prev) => (prev + 1) % VIDEO_LIST.length);
            }
        }
    };

    const handlePointerOver = (e: any) => {
        if (e.object.name === "btn_prev" || e.object.name === "btn_next") {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
        }
    };

    const handlePointerOut = (e: any) => {
        if (e.object.name === "btn_prev" || e.object.name === "btn_next") {
            document.body.style.cursor = "auto";
            if (pressedBtn === e.object.name) {
                setPressedBtn(null);
            }
        }
    };

    return (
        <primitive
            object={scene}
            scale={1}
            position={[0, -1, 0]}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
        />
    );
}

export default function TamagochiScene() {
    return (
        <div className="w-full h-full bg-transparent flex items-center justify-center relative">
            <div style={{ display: "none" }}>
                {VIDEO_LIST.map((src) => (
                    <video
                        key={src}
                        src={src}
                        preload="auto"
                        muted
                        playsInline
                    />
                ))}
            </div>

            <Canvas
                camera={{ position: [0, 4, 0.1], fov: 35 }}
                gl={{ alpha: true, antialias: true }}
            >
                <ambientLight intensity={0.8} />
                <directionalLight
                    position={[5, 10, 5]}
                    intensity={1.5}
                    castShadow
                />
                
                {/* 更改为加载本地 public 目录下的 EXR 环境光文件 */}
                <Environment files="/brown_photostudio_02_1k.exr" />

                <Suspense fallback={null}>
                    <TamagochiModel />
                    <ContactShadows
                        position={[0, -1, 0]}
                        opacity={0.4}
                        scale={10}
                        blur={2}
                        far={4}
                    />
                </Suspense>

                <OrbitControls
                    enablePan={false}
                    enableZoom={false}
                    minDistance={2}
                    maxDistance={10}
                    target={[0, -1, 0]}
                />
            </Canvas>
        </div>
    );
}
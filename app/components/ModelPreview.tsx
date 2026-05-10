"use client";

import { Canvas } from "@react-three/fiber";
import { useGLTF, Stage, PresentationControls, Html, Environment } from "@react-three/drei";
import { Suspense } from "react";

function Model({ url }: { url: string }) {
    // 自动处理加载状态
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
}

export function ModelPreview({ url }: { url: string }) {
    return (
        <div className="w-full h-full bg-[#eaeaea]">
            <Canvas dpr={[1, 2]} camera={{ fov: 50 }} className="bg-transparent">
                <Suspense fallback={<Html center>Loading...</Html>}>
                    <Environment files="/brown_photostudio_02_1k.exr" />

                    {/* Stage 提供自动灯光和阴影环境 */}
                    <Stage
                        environment={null}
                        intensity={0.6}
                        // 解决方案 1: 如果你想开启接触阴影，在新版本中通常这样写：
                        shadows={{ type: "contact", opacity: 0.5 }}
                        // 或者 解决方案 2: 如果不需要特定阴影，直接移除 contactShadow
                        adjustCamera={true}
                    >
                        <PresentationControls
                            speed={1.5}
                            global
                            zoom={1}
                            polar={[-0.1, Math.PI / 4]}
                            rotation={[0, Math.PI / 4, 0]}
                        >
                            <Model url={url} />
                        </PresentationControls>
                    </Stage>
                </Suspense>
            </Canvas>
        </div>
    );
}

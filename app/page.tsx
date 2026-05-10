"use client";

import { useState } from "react";
import Image from "next/image";

import ImageStack from "./components/ImageStack";
import { Canvas } from "@react-three/fiber";

import Header from "./components/layout/header";
import ShowcaseList from "./components/ShowcaseList";
import GPGPUFlowParticles from "./components/canvas/GPGPUFlowParticles";
import PixelVideoProps from "./components/canvas/PixelVideoProps";

export default function Home() {
    const [viewType, setViewType] = useState<"all-works" | "tool-lab">(
        "all-works",
    );

    return (
        <div className="">
            <div className="relative w-full h-[640px] mt-2">
                <GPGPUFlowParticles count={8192} />

                <div className="w-full aspect-16/8.5 max-h-160 bg-[#DBDBDB] px-[4%] flex flex-col justify-end overflow-hidden @container">
                    <div className="w-full gap-[2%] grid grid-cols-[15%_2fr_1fr] items-start justify-between">
                        {/* Logo Icon */}
                        <div className="relative w-full aspect-[3.45/1]">
                            <Image
                                src={"/images/logo-icon.png"}
                                fill
                                alt="badbug.studio"
                                sizes="20vw"
                                priority
                                className="object-contain"
                            />
                        </div>

                        {/* Center Text Section */}
                        <div className="flex items-center w-10/12 h-full overflow-hidden">
                            <div className="w-full">
                                <Image
                                    src={"/images/logo-text.png"}
                                    width={3723}
                                    height={142}
                                    priority
                                    className="w-full h-auto"
                                    alt="badbug.studio"
                                />
                                <section
                                    aria-label="About Badbug"
                                    className="w-full mt-[1%] max-h-[60%] pt-3 overflow-hidden"
                                >
                                    <p className="text-[0.3cqw] leading-none text-justify overflow-hidden">
                                        In the modern web ecosystem, Badbug
                                        functions as a precision-engineered
                                        anomaly, bridging 3D motion design and
                                        procedural generative art. We leverage
                                        Three.js, React Three Fiber, and GLSL
                                        shaders to push the limits of
                                        interactive visuals, blending organic
                                        chaos with mathematical rigor through
                                        GPGPU simulations and physics-based
                                        animation. From the node-based
                                        complexity of Houdini and Redshift to
                                        the seamless integration of TypeScript
                                        and Next.js, every project is a study in
                                        technical art. We don't just render
                                        images; we architect digital behaviors.
                                        Whether exploring 16-bit pixel art or
                                        real-time creative coding, our work
                                        thrives in the microscopic details—a
                                        visual infestation engineering the sting
                                        of the digital media designer's new
                                        frontier.
                                    </p>
                                </section>
                            </div>
                        </div>

                        <div className="w-full gap-[4%] flex items-start justify-between pl-[8%]">
                            <div className="flex flex-col w-full overflow-hidden">
                                <Image
                                    src={"/images/homepage-icon-1.png"}
                                    width={674}
                                    height={144}
                                    priority
                                    className="w-full h-auto"
                                    alt="icon"
                                />
                                <section
                                    aria-label="About Badbug"
                                    className="w-full mt-[5%] overflow-hidden"
                                >
                                    <p className="text-[0.3cqw] leading-none overflow-hidden">
                                        Autonomous Motion. Engineering GLSL
                                        shaders and GPGPU simulations via
                                        Houdini. We craft procedural systems
                                        where algorithmic logic creates
                                        relentless, evolving digital patterns.
                                    </p>
                                </section>
                            </div>
                            <div className="flex flex-col w-full overflow-hidden">
                                <Image
                                    src={"/images/homepage-icon-2.png"}
                                    width={674}
                                    height={144}
                                    priority
                                    className="w-full h-auto"
                                    alt="icon"
                                />
                                <section
                                    aria-label="About Badbug"
                                    className="w-full mt-[5%] overflow-hidden"
                                >
                                    <p className="text-[0.3cqw] leading-none overflow-hidden">
                                        Cinematic Impact. High-fidelity 3D
                                        motion rendered in Redshift. Focused on
                                        physics-based animation and sharp
                                        digital aesthetics that command the
                                        visual landscape.
                                    </p>
                                </section>
                            </div>
                            <div className="flex flex-col w-full overflow-hidden">
                                <Image
                                    src={"/images/homepage-icon-3.png"}
                                    width={674}
                                    height={144}
                                    priority
                                    className="w-full h-auto"
                                    alt="icon"
                                />
                                <section
                                    aria-label="About Badbug"
                                    className="w-full mt-[5%] overflow-hidden"
                                >
                                    <p className="text-[0.3cqw] leading-none overflow-hidden">
                                        Creative Coding. Building immersive
                                        Three.js experiences with React and
                                        TypeScript. We bridge technical art and
                                        full-stack performance to infect the
                                        web.
                                    </p>
                                </section>
                            </div>
                        </div>
                    </div>
                    <div className="w-full">
                        <h1 className="font-heading text-[1.375cqw] leading-none text-justify pt-2">
                            From motion that stings to visuals that linger like
                            venom — we create work that doesn’t ask for
                            attention.
                        </h1>
                    </div>
                </div>

                <div className="w-full h-16 mt-2 px-12">
                    <Canvas camera={{ position: [0, 0, 8] }}>
                        <PixelVideoProps
                            src="/b0230f80072bf4bad0403d83e6a25825_t2.mp4"
                            resX={150}
                            resY={9} // 注意：因为高度只有 h-16，resY 设小一点点看起来更均匀
                            gap={0.4}
                            pixelAspect={1.0} // 强制每个像素矩形为 1:1 正方形
                            pixelScale={1.0} // 如果觉得点与点之间空隙太大，可以用这个放大单个点
                        />
                    </Canvas>
                </div>
            </div>
            <Header activeType={viewType} onTypeChange={setViewType} />

            <div className="mx-12 bg-[#EAEAEA] px-4 py-2">
                {/* 【修改】将 type 属性绑定到 state 变量 viewType */}
                <ShowcaseList type={viewType} />
            </div>
        </div>
    );
}

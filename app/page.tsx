"use client";

import { useState } from "react";
import Image from "next/image";

import ImageStack from "./components/ImageStack";
import { Canvas } from "@react-three/fiber";

import Header from "./components/layout/header";
import WaterfallGallery from "./components/WaterfallGallery";
import ShowcaseList from "./components/ShowcaseList";
import GPGPUFlowParticles from "./components/canvas/GPGPUFlowParticles";
import PixelVideoProps from "./components/canvas/PixelVideoProps";

import CustomIcon from "./components/icons/CustomIcon";
import TextIcon from "./components/icons/TextIcon";

export default function Home() {
    const [viewType, setViewType] = useState<"all-works" | "tool-lab">(
        "all-works",
    );

    return (
        <div className="">
            <div className="relative w-full min-h-dvh flex flex-col justify-between">
                
                <div className="w-full">
                    <Header />
                </div>
                {/* <GPGPUFlowParticles count={8192} /> */}

                <div className="w-full flex flex-col pb-8 items-center justify-center text-[#eaeaea]">
                    <CustomIcon className="w-24 h-16" />
                    <h1 className="font-heading text-[12px] leading-none text-center pt-2 max-w-[320px]">
                        From motion that stings to visuals that linger like
                        venom.
                    </h1>
                    <section aria-label="About Badbug">
                        <p className="text-[5px] pt-2 max-w-90 md:max-w-180 leading-none text-center overflow-hidden">
                            In the modern web ecosystem, Badbug functions as a
                            precision-engineered anomaly, bridging 3D motion
                            design and procedural generative art. We leverage
                            Three.js, React Three Fiber, and GLSL shaders to
                            push the limits of interactive visuals, blending
                            organic chaos with mathematical rigor through GPGPU
                            simulations and physics-based animation. From the
                            node-based complexity of Houdini and Redshift to the
                            seamless integration of TypeScript and Next.js,
                            every project is a study in technical art. We don't
                            just render images; we architect digital behaviors.
                            Whether exploring 16-bit pixel art or real-time
                            creative coding, our work thrives in the microscopic
                            details—a visual infestation engineering the sting
                            of the digital media designer's new frontier.
                        </p>
                    </section>
                </div>
            </div>

            <WaterfallGallery />
            {/* <Header activeType={viewType} onTypeChange={setViewType} /> */}

            {/* <div className="mx-12 bg-[#EAEAEA] p-8">
        <ShowcaseList type={viewType} />
    </div> */}
        </div>
    );
}

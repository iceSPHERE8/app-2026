"use client";

import Image from "next/image";
import SdfHeatmapVideo from "./components/SdfHeatmapVideo";

import { useProjectTracker } from "@/app/hooks/useProjectTracker";

export default function HeatmapPage() {
    useProjectTracker('Bushes-Sport');

    return (
        <main className="bg-[#eaeaea] flex flex-col items-center">
            <div className="relative flex items-center justify-between px-12 w-full z-50 h-10 bg-[#C4C4C4] shrink-0">
                <span className="font-heading text-[#000000] tracking-[0.1em] leading-1 text-md uppercase">
                    BUSHES SPORT-2022/
                </span>
                <button
                    onClick={() => {}}
                    className="relative flex items-center justify-center px-2 py-1 rounded-full border border-[#a1a1a1] text-[11px] leading-none font-table font-black uppercase cursor-pointer bg-gradient-to-b from-[#eaeaea] via-[#e6e6e6] to-[#ababab] text-[#4a4a4a] [text-shadow:0_1px_0_rgba(255,255,255,0.8)] shadow-[inset_0_1px_0_rgba(255,255,255,1),0_1.5px_3px_rgba(0,0,0,0.5)] bg-transparent text-gray-950 transition-all ease-in-out duration-150 outline-none select-none"
                >
                    Back
                </button>
            </div>

            <SdfHeatmapVideo />

            <div className="w-full max-w-[1200px] mt-10 mb-20 bg-black/5 overflow-hidden shadow-sm">
                <video
                    src={"/asics-2025/Dp-play.mp4"}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    className="w-full h-auto pointer-events-none select-none block"
                />
            </div>

            <div className="w-full max-w-[1200px] flex justify-between gap-4">
                <Image
                    src="/asics-2025/asics-01.jpg"
                    alt="ASICS Project 01"
                    width={800}
                    height={800}
                    className="flex-1 w-0 h-auto object-cover"
                />
                <Image
                    src="/asics-2025/asics-02.jpg"
                    alt="ASICS Project 02"
                    width={800}
                    height={800}
                    className="flex-1 w-0 h-auto object-cover"
                />
                <Image
                    src="/asics-2025/asics-03.jpg"
                    alt="ASICS Project 03"
                    width={800}
                    height={800}
                    className="flex-1 w-0 h-auto object-cover"
                />
                <Image
                    src="/asics-2025/asics-04.jpg"
                    alt="ASICS Project 04"
                    width={800}
                    height={800}
                    className="flex-1 w-0 h-auto object-cover"
                />
            </div>

            <div className="w-full max-w-[1200px] mt-10 mb-20 bg-black/5 overflow-hidden shadow-sm">
                <video
                    src={"/asics-2025/mockup-comp-v2.mp4"}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    className="w-full h-auto pointer-events-none select-none block"
                />
            </div>
        </main>
    );
}

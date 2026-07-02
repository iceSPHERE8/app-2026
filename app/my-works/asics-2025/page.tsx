"use client";

import Image from "next/image";
import SdfHeatmapVideo from "./components/SdfHeatmapVideo";

import Header from "../components/Header";

import { useProjectTracker } from "@/app/hooks/useProjectTracker";

export default function HeatmapPage() {
    useProjectTracker("Bushes-Sport");

    return (
        <>
            <Header />
            <main className="bg-[#eaeaea] flex flex-col items-center">
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
        </>
    );
}

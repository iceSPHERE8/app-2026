"use client";

import { useState } from "react";
import TamagochiScene from "./components/tamagochi";
import DancingScene from "./components/dancing";
import ClothScene from "./components/cloth"; // 🌟 引入新的布料场景

import Header from "../components/Header";

import { useProjectTracker } from "@/app/hooks/useProjectTracker";

export default function Page() {
    useProjectTracker("Bushes-Sport");

    const [currentIndex, setCurrentIndex] = useState(0);

    // 🌟 场景总数变更为 3
    const totalScenes = 3;

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < totalScenes - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    return (
        <>
            <Header></Header>
            <main className="h-screen bg-[#eaeaea] overflow-hidden flex flex-col">
                <div className="flex-1 relative w-full overflow-hidden">
                    {currentIndex > 0 && (
                        <button
                            title="prev scene"
                            onClick={handlePrev}
                            className="absolute left-6 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/40 hover:bg-white/80 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer text-gray-800 hover:scale-110 active:scale-95"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 19.5L8.25 12l7.5-7.5"
                                />
                            </svg>
                        </button>
                    )}

                    {currentIndex < totalScenes - 1 && (
                        <button
                            title="next scene"
                            onClick={handleNext}
                            className="absolute right-6 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/40 hover:bg-white/80 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer text-gray-800 hover:scale-110 active:scale-95"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                                />
                            </svg>
                        </button>
                    )}

                    {/* --- 🌟 核心修改区：3 个场景的滑动轨道 --- */}
                    {/* 宽度设为 300% (3个场景)。移动距离改为计算 100/3，即 33.333% */}
                    <div
                        className="w-[300%] h-full flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                        style={{
                            transform: `translateX(-${currentIndex * 33.33333}%)`,
                        }}
                    >
                        {/* 场景 1: 拓麻歌子 (占据轨道的 1/3，即屏幕的 100%) */}
                        <div className="w-1/3 h-full relative">
                            <TamagochiScene />
                        </div>

                        {/* 场景 2: 跳舞小人 */}
                        <div className="w-1/3 h-full relative">
                            <DancingScene />
                        </div>

                        {/* 场景 3: 🌟 互动视频布料 */}
                        <div className="w-1/3 h-full relative">
                            <ClothScene />
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

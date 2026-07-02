"use client";
import type { NextPage } from "next";
// 1. 引入 useEffect
import { useState, useEffect } from "react";

import GenerativeArchitect from "./canvas/GenerativeArchitect";
import ControlPanel, {
    initialControls,
} from "./canvas/components/ControlPanel";

import { useResponsiveControls } from "./canvas/hooks/useResponsiveControls";

import Header from "../layout/Header";

const LandingComponent: NextPage = () => {
    // 2. 调用响应式 Hook
    const { controls: responsiveControls, isMounted } = useResponsiveControls();
    
    // 3. 本地 State，默认先用 initialControls 垫底
    const [controls, setControls] = useState(initialControls);
    const [isUiVisible, setIsUiVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    // 4. 当设备参数检测完毕（或窗口大小改变导致配置切换）时，覆盖本地状态
    useEffect(() => {
        if (isMounted) {
            setControls(responsiveControls);
        }
    }, [responsiveControls, isMounted]);

    const handleCopyEmail = () => {
        const email = "icesphere8@outlook.com";

        navigator.clipboard
            .writeText(email)
            .then(() => {
                if (typeof window !== "undefined" && window.umami) {
                    window.umami.track("复制邮箱");
                }
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch((err) => {
                console.error("复制失败:", err);
            });
    };

    const updateControl = (key: string, value: any) => {
        setControls((prev) => ({ ...prev, [key]: value }));
    };

    const handleNavigateToGallery = (targetCategory: string) => {
        window.dispatchEvent(
            new CustomEvent("updateGalleryCategory", {
                detail: { category: targetCategory },
            }),
        );
        const gallerySection = document.getElementById("waterfall-gallery");
        if (gallerySection) {
            gallerySection.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    const metalPanelClass = `relative flex items-center justify-between px-4 md:px-12 w-full z-50 bg-[#C4C4C4]`;
    const engravedTextClass = `text-gray-950`;
    const buttonClass = `relative flex items-center justify-center px-2 py-1 rounded-full border border-[#a1a1a1] text-[11px] leading-none font-normal uppercase cursor-pointer tracking-widest border-[#a1a1a1] bg-gradient-to-b from-[#eaeaea] via-[#e6e6e6] to-[#ababab] text-[#4a4a4a] [text-shadow:0_1px_0_rgba(255,255,255,0.8)] shadow-[inset_0_1px_0_rgba(255,255,255,1),0_1.5px_3px_rgba(0,0,0,0.5)] hover:-translate-y-px hover:border-blue-900/60 hover:from-blue-100 hover:via-blue-500 hover:to-blue-700 hover:stops-[0%,50%,50%,100%] hover:text-white hover:[text-shadow:0_-1px_0_rgba(0,0,0,0.5)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_8px_4px_-3px_white,inset_0_-3px_6px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.2)] active:translate-y-px active:scale-[0.98] active:from-blue-800 active:to-blue-600 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_1px_1px_rgba(0,0,0,0.1)]`;

    return (
        <>
            <Header />

            <div className="w-full flex flex-col bg-[#eaeaea] font-bold text-gray-950 select-none">
                <main className="h-[640px] w-full bg-[#020204] relative z-0 flex-shrink-0 flex items-center justify-center">
                    {/* 5. 挂载完成后才渲染 Canvas 和 ControlPanel，避免水合闪烁 */}
                    {isMounted ? (
                        <GenerativeArchitect controls={controls} />
                    ) : (
                        <div className="text-white font-normal text-xs uppercase tracking-widest animate-pulse">
                            Initializing Engine...
                        </div>
                    )}
                </main>

                <button
                    onClick={() => setIsUiVisible(!isUiVisible)}
                    className="w-full flex-shrink-0 bg-[#eaeaea] text-black text-[9px] py-1.5 uppercase font-bold tracking-widest transition-colors duration-300 outline-none flex items-center justify-center cursor-pointer"
                >
                    {isUiVisible ? "Hide Control Panel" : "Open Control Panel"}
                </button>

                {isMounted && (
                    <ControlPanel
                        controls={controls}
                        updateControl={updateControl}
                        isUiVisible={isUiVisible}
                    />
                )}

                <footer className={`${metalPanelClass} h-10 flex-shrink-0`}>
                    <div className="flex items-center">
                        <button
                            className={buttonClass}
                            onClick={() => handleNavigateToGallery("tool")}
                        >
                            Tool Lab
                        </button>
                    </div>

                    <div className="hidden md:flex items-center text-center">
                        <span
                            className={`font-normal text-xs tracking-widest uppercase ${engravedTextClass}`}
                        >
                            P5 \ ThreeJS \ Blender \ Houdini
                        </span>
                    </div>

                    <div className="flex items-center text-right gap-12 md:gap-4">
                        <button
                            className={buttonClass}
                            onClick={() => handleNavigateToGallery("all works")}
                        >
                            My Works
                        </button>
                        <div className="flex items-center text-right">
                            <span
                                className={`font-normal text-[10px] md:text-xs tracking-wider uppercase ${engravedTextClass}`}
                            >
                                <span className="hidden sm:inline">
                                    Mail to:{" "}
                                </span>
                                <span
                                    onClick={handleCopyEmail}
                                    title="点击复制"
                                    className="font-bold sm:ml-1 tracking-normal cursor-pointer hover:opacity-70 active:scale-[0.98] transition-all inline-block select-none"
                                >
                                    {copied
                                        ? "COPIED!"
                                        : "icesphere8@outlook.com"}
                                </span>
                            </span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default LandingComponent;
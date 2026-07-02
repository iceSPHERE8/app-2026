"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ShowcaseItem } from "@/types/types";

export const FullScreenViewer = ({
    item,
    originRect,
    onClose,
}: {
    item: ShowcaseItem | null;
    originRect?: DOMRect; // 🔴 接收起点坐标
    onClose: () => void;
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    // 🔴 控制动画的开关状态
    const [isOpened, setIsOpened] = useState(false);

    // Umami 埋点
    useEffect(() => {
        if (!item) return;
        const startTime = Date.now();
        const projectName = item.title || "未命名作品";

        if (typeof window !== "undefined" && window.umami) {
            window.umami.track("查看作品", {
                project: projectName,
                action: "打开弹窗",
            });
        }

        return () => {
            const duration = Math.round((Date.now() - startTime) / 1000);
            if (typeof window !== "undefined" && window.umami && duration > 2) {
                window.umami.track("作品停留", {
                    project: projectName,
                    duration,
                });
            }
        };
    }, [item]);

    // 🔴 监听开启：组件渲染后短暂延迟触发动画
    useEffect(() => {
        if (item) {
            setCurrentIndex(0);
            
            // 双重 requestAnimationFrame 确保 DOM 已经就绪
            let frameId2: number;
            const frameId1 = requestAnimationFrame(() => {
                frameId2 = requestAnimationFrame(() => {
                    setIsOpened(true);
                });
            });

            return () => {
                cancelAnimationFrame(frameId1);
                if (frameId2) cancelAnimationFrame(frameId2);
            };
        } else {
            setIsOpened(false);
        }
    }, [item]);

    // 🔴 延迟关闭逻辑：先执行退场动画，500ms 后再销毁 DOM
    const handleClose = useCallback(() => {
        setIsOpened(false);
        setTimeout(() => {
            onClose();
        }, 500);
    }, [onClose]);

    // 键盘事件适配 handleClose
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!item) return;
            if (e.key === "Escape") handleClose();

            if (item.type === "image-list" && item.imageList) {
                if (e.key === "ArrowLeft") {
                    setCurrentIndex((prev) =>
                        prev > 0 ? prev - 1 : item.imageList!.length - 1,
                    );
                } else if (e.key === "ArrowRight") {
                    setCurrentIndex((prev) =>
                        prev < item.imageList!.length - 1 ? prev + 1 : 0,
                    );
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [item, handleClose]);

    if (!item && !isOpened) return null;

    const isList =
        item?.type === "image-list" &&
        item.imageList &&
        item.imageList.length > 0;

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isList)
            setCurrentIndex((prev) =>
                prev > 0 ? prev - 1 : item!.imageList!.length - 1,
            );
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isList)
            setCurrentIndex((prev) =>
                prev < item!.imageList!.length - 1 ? prev + 1 : 0,
            );
    };

    const formatNumber = (num: number) => String(num).padStart(2, "0");

    // 🔴 核心算法：计算形变基点坐标。若没有提供则默认从屏幕中心放大。
    const originX = originRect
        ? `${originRect.left + originRect.width / 2}px`
        : "50%";
    const originY = originRect
        ? `${originRect.top + originRect.height / 2}px`
        : "50%";

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center transition-[opacity,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isOpened
                    ? "bg-[#050505]/95 backdrop-blur-xl opacity-100"
                    : "bg-transparent backdrop-blur-none opacity-0 pointer-events-none"
            }`}
            onClick={handleClose}
        >
            {/* 🔴 HUD 界面元素容器：延迟出现，提前消失 */}
            <div
                className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${isOpened ? "opacity-100 delay-200" : "opacity-0"}`}
            >
                <div className="absolute top-6 left-6 md:top-8 md:left-8 flex flex-col items-start gap-1 z-50 select-none">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest leading-none">
                            VIEW_
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 border border-white/20 text-white/60 uppercase tracking-widest leading-none">
                            {item?.type}
                        </span>
                    </div>
                    <span className="text-sm md:text-base font-bold tracking-wider text-white uppercase mt-1 leading-none">
                        {item?.title || "UNTITLED WORK"}
                    </span>
                </div>

                <button
                    className="absolute top-6 right-6 md:top-8 md:right-8 flex items-center gap-3 text-white/50 hover:text-black transition-all z-50 group pointer-events-auto cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleClose();
                    }}
                    title="ESC"
                >
                    <span className="font-mono text-[10px] tracking-widest uppercase opacity-0 group-hover:opacity-100 group-hover:text-white transition-opacity translate-x-2 group-hover:translate-x-0">
                        Close
                    </span>
                    <div className="w-10 h-10 flex items-center justify-center border border-white/20 bg-black/40 backdrop-blur group-hover:bg-white group-hover:border-white transition-all">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="square"
                            strokeLinejoin="miter"
                        >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>
                </button>
            </div>

            {/* 🔴 核心媒体容器：根据点击的坐标基点进行位移和缩放 */}
            <div
                className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform transform-gpu`}
                style={{
                    transformOrigin: `${originX} ${originY}`,
                    transform: isOpened
                        ? "scale(1)"
                        : "scale(0.15) translateY(20px)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {item?.type === "image" && item.content && (
                    <img
                        src={item.content}
                        alt="Fullscreen view"
                        // 移除原来的 zoom-in，将动画权限全部交给父容器
                        className="max-w-full max-h-full object-contain shadow-2xl animate-in fade-in duration-300"
                    />
                )}

                {item?.type === "video" && item.content && (
                    <video
                        src={item.content}
                        controls
                        autoPlay
                        className="max-w-full max-h-full outline-none shadow-2xl animate-in fade-in duration-300"
                    />
                )}

                {isList && (
                    <>
                        <img
                            key={currentIndex}
                            src={item!.imageList![currentIndex]}
                            alt={`Fullscreen view ${currentIndex + 1}`}
                            className="max-w-full max-h-full object-contain shadow-2xl animate-in fade-in duration-300"
                        />

                        {item!.imageList!.length > 1 && (
                            <div
                                className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${isOpened ? "opacity-100 delay-200" : "opacity-0"}`}
                            >
                                <button
                                    onClick={handlePrev}
                                    title="prev"
                                    className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 p-3 md:p-4 border border-white/10 bg-black/40 text-white/50 hover:bg-white hover:text-black hover:border-white transition-all backdrop-blur opacity-0 group-hover:opacity-100 pointer-events-auto"
                                >
                                    <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 stroke-[1.5]" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    title="next"
                                    className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 p-3 md:p-4 border border-white/10 bg-black/40 text-white/50 hover:bg-white hover:text-black hover:border-white transition-all backdrop-blur opacity-0 group-hover:opacity-100 pointer-events-auto"
                                >
                                    <ChevronRight className="w-6 h-6 md:w-8 md:h-8 stroke-[1.5]" />
                                </button>

                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center border border-white/10 bg-black/60 backdrop-blur z-50 overflow-hidden pointer-events-auto">
                                    <div className="px-3 py-1.5 bg-white/10 text-white/50 text-[10px] font-mono uppercase tracking-widest border-r border-white/10">
                                        IDX
                                    </div>
                                    <div className="px-4 py-1.5 text-white/90 text-xs font-mono tracking-widest">
                                        {formatNumber(currentIndex + 1)}{" "}
                                        <span className="text-white/30 mx-1">
                                            /
                                        </span>{" "}
                                        {formatNumber(item!.imageList!.length)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

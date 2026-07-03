"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ShowcaseItem } from "@/types/types";

export const FullScreenViewer = ({
    item,
    originRect,
    onClose,
}: {
    item: ShowcaseItem | null;
    originRect?: DOMRect;
    onClose: () => void;
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isOpened, setIsOpened] = useState(false);

    const [isMobile, setIsMobile] = useState(false);

    // 用于记录是否已经向浏览器历史栈推入了状态
    const historyStatePushed = useRef(false);

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

    // 检测移动端
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // 核心关闭逻辑 (支持区分是否来自浏览器的后退事件)
    const closeViewer = useCallback(
        (fromHistory = false) => {
            setIsOpened(false);

            // 如果是手动触发的关闭，且之前推入了 history state，则主动回退一步清理历史栈
            if (!fromHistory && historyStatePushed.current) {
                window.history.back();
            }
            historyStatePushed.current = false;

            // 延迟触发外部销毁，等待动画结束
            setTimeout(() => {
                onClose();
            }, 500);
        },
        [onClose],
    );

    // 监听开启：并处理浏览器 History (移动端返回拦截)
    useEffect(() => {
        if (item) {
            setCurrentIndex(0);

            // 压入虚拟历史记录，用于拦截手机端返回键
            if (!historyStatePushed.current) {
                window.history.pushState({ viewerOpen: true }, "");
                historyStatePushed.current = true;
            }

            let frameId2: number;
            const frameId1 = requestAnimationFrame(() => {
                frameId2 = requestAnimationFrame(() => {
                    setIsOpened(true);
                });
            });

            // 监听手机端/浏览器的物理返回事件
            const handlePopState = () => {
                if (historyStatePushed.current) {
                    historyStatePushed.current = false;
                    closeViewer(true); // 传入 true 代表这是来自 popstate 的触发，无需再执行 history.back()
                }
            };

            window.addEventListener("popstate", handlePopState);

            return () => {
                cancelAnimationFrame(frameId1);
                if (frameId2) cancelAnimationFrame(frameId2);
                window.removeEventListener("popstate", handlePopState);
            };
        } else {
            setIsOpened(false);
        }
    }, [item, closeViewer]);

    // 键盘事件适配
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!item) return;
            if (e.key === "Escape") closeViewer(false);

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
    }, [item, closeViewer]);

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

    const originX = originRect
        ? `${originRect.left + originRect.width / 2}px`
        : "50%";
    const originY = originRect
        ? `${originRect.top + originRect.height / 2}px`
        : "50%";

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-3 transition-[opacity,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isOpened
                    ? "bg-[#050505]/95 backdrop-blur-xl opacity-100"
                    : "bg-transparent opacity-0 pointer-events-none"
            }`}
            onClick={() => closeViewer(false)}
        >
            <div
                className="w-full h-full flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                    transformOrigin: `${originX} ${originY}`,
                    transform: isOpened
                        ? "scale(1)"
                        : "scale(0.15) translateY(20px)",
                }}
            >
                {/* 💡 核心：限制此容器最大高度为窗口高度减去 24px (上下各 12px) */}
                <div
                    className="relative flex items-center justify-center max-w-full max-h-[calc(100vh-24px)] group/media shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 图片处理 */}
                    {(item?.type === "image" || isList) && (
                        <img
                            src={
                                isList
                                    ? item!.imageList![currentIndex]
                                    : item!.content!
                            }
                            alt="Fullscreen view"
                            className="max-w-full max-h-[calc(100vh-24px)] w-auto h-auto object-contain"
                        />
                    )}

                    {/* 💡 核心：视频必须同时限制 max-w 和 max-h，并确保 object-contain 生效 */}
                    {item?.type === "video" && item.content && (
                        <video
                            src={item.content}
                            controls
                            autoPlay
                            muted
                            className="max-w-full max-h-[calc(100vh-24px)] w-auto h-auto object-contain outline-none"
                        />
                    )}

                    {/* 🔴 HUD 元素：内部左上角 (标题信息) */}
                    {!isMobile && (
                        <div
                            className={`absolute w-full top-0 left-0 md:p-4 flex flex-col bg-linear-to-b from-black to-black/0 items-start gap-1 z-50 select-none opacity-0 group-hover/media:opacity-100 transition-opacity duration-300 pointer-events-none`}
                        >
                            <span className="text-sm md:text-base font-bold tracking-wider text-white uppercase mt-1 leading-none drop-shadow-md">
                                {item?.title || "UNTITLED WORK"}
                            </span>

                            <button
                                className="absolute top-2 right-2 z-50 flex items-center justify-center w-10 h-10 text-white hover:text-black transition-all opacity-0 group-hover/media:opacity-100 cursor-pointer pointer-events-auto"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeViewer(false);
                                }}
                                title="Close (ESC)"
                            >
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
                            </button>
                        </div>
                    )}

                    {/* 🔴 HUD 元素：内部右上角 (关闭按钮) */}
                    {isMobile && (
                        <button
                            className="absolute top-4 right-4 z-50 flex items-center rounded-full justify-center w-8 h-8 border border-white/20 bg-black/40 backdrop-blur-md text-white/50 hover:bg-white hover:text-black hover:border-white transition-all opacity-0 group-hover/media:opacity-100 cursor-pointer pointer-events-auto"
                            onClick={(e) => {
                                e.stopPropagation();
                                closeViewer(false);
                            }}
                            title="Close (ESC)"
                        >
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
                        </button>
                    )}

                    {/* 🔴 HUD 元素：列表图控件 (左右切换 & 进度条) */}
                    {isList && item!.imageList!.length > 1 && (
                        <>
                            <button
                                onClick={handlePrev}
                                title="prev"
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 border border-white/10 bg-black/40 text-white/50 hover:bg-white hover:text-black hover:border-white transition-all backdrop-blur opacity-0 group-hover/media:opacity-100 pointer-events-auto"
                            >
                                <ChevronLeft className="w-6 h-6 stroke-[1.5]" />
                            </button>
                            <button
                                onClick={handleNext}
                                title="next"
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 border border-white/10 bg-black/40 text-white/50 hover:bg-white hover:text-black hover:border-white transition-all backdrop-blur opacity-0 group-hover/media:opacity-100 pointer-events-auto"
                            >
                                <ChevronRight className="w-6 h-6 stroke-[1.5]" />
                            </button>

                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center border border-white/10 bg-black/60 backdrop-blur z-50 overflow-hidden pointer-events-auto opacity-0 group-hover/media:opacity-100 transition-opacity duration-300">
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

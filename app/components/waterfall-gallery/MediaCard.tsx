// MediaCard.tsx
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ExternalLink, ChevronLeft, ChevronRight, Images, Maximize2, Play } from "lucide-react";
import { ShowcaseItem } from "@/types/types";

const aspectClassMap: Record<string, string> = {
    "aspect-square": "aspect-square",
    "aspect-video": "aspect-video",
    "aspect-[3/4]": "aspect-[3/4]",
    "aspect-[4/5]": "aspect-[4/5]",
    "aspect-[2/1]": "aspect-[2/1]",
    "aspect-auto": "aspect-auto",
};

export const MediaCard = ({
    item,
    onOpenFullscreen,
}: {
    item: ShowcaseItem;
    onOpenFullscreen: (item: ShowcaseItem, rect?: DOMRect) => void;
}) => {
    const [isLoaded, setIsLoaded] = useState(item.type === "text");
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [videoReady, setVideoReady] = useState(false);

    // 🔴 新增：为每个卡片生成唯一 ID，用于实现“互斥播放”通信
    const cardId = useMemo(() => Math.random().toString(36).substring(2, 9), []);

    const cardRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const aspectClass = aspectClassMap[item.aspectRatio] || "aspect-square";
    const isAutoAspect = aspectClass === "aspect-auto";
    const videoUrl = item.previewVideoUrl || (item.type === "video" ? item.content : null);
    const isInteractiveType = item.type === "3d" || item.type === "glsl" || item.type === "p5";
    const showIframe = isInteractiveType && item.renderMode === "direct";
    const showCover = !isInteractiveType || item.renderMode !== "direct";
    const targetUrl = item.detailLink || (isInteractiveType ? item.content : null);
    const hasLink = !!targetUrl;

    const coverContainerClass = isAutoAspect
        ? "relative w-full transition-opacity duration-500 z-10"
        : "absolute inset-0 w-full h-full transition-opacity duration-500 z-10";

    const sliderImageClass = isAutoAspect
        ? "w-full h-auto object-cover block flex-shrink-0"
        : "w-full h-full object-cover flex-shrink-0";

    const singleMediaClass = isAutoAspect
        ? "w-full h-auto object-cover block"
        : "absolute inset-0 w-full h-full object-cover";

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    useEffect(() => {
        if (item.type !== "image-list" || !item.imageList || item.imageList.length <= 1 || isHovered) return;
        const timer = setInterval(() => {
            setCurrentImgIndex((prev) => prev < item.imageList!.length - 1 ? prev + 1 : 0);
        }, 3000);
        return () => clearInterval(timer);
    }, [item.type, item.imageList, isHovered]);

    // 🔴 新增：全局排他性播放监听。当收到其他卡片播放的广播时，暂停自己
    useEffect(() => {
        const handleGlobalPlay = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail.cardId !== cardId && videoRef.current && !videoRef.current.paused) {
                videoRef.current.pause();
            }
        };
        window.addEventListener("mobileVideoPlay", handleGlobalPlay);
        return () => window.removeEventListener("mobileVideoPlay", handleGlobalPlay);
    }, [cardId]);

    // PC端智能无感自动播放逻辑（保持不变）
    useEffect(() => {
        if (!videoRef.current || !isLoaded || isMobile) return;

        const playObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const video = entry.target as HTMLVideoElement;
                    if (!entry.isIntersecting) {
                        if (!video.paused) video.pause(); 
                        return;
                    }

                    const playThreshold = 0.35;
                    const pauseThreshold = 0.15;
                    let meetsPlayCondition = entry.intersectionRatio >= playThreshold;

                    if (!meetsPlayCondition && entry.rootBounds) {
                        const viewportCoverage = entry.intersectionRect.height / entry.rootBounds.height;
                        if (viewportCoverage > 0.4) meetsPlayCondition = true;
                    }

                    if (meetsPlayCondition) {
                        if (video.paused) video.play().catch(() => {});
                    } else if (entry.intersectionRatio <= pauseThreshold) {
                        if (!video.paused) video.pause();
                    }
                });
            },
            { threshold: Array.from({ length: 11 }, (_, i) => i / 10) }
        );

        playObserver.observe(videoRef.current);
        return () => playObserver.disconnect();
    }, [isMobile, isLoaded]);

    useEffect(() => {
        if (item.type !== "text" && showCover) {
            const hasMedia = videoUrl || item.coverUrl || (item.type === "image" && item.content) || (item.type === "image-list" && item.imageList?.length);
            if (!hasMedia) setIsLoaded(true);
        }
    }, [item.type, showCover, videoUrl, item.coverUrl, item.content, item.imageList]);

    const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (hasLink && targetUrl) {
            if (typeof window !== "undefined" && window.umami) {
                window.umami.track("查看作品", { project: item.title || "未命名作品", action: "页面跳转" });
            }
            window.open(targetUrl, "_blank");
        } else if (item.type === "image" || item.type === "video" || item.type === "image-list") {
            onOpenFullscreen(item, e.currentTarget.getBoundingClientRect());
        }
    };

    const handleIconJump = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (typeof window !== "undefined" && window.umami) window.umami.track("查看作品", { project: item.title || "未命名作品", action: "页面跳转" });
        if (targetUrl) window.open(targetUrl, "_blank");
    };

    const handleCardPrev = (e: React.MouseEvent) => { e.stopPropagation(); if (item.imageList) setCurrentImgIndex((p) => p > 0 ? p - 1 : item.imageList!.length - 1); };
    const handleCardNext = (e: React.MouseEvent) => { e.stopPropagation(); if (item.imageList) setCurrentImgIndex((p) => p < item.imageList!.length - 1 ? p + 1 : 0); };

    return (
        <div ref={cardRef} className={`touch-action-none break-inside-avoid mb-6 w-full block group cursor-pointer`} onClick={handleCardClick} title={item.title || "Media Card"}>
            <div className={`relative overflow-hidden ${aspectClass} w-full bg-[#0a0a0a] ${isAutoAspect ? "min-h-[200px]" : ""}`}>

                {!isLoaded && (
                    <div className="absolute inset-0 z-40 bg-[#1a1a1a] animate-pulse rounded-[2px]" />
                )}

                {showCover && (
                    <div className={`${coverContainerClass} ${isLoaded ? "opacity-100" : "opacity-0"}`}>
                        {item.type === "text" ? (
                            <div className={`w-full relative flex flex-col justify-center items-center text-center p-8 overflow-hidden ${isAutoAspect ? "min-h-[200px]" : "h-full"}`}>
                                {item.textBgUrl && <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen" style={{ backgroundImage: `url(${item.textBgUrl})` }} />}
                                <div className="relative z-10 font-heading text-2xl font-black text-[#eaeaea] uppercase leading-tight">{item.content}</div>
                            </div>
                        ) : videoUrl ? (
                            <>
                                {/* 🔴 已移除左上角 Video Icon */}

                                {/* 手机端未播放时：居中大号播放键 */}
                                {isMobile && !isPlaying && (
                                    <button 
                                        title="Play Video"
                                        className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors z-20 cursor-pointer pointer-events-none"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/90 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                            <Play className="w-5 h-5 ml-1 fill-current" />
                                        </div>
                                    </button>
                                )}

                                {/* 手机端播放时：右上角全屏按钮 */}
                                {isMobile && (
                                    <button
                                        title="Fullscreen"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (cardRef.current) onOpenFullscreen(item, cardRef.current.getBoundingClientRect());
                                        }}
                                        className={`absolute top-2 right-2 z-30 p-1.5 rounded-md bg-black/40 backdrop-blur-md text-white/80 hover:bg-black/80 hover:text-white transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.3)] ${
                                            isPlaying ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
                                        }`}
                                    >
                                        <Maximize2 className="w-3.5 h-3.5" />
                                    </button>
                                )}

                                <video
                                    ref={videoRef}
                                    // 🔴 修复黑屏与跳动：使用 #t=0.001 (0.001秒)，既能100%强制苹果设备预渲染首帧封面，又能规避因为截取中间帧导致的高度/分辨率计算跳跃Bug。
                                    src={isMobile&&isLoaded ? `${videoUrl}#t=0.001` : videoUrl}
                                    muted
                                    loop
                                    playsInline
                                    preload="metadata"
                                    className={singleMediaClass}
                                    onLoadedData={() => setIsLoaded(true)}
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                    onClick={(e) => {
                                        if (isMobile) {
                                            e.stopPropagation();
                                            if (videoRef.current) {
                                                if (videoRef.current.paused) {
                                                    videoRef.current.play().then(() => {
                                                        // 🔴 播放成功后，全局广播“我正在播放”，要求其他卡片暂停
                                                        window.dispatchEvent(new CustomEvent("mobileVideoPlay", { detail: { cardId } }));
                                                    }).catch(() => {});
                                                } else {
                                                    videoRef.current.pause();
                                                }
                                            }
                                        }
                                    }}
                                />
                            </>
                        ) : item.type === "image-list" && item.imageList && item.imageList.length > 0 ? (
                            <div className={`w-full relative group/slider ${isAutoAspect ? "" : "h-full"}`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                                <div className={`w-full overflow-hidden ${isAutoAspect ? "" : "h-full"}`}>
                                    <div className="flex h-full transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentImgIndex * 100}%)` }}>
                                        {item.imageList.map((url, idx) => (
                                            <img
                                                key={idx}
                                                src={url}
                                                alt={`${item.title || "gallery"} - ${idx}`}
                                                decoding="async"
                                                loading="lazy"
                                                className={sliderImageClass}
                                                onLoad={idx === 0 ? () => setIsLoaded(true) : undefined}
                                            />
                                        ))}
                                    </div>
                                </div>
                                {item.imageList.length > 1 && (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-transparent to-black/40 opacity-0 group-hover/slider:opacity-100 transition-opacity pointer-events-none" />
                                        <button title="Previous Image" onClick={handleCardPrev} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white/80 hover:bg-black/80 backdrop-blur opacity-0 group-hover/slider:opacity-100 transition-all z-20"><ChevronLeft className="w-4 h-4" /></button>
                                        <button title="Next Image" onClick={handleCardNext} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white/80 hover:bg-black/80 backdrop-blur opacity-0 group-hover/slider:opacity-100 transition-all z-20"><ChevronRight className="w-4 h-4" /></button>
                                        <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-2 z-20">
                                            {item.imageList.map((_, idx) => (
                                                <button key={idx} title={`Go to image ${idx + 1}`} onClick={(e) => { e.stopPropagation(); setCurrentImgIndex(idx); }} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImgIndex ? "w-4 bg-white shadow-md" : "w-1.5 bg-white/40 hover:bg-white/80"}`} />
                                            ))}
                                        </div>
                                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 z-20"><Images className="w-3 h-3" />{item.imageList.length}</div>
                                    </>
                                )}
                            </div>
                        ) : item.coverUrl || (item.type === "image" && item.content) ? (
                            <img 
                                src={item.coverUrl || item.content} 
                                alt={item.title || "artwork"} 
                                className={singleMediaClass} 
                                decoding="async" 
                                loading="lazy" 
                                onLoad={() => setIsLoaded(true)} 
                            />
                        ) : (
                            <div className={`${isAutoAspect ? "relative min-h-[200px]" : "absolute inset-0 h-full"} w-full flex flex-col items-center justify-center text-zinc-800 bg-[#0a0a0a]`}><span className="text-[10px] uppercase tracking-widest font-bold">NO COVER</span></div>
                        )}

                        {/* PC 端悬停显示全屏按钮 */}
                        {!isMobile && (item.type === "image" || item.type === "video" || item.type === "image-list") && (
                            <button
                                title="Fullscreen"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (cardRef.current) onOpenFullscreen(item, cardRef.current.getBoundingClientRect());
                                }}
                                className="absolute top-2 right-2 z-30 p-1.5 rounded-md bg-black/40 backdrop-blur-md text-white/80 hover:bg-black/80 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                            >
                                <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                )}

                {showIframe && item.content && (
                    <iframe 
                        src={item.content} 
                        title={item.title || "Interactive"} 
                        className={`${isAutoAspect ? "relative min-h-[300px]" : "absolute inset-0 h-full"} w-full border-none z-30 bg-[#0a0a0a]`} 
                        loading="lazy" 
                        sandbox="allow-scripts allow-same-origin" 
                        onLoad={() => setIsLoaded(true)} 
                    />
                )}

                {!showIframe && <div className="absolute inset-0 z-10 pointer-events-auto bg-transparent hover:bg-white/5 transition-colors duration-300 pointer-events-none" />}
            </div>

            {(item.title || hasLink) && (
                <div className="w-full">
                    <div className="text-left w-full overflow-hidden">
                        <div className="flex items-center justify-between w-full pt-1.5 text-[12px] uppercase transition-all duration-300 ease-out rounded-none font-heading text-black">
                            {item.title && <span className="truncate flex-1 pr-2">{item.title}</span>}
                            {hasLink && (
                                <button title="Open Link" onClick={handleIconJump} className="shrink-0 pointer-events-auto flex items-center justify-center hover:opacity-70 transition-opacity">
                                    <ExternalLink className="w-3.5 h-3.5 text-black" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
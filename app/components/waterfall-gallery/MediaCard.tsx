// MediaCard.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExternalLink, ChevronLeft, ChevronRight, Images } from "lucide-react";
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

    const aspectClass = aspectClassMap[item.aspectRatio] || "aspect-square";
    const isAutoAspect = aspectClass === "aspect-auto";
    const videoUrl =
        item.previewVideoUrl || (item.type === "video" ? item.content : null);
    const isInteractiveType =
        item.type === "3d" || item.type === "glsl" || item.type === "p5";
    const showIframe = isInteractiveType && item.renderMode === "direct";
    const showCover = !isInteractiveType || item.renderMode !== "direct";
    const targetUrl =
        item.detailLink || (isInteractiveType ? item.content : null);
    const hasLink = !!targetUrl;

    const coverContainerClass = isAutoAspect
        ? "relative w-full transition-opacity duration-700 z-10"
        : "absolute inset-0 w-full h-full transition-opacity duration-700 z-10";

    const sliderImageClass = isAutoAspect
        ? "w-full h-auto object-cover block flex-shrink-0"
        : "w-full h-full object-cover flex-shrink-0";

    const singleMediaClass = isAutoAspect
        ? "w-full h-auto object-cover block"
        : "absolute inset-0 w-full h-full object-cover";

    useEffect(() => {
        if (
            item.type !== "image-list" ||
            !item.imageList ||
            item.imageList.length <= 1
        )
            return;
        if (isHovered) return;

        const timer = setInterval(() => {
            setCurrentImgIndex((prev) =>
                prev < item.imageList!.length - 1 ? prev + 1 : 0,
            );
        }, 3000);

        return () => clearInterval(timer);
    }, [item.type, item.imageList, isHovered]);

    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!videoRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        videoRef.current?.play().catch(() => {});
                    } else {
                        videoRef.current?.pause();
                    }
                });
            },
            { threshold: 0.1 } 
        );

        observer.observe(videoRef.current);

        return () => observer.disconnect();
    }, [videoUrl]);

    useEffect(() => {
        if (item.type !== "text" && showCover) {
            const hasMedia =
                videoUrl ||
                item.coverUrl ||
                (item.type === "image" && item.content) ||
                (item.type === "image-list" && item.imageList?.length);
            if (!hasMedia) setIsLoaded(true);
        }
    }, [
        item.type,
        showCover,
        videoUrl,
        item.coverUrl,
        item.content,
        item.imageList,
    ]);

    const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const projectName = item.title || "未命名作品";

        if (hasLink && targetUrl) {
            if (typeof window !== "undefined" && window.umami) {
                window.umami.track("查看作品", {
                    project: projectName,
                    action: "页面跳转",
                });
            }
            window.open(targetUrl, "_blank");
        } else if (
            item.type === "image" ||
            item.type === "video" ||
            item.type === "image-list"
        ) {
            const rect = e.currentTarget.getBoundingClientRect();
            onOpenFullscreen(item, rect);
        }
    };

    const handleIconJump = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (typeof window !== "undefined" && window.umami) {
            window.umami.track("查看作品", {
                project: item.title || "未命名作品",
                action: "页面跳转",
            });
        }
        if (targetUrl) window.open(targetUrl, "_blank");
    };

    const handleCardPrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.imageList)
            setCurrentImgIndex((prev) =>
                prev > 0 ? prev - 1 : item.imageList!.length - 1,
            );
    };
    const handleCardNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.imageList)
            setCurrentImgIndex((prev) =>
                prev < item.imageList!.length - 1 ? prev + 1 : 0,
            );
    };

    return (
        <div
            className={`break-inside-avoid mb-6 w-full block group cursor-pointer`}
            onClick={handleCardClick}
        >
            <div
                className={`relative overflow-hidden ${aspectClass} w-full bg-[#0a0a0a] ${isAutoAspect ? "min-h-50" : ""}`}
            >
                {/* 🔴 核心修改：极致简约的纯色加载块 */}
                {!isLoaded && (
                    <div className="absolute inset-0 z-40 bg-[#1a1a1a] animate-pulse rounded-[2px]" />
                )}

                {showCover && (
                    <div
                        className={`${coverContainerClass} ${isLoaded ? "opacity-100" : "opacity-0"}`}
                    >
                        {item.type === "text" ? (
                            <div
                                className={`w-full relative flex flex-col justify-center items-center text-center p-8 overflow-hidden ${isAutoAspect ? "min-h-50" : "h-full"}`}
                            >
                                {item.textBgUrl && (
                                    <div
                                        className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen"
                                        style={{
                                            backgroundImage: `url(${item.textBgUrl})`,
                                        }}
                                    />
                                )}
                                <div className="relative z-10 font-heading text-2xl font-black text-[#eaeaea] uppercase leading-tight">
                                    {item.content}
                                </div>
                            </div>
                        ) : videoUrl ? (
                            <video
                                ref={videoRef}
                                src={videoUrl}
                                muted
                                loop
                                playsInline
                                // 🔴 核心修改：改为 metadata，只加载第一帧和尺寸
                                preload="metadata" 
                                className={`${singleMediaClass} transform-gpu will-change-transform`}
                                onLoadedData={() => setIsLoaded(true)}
                            />
                        ) : item.type === "image-list" &&
                          item.imageList &&
                          item.imageList.length > 0 ? (
                            <div
                                className={`w-full relative group/slider ${isAutoAspect ? "" : "h-full"}`}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            >
                                <div
                                    className={`w-full overflow-hidden ${isAutoAspect ? "" : "h-full"}`}
                                >
                                    <div
                                        className="flex h-full transition-transform duration-500 ease-out"
                                        style={{
                                            transform: `translateX(-${currentImgIndex * 100}%)`,
                                        }}
                                    >
                                        {item.imageList.map((url, idx) => (
                                            <img
                                                key={idx}
                                                src={url}
                                                alt={`${item.title || "gallery"} - ${idx}`}
                                                className={sliderImageClass}
                                                onLoad={
                                                    idx === 0
                                                        ? () =>
                                                              setIsLoaded(true)
                                                        : undefined
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>

                                {item.imageList.length > 1 && (
                                    <>
                                        <div className="absolute inset-0 bg-linear-to-b from-black/0 via-transparent to-black/40 opacity-0 group-hover/slider:opacity-100 transition-opacity pointer-events-none" />

                                        <button
                                            onClick={handleCardPrev}
                                            title="prev"
                                            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white/80 hover:bg-black/80 hover:text-white backdrop-blur opacity-0 group-hover/slider:opacity-100 transition-all z-20"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={handleCardNext}
                                            title="next"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white/80 hover:bg-black/80 hover:text-white backdrop-blur opacity-0 group-hover/slider:opacity-100 transition-all z-20"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>

                                        <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-2 z-20">
                                            {item.imageList.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCurrentImgIndex(idx);
                                                    }}
                                                    title="index"
                                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                                        idx === currentImgIndex
                                                            ? "w-4 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
                                                            : "w-1.5 bg-white/40 hover:bg-white/80"
                                                    }`}
                                                />
                                            ))}
                                        </div>

                                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 z-20">
                                            <Images className="w-3 h-3" />
                                            {item.imageList.length}
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : item.coverUrl ? (
                            <img
                                src={item.coverUrl}
                                alt={item.title || "artwork"}
                                className={singleMediaClass}
                                onLoad={() => setIsLoaded(true)}
                            />
                        ) : item.type === "image" && item.content ? (
                            <img
                                src={item.content}
                                alt={item.title || "artwork"}
                                className={singleMediaClass}
                                onLoad={() => setIsLoaded(true)}
                            />
                        ) : (
                            <div
                                className={`${isAutoAspect ? "relative min-h-50" : "absolute inset-0 h-full"} w-full flex flex-col items-center justify-center text-zinc-800 bg-[#0a0a0a]`}
                            >
                                <span className="text-[10px] uppercase tracking-widest font-bold">
                                    NO COVER
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {showIframe && item.content && (
                    <iframe
                        src={item.content}
                        title={item.title || "Interactive Content"}
                        className={`${isAutoAspect ? "relative min-h-75" : "absolute inset-0 h-full"} w-full border-none z-30 bg-[#0a0a0a]`}
                        loading="lazy"
                        sandbox="allow-scripts allow-same-origin"
                        onLoad={() => setIsLoaded(true)}
                    />
                )}

                {!showIframe && (
                    <div className="absolute inset-0 z-10 pointer-events-auto bg-transparent hover:bg-white/5 transition-colors duration-300" />
                )}
            </div>

            {(item.title || hasLink) && (
                <div className="w-full">
                    <div className="text-left w-full overflow-hidden">
                        <div className="flex items-center justify-between w-full pt-1.5 text-[12px]  uppercase transition-all duration-300 ease-out rounded-none font-heading text-black">
                            {item.title && (
                                <span className="truncate flex-1 pr-2">
                                    {item.title}
                                </span>
                            )}
                            {hasLink && (
                                <button
                                    onClick={handleIconJump}
                                    title="Open Link"
                                    className="shrink-0 pointer-events-auto flex items-center justify-center hover:opacity-70 transition-opacity"
                                >
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
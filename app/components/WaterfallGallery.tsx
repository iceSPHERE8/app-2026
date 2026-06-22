"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { ExternalLink, ChevronDown, ChevronLeft, ChevronRight, Images } from "lucide-react";

// --- 1. 数据类型定义 (新增 image-list 和 imageList 字段) ---
type MediaType = "image" | "image-list" | "video" | "p5" | "glsl" | "3d" | "text";
type RenderMode = "cover" | "direct";

interface ShowcaseItem {
    id: string;
    createdAt?: string;
    title?: string;
    description?: string;
    detailLink?: string;
    type: MediaType;
    category?: string;
    content?: string;
    imageList?: string[]; // 新增：存储多图URL的数组
    coverUrl?: string;
    previewVideoUrl?: string;
    aspectRatio: string;
    renderMode?: RenderMode;
    textBgUrl?: string;
    updatedAt?: string;
}

const aspectClassMap: Record<string, string> = {
    "aspect-square": "aspect-square",
    "aspect-video": "aspect-video",
    "aspect-[3/4]": "aspect-[3/4]",
    "aspect-[4/5]": "aspect-[4/5]",
    "aspect-[2/1]": "aspect-[2/1]",
    "aspect-auto": "aspect-auto",
};

// --- 2. 全屏媒体查看器组件 (升级为支持轮播) ---
const FullScreenViewer = ({
    item,
    onClose,
}: {
    item: ShowcaseItem | null;
    onClose: () => void;
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // 当打开新的 item 时，重置索引
    useEffect(() => {
        setCurrentIndex(0);
    }, [item]);

    // 支持键盘左右键切换
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!item || item.type !== "image-list" || !item.imageList) return;
            if (e.key === "ArrowLeft") {
                setCurrentIndex((prev) => (prev > 0 ? prev - 1 : item.imageList!.length - 1));
            } else if (e.key === "ArrowRight") {
                setCurrentIndex((prev) => (prev < item.imageList!.length - 1 ? prev + 1 : 0));
            } else if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [item, onClose]);

    if (!item) return null;

    const isList = item.type === "image-list" && item.imageList && item.imageList.length > 0;

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isList) setCurrentIndex((prev) => (prev > 0 ? prev - 1 : item.imageList!.length - 1));
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isList) setCurrentIndex((prev) => (prev < item.imageList!.length - 1 ? prev + 1 : 0));
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-8 transition-all duration-300"
            onClick={onClose}
        >
            {/* 关闭按钮 */}
            <button
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-50"
                onClick={onClose}
                title="close"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>

            <div className="relative w-full h-full flex items-center justify-center group" onClick={(e) => e.stopPropagation()}>
                {/* 单图渲染 */}
                {item.type === "image" && item.content && (
                    <img src={item.content} alt="Fullscreen view" className="max-w-full max-h-full object-contain animate-in fade-in zoom-in duration-300" />
                )}

                {/* 视频渲染 */}
                {item.type === "video" && item.content && (
                    <video src={item.content} controls autoPlay className="max-w-full max-h-full outline-none animate-in fade-in zoom-in duration-300" />
                )}

                {/* --- 多图轮播渲染 --- */}
                {isList && (
                    <>
                        <img 
                            key={currentIndex} // 使用 key 强制重新挂载触发动画
                            src={item.imageList![currentIndex]} 
                            alt={`Fullscreen view ${currentIndex + 1}`} 
                            className="max-w-full max-h-full object-contain animate-in fade-in duration-300" 
                        />
                        
                        {/* 左右切换按钮 */}
                        {item.imageList!.length > 1 && (
                            <>
                                <button onClick={handlePrev} title="prev" className="absolute left-4 md:left-12 p-3 rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/80 transition-all backdrop-blur opacity-0 group-hover:opacity-100">
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                                <button onClick={handleNext} title="nex" className="absolute right-4 md:right-12 p-3 rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/80 transition-all backdrop-blur opacity-0 group-hover:opacity-100">
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                                
                                {/* 底部指示器 */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur text-white/80 text-xs font-mono tracking-widest">
                                    {currentIndex + 1} / {item.imageList!.length}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// --- 3. 拟物化下拉菜单组件 (保持不变) ---
const SkeuomorphicDropdown = ({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (val: string) => void; }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative flex flex-col items-start" ref={dropdownRef}>
            <span className="text-[#000000] font-heading text-[10px] pl-0.5 tracking-widest">{label}</span>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`relative flex items-center justify-between min-w-[120px] px-2 py-1 rounded-full border border-[#a1a1a1] text-[11px] leading-none font-table font-black uppercase transition-all ease-in-out duration-150 cursor-pointer ${
                        isOpen ? "translate-y-[1px] bg-gradient-to-b from-[#c4c4c4] via-[#d4d4d4] to-[#e6e6e6] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.3),0_0px_0px_rgba(0,0,0,0)] text-[#333333]"
                               : "bg-gradient-to-b from-[#ffffff] via-[#e6e6e6] to-[#ababab] text-[#4a4a4a] [text-shadow:0_1px_0_rgba(255,255,255,0.8)] shadow-[inset_0_1px_0_rgba(255,255,255,1),0_1.5px_3px_rgba(0,0,0,0.3)] hover:from-[#ffffff] hover:via-[#f0f0f0] hover:to-[#e0e0e0] hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_2px_4px_rgba(0,0,0,0.4)]"
                    }`}
                >
                    <span>{value}</span>
                    <ChevronDown className={`w-3 h-3 ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`} />
                </button>
                {isOpen && (
                    <div className="absolute top-full left-0 mt-1.5 w-full min-w-[120px] z-50 bg-gradient-to-b from-[#f5f5f5] to-[#d4d4d4] border border-[#a1a1a1] rounded-[4px] shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.9)] overflow-hidden p-1 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        {options.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => { onChange(opt); setIsOpen(false); }}
                                className={`w-full text-left px-2 py-1.5 rounded-[3px] text-[10px] font-table font-black uppercase transition-all duration-150 ${
                                    value === opt ? "bg-[#c4c4c4] text-[#333333] shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]" : "text-[#5a5a5a] hover:bg-white/60 hover:text-[#222222]"
                                }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 4. 渲染单个卡片组件 ---
const MediaCard = ({
    item,
    onOpenFullscreen,
}: {
    item: ShowcaseItem;
    onOpenFullscreen: (item: ShowcaseItem) => void;
}) => {
    // 用于控制整体卡片骨架屏加载状态（以第一张图加载为准）
    const [isLoaded, setIsLoaded] = useState(item.type === "text");
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    // 记录鼠标是否悬停在卡片上，用于控制自动播放的暂停与恢复
    const [isHovered, setIsHovered] = useState(false);

    const aspectClass = aspectClassMap[item.aspectRatio] || "aspect-square";
    const isAutoAspect = aspectClass === "aspect-auto";

    const videoUrl = item.previewVideoUrl || (item.type === "video" ? item.content : null);
    const isInteractiveType = item.type === "3d" || item.type === "glsl" || item.type === "p5";
    const showIframe = isInteractiveType && item.renderMode === "direct";
    const showCover = !isInteractiveType || item.renderMode !== "direct";

    const targetUrl = item.detailLink || (isInteractiveType ? item.content : null);
    const hasLink = !!targetUrl;

    // --- CSS 类名推导 ---
    const coverContainerClass = isAutoAspect
        ? "relative w-full transition-opacity duration-700 z-10" 
        : "absolute inset-0 w-full h-full transition-opacity duration-700 z-10";

    // 用于滑动轨道的图片样式
    const sliderImageClass = isAutoAspect
        ? "w-full h-auto object-cover block flex-shrink-0" // auto 模式下依靠图片高度撑开
        : "w-full h-full object-cover flex-shrink-0";      // 固定比例模式下填满轨道高度

    // --- Effect: 自动轮播 (时间延长到 3s) ---
    useEffect(() => {
        if (item.type !== "image-list" || !item.imageList || item.imageList.length <= 1) return;
        if (isHovered) return;

        const timer = setInterval(() => {
            setCurrentImgIndex((prev) => 
                prev < item.imageList!.length - 1 ? prev + 1 : 0
            );
        }, 3000); // 1.5s -> 3s

        return () => clearInterval(timer);
    }, [item.type, item.imageList, isHovered]);

    // 处理骨架屏加载状态
    useEffect(() => {
        if (item.type !== "text" && showCover) {
            const hasMedia = videoUrl || item.coverUrl || (item.type === "image" && item.content) || (item.type === "image-list" && item.imageList?.length);
            if (!hasMedia) setIsLoaded(true);
        }
    }, [item.type, showCover, videoUrl, item.coverUrl, item.content, item.imageList]);

    // --- 交互操作 ---
    const handleCardClick = () => {
        if (hasLink && targetUrl) {
            window.open(targetUrl, "_blank");
        } else if (item.type === "image" || item.type === "video" || item.type === "image-list") {
            onOpenFullscreen(item);
        }
    };

    const handleIconJump = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (targetUrl) window.open(targetUrl, "_blank");
    };

    const handleCardPrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.imageList) setCurrentImgIndex((prev) => (prev > 0 ? prev - 1 : item.imageList!.length - 1));
    };
    const handleCardNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.imageList) setCurrentImgIndex((prev) => (prev < item.imageList!.length - 1 ? prev + 1 : 0));
    };

    return (
        <div className={`break-inside-avoid mb-6 w-full block group cursor-pointer`} onClick={handleCardClick}>
            <div className={`relative overflow-hidden ${aspectClass} w-full bg-[#0a0a0a] ${isAutoAspect ? 'min-h-[200px]' : ''}`}>
                
                {!isLoaded && (
                    <div className="absolute inset-0 z-40 bg-white/5 animate-pulse flex flex-col items-center justify-center">
                        <div className="w-8 h-px bg-white/20 mb-2"></div>
                        <span className="font-mono text-[10px] text-white/30 tracking-widest uppercase">{item.type}</span>
                    </div>
                )}

                {showCover && (
                    <div className={`${coverContainerClass} ${isLoaded ? "opacity-100" : "opacity-0"}`}>
                        {item.type === "text" ? (
                            <div className={`w-full relative flex flex-col justify-center items-center text-center p-8 overflow-hidden ${isAutoAspect ? 'min-h-[200px]' : 'h-full'}`}>
                                {item.textBgUrl && (
                                    <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen" style={{ backgroundImage: `url(${item.textBgUrl})` }} />
                                )}
                                <div className="relative z-10 font-heading text-2xl font-black text-[#eaeaea] uppercase leading-tight">{item.content}</div>
                            </div>
                        ) : videoUrl ? (
                            <video src={videoUrl} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" onLoadedData={() => setIsLoaded(true)} />
                        ) : item.type === "image-list" && item.imageList && item.imageList.length > 0 ? (
                            // --- 修改点：图集轮播修改为左右滑动结构 ---
                            <div 
                                className={`w-full relative group/slider ${isAutoAspect ? '' : 'h-full'}`}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            >
                                {/* 裁剪视口 */}
                                <div className={`w-full overflow-hidden ${isAutoAspect ? '' : 'h-full'}`}>
                                    {/* 滑动轨道：增加平滑的 Transition */}
                                    <div 
                                        className="flex h-full transition-transform duration-500 ease-out"
                                        style={{ transform: `translateX(-${currentImgIndex * 100}%)` }}
                                    >
                                        {item.imageList.map((url, idx) => (
                                            <img 
                                                key={idx} // 这里 key 用索引，因为图片是常驻的，不需要根据索引重载
                                                src={url} 
                                                alt={`${item.title || "gallery"} - ${idx}`} 
                                                className={sliderImageClass}
                                                // 仅当第一张图加载时宣告整体卡片加载完成
                                                onLoad={idx === 0 ? () => setIsLoaded(true) : undefined} 
                                            />
                                        ))}
                                    </div>
                                </div>
                                
                                {/* 左右切换按钮 (保持原样) */}
                                {item.imageList.length > 1 && (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-transparent to-black/40 opacity-0 group-hover/slider:opacity-100 transition-opacity pointer-events-none" />
                                        
                                        <button onClick={handleCardPrev} title="prev" className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white/80 hover:bg-black/80 hover:text-white backdrop-blur opacity-0 group-hover/slider:opacity-100 transition-all z-20">
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button onClick={handleCardNext} title="next" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white/80 hover:bg-black/80 hover:text-white backdrop-blur opacity-0 group-hover/slider:opacity-100 transition-all z-20">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>

                                        {/* 修改点：底部小点点 UI，bottom-3 修改为 bottom-6，位置上调 */}
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
                            <img src={item.coverUrl} alt={item.title || "artwork"} className="absolute inset-0 w-full h-full object-cover" onLoad={() => setIsLoaded(true)} />
                        ) : item.type === "image" && item.content ? (
                            <img src={item.content} alt={item.title || "artwork"} className="absolute inset-0 w-full h-full object-cover" onLoad={() => setIsLoaded(true)} />
                        ) : (
                            <div className={`${isAutoAspect ? 'relative min-h-[200px]' : 'absolute inset-0 h-full'} w-full flex flex-col items-center justify-center text-zinc-800 bg-[#0a0a0a]`}>
                                <span className="text-[10px] uppercase tracking-widest font-bold">NO COVER</span>
                            </div>
                        )}
                    </div>
                )}

                {showIframe && item.content && (
                    <iframe src={item.content} title={item.title || "Interactive Content"} className={`${isAutoAspect ? 'relative min-h-75' : 'absolute inset-0 h-full'} w-full border-none z-30 bg-[#0a0a0a]`} loading="lazy" sandbox="allow-scripts allow-same-origin" onLoad={() => setIsLoaded(true)} />
                )}

                {!showIframe && <div className="absolute inset-0 z-10 pointer-events-auto bg-transparent hover:bg-white/5 transition-colors duration-300" />}
            </div>

            {(item.title || hasLink) && (
                <div className="w-full">
                    <div className="text-left w-full overflow-hidden">
                        <div className="flex items-center justify-between w-full px-3 py-1.5 font-heading text-[12px] font-bold tracking-wide uppercase transition-all duration-300 ease-out bg-[#C4C4C4] rounded-none text-black">
                            {item.title && <span className="truncate flex-1 pr-2">{item.title}</span>}
                            {hasLink && (
                                <button onClick={handleIconJump} title="Open Link" className="shrink-0 pointer-events-auto flex items-center justify-center hover:opacity-70 transition-opacity">
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

// --- 5. 主瀑布流组件 ---
export default function WaterfallGallery() {
    const [items, setItems] = useState<ShowcaseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeMedia, setActiveMedia] = useState<ShowcaseItem | null>(null);
    const [visibleCount, setVisibleCount] = useState(24);

    const [categoryFilter, setCategoryFilter] = useState("all works");
    const [mediaFilter, setMediaFilter] = useState("all works");

    const categories = ["all works", "project", "practice", "tool"];
    const mediaTypes = ["all works", "video", "interactive coding", "image"];

    useEffect(() => {
        const fetchWorks = async () => {
            try {
                const res = await fetch("/api/admin/get-data?type=all-works");
                if (res.ok) {
                    const data: ShowcaseItem[] = await res.json();
                    const shuffledData = data.sort(() => Math.random() - 0.5);
                    setItems(shuffledData);
                }
            } catch (error) {
                console.error("获取作品数据失败:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWorks();
    }, []);

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 12);
    };

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchCategory = categoryFilter === "all works" || item.category === categoryFilter;

            let matchMedia = true;
            if (mediaFilter === "video") {
                matchMedia = item.type === "video";
            } else if (mediaFilter === "image") {
                // 修改此处：当筛选 "image" 时，同时匹配单图和多图列表
                matchMedia = item.type === "image" || item.type === "image-list";
            } else if (mediaFilter === "interactive coding") {
                matchMedia = ["p5", "glsl", "3d"].includes(item.type);
            }

            return matchCategory && matchMedia;
        });
    }, [items, categoryFilter, mediaFilter]);

    const visibleItems = filteredItems.slice(0, visibleCount);

    if (loading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center">
                <div className="font-mono text-white/50 text-sm animate-pulse uppercase tracking-widest">
                    SYSTEM.LOADING() ...
                </div>
            </div>
        );
    }

    return (
        <>
            <section className="w-full min-h-screen px-4 md:px-8 py-12 flex flex-col items-center">
                {/* --- 顶部过滤器面板 --- */}
                <div className="w-full flex flex-wrap justify-start border-[#8b8b8b] pb-4 items-end gap-9 select-none">
                    <SkeuomorphicDropdown
                        label="(by Category:"
                        options={categories}
                        value={categoryFilter}
                        onChange={(val) => {
                            setCategoryFilter(val);
                            setVisibleCount(24);
                        }}
                    />

                    <SkeuomorphicDropdown
                        label="(by Media:"
                        options={mediaTypes}
                        value={mediaFilter}
                        onChange={(val) => {
                            setMediaFilter(val);
                            setVisibleCount(24);
                        }}
                    />

                    <div className="ml-auto font-heading tracking-wide text-[32px] text-[#000000] leading-none">
                        ({filteredItems.length})
                    </div>
                </div>

                {/* --- 画廊主体 --- */}
                {filteredItems.length > 0 ? (
                    <div className="w-full columns-2 sm:columns-2 lg:columns-4 xl:columns-5 gap-6 transition-all duration-500">
                        {visibleItems.map((item) => (
                            <MediaCard
                                key={item.id}
                                item={item}
                                onOpenFullscreen={setActiveMedia}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-[#a1a1a1] font-mono text-xs uppercase tracking-widest w-full text-left">
                        NO RESULTS FOUND FOR CURRENT FILTERS.
                    </div>
                )}

                {visibleCount < filteredItems.length && (
                    <button
                        onClick={handleLoadMore}
                        className="mt-12 px-8 py-3 bg-transparent border border-white/20 text-white/70 font-mono text-xs uppercase tracking-widest hover:border-white/60 hover:text-white hover:bg-white/5 transition-all duration-300"
                    >
                        [ Load More Algorithms ]
                    </button>
                )}
            </section>

            <FullScreenViewer
                item={activeMedia}
                onClose={() => setActiveMedia(null)}
            />
        </>
    );
}
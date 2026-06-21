"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { ExternalLink, ChevronDown } from "lucide-react";

// --- 1. 数据类型定义 ---
type MediaType = "image" | "video" | "p5" | "glsl" | "3d" | "text";
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

// --- 2. 全屏媒体查看器组件 ---
const FullScreenViewer = ({
    item,
    onClose,
}: {
    item: ShowcaseItem | null;
    onClose: () => void;
}) => {
    if (!item) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-8 transition-all duration-300"
            onClick={onClose}
        >
            <button
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-50"
                onClick={onClose}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>

            <div
                className="relative w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                {item.type === "image" && item.content && (
                    <img
                        src={item.content}
                        alt="Fullscreen view"
                        className="max-w-full max-h-full object-contain animate-in fade-in zoom-in duration-300"
                    />
                )}
                {item.type === "video" && item.content && (
                    <video
                        src={item.content}
                        controls
                        autoPlay
                        className="max-w-full max-h-full outline-none animate-in fade-in zoom-in duration-300"
                    />
                )}
            </div>
        </div>
    );
};

// --- 3. 拟物化下拉菜单组件 (新增) ---
const SkeuomorphicDropdown = ({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: string[];
    value: string;
    onChange: (val: string) => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 点击外部关闭下拉菜单
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative flex flex-col items-start" ref={dropdownRef}>
            {/* 将 Label 移至上方，调小字体，并增加下方间距 */}
            <span className="text-[#000000] font-heading text-[10px] pl-0.5 tracking-widest">
                {label}
            </span>

            <div className="relative">
                {/* 触发按钮 (微缩版金属按键质感) */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        relative flex items-center justify-between min-w-[120px]
                        px-2 py-1 rounded-full border border-[#a1a1a1]
                        text-[11px] leading-none font-table font-black uppercase transition-all ease-in-out duration-150 cursor-pointer
                        ${
                            isOpen
                                ? "translate-y-[1px] bg-gradient-to-b from-[#c4c4c4] via-[#d4d4d4] to-[#e6e6e6] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.3),0_0px_0px_rgba(0,0,0,0)] text-[#333333]"
                                : "bg-gradient-to-b from-[#ffffff] via-[#e6e6e6] to-[#ababab] text-[#4a4a4a] [text-shadow:0_1px_0_rgba(255,255,255,0.8)] shadow-[inset_0_1px_0_rgba(255,255,255,1),0_1.5px_3px_rgba(0,0,0,0.3)] hover:from-[#ffffff] hover:via-[#f0f0f0] hover:to-[#e0e0e0] hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_2px_4px_rgba(0,0,0,0.4)]"
                        }
                    `}
                >
                    <span>{value}</span>
                    <ChevronDown
                        className={`w-3 h-3 ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
                    />
                </button>

                {/* 下拉面板 (更紧凑的金属凹槽/浮雕面板质感) */}
                {isOpen && (
                    <div
                        className="
                        absolute top-full left-0 mt-1.5 w-full min-w-[120px] z-50
                        bg-gradient-to-b from-[#f5f5f5] to-[#d4d4d4] 
                        border border-[#a1a1a1] rounded-[4px] 
                        shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.9)]
                        overflow-hidden p-1 flex flex-col gap-0.5
                        animate-in fade-in slide-in-from-top-1 duration-200
                    "
                    >
                        {options.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => {
                                    onChange(opt);
                                    setIsOpen(false);
                                }}
                                className={`
                                    w-full text-left px-2 py-1.5 rounded-[3px]
                                    text-[10px] font-table font-black uppercase transition-all duration-150
                                    ${
                                        value === opt
                                            ? "bg-[#c4c4c4] text-[#333333] shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
                                            : "text-[#5a5a5a] hover:bg-white/60 hover:text-[#222222]"
                                    }
                                `}
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
    const [isLoaded, setIsLoaded] = useState(item.type === "text");

    const aspectClass = aspectClassMap[item.aspectRatio] || "aspect-square";
    const videoUrl =
        item.previewVideoUrl || (item.type === "video" ? item.content : null);

    const isInteractiveType =
        item.type === "3d" || item.type === "glsl" || item.type === "p5";

    const showIframe = isInteractiveType && item.renderMode === "direct";
    const showCover = !isInteractiveType || item.renderMode !== "direct";

    const targetUrl =
        item.detailLink || (isInteractiveType ? item.content : null);
    const hasLink = !!targetUrl;

    useEffect(() => {
        if (item.type !== "text" && showCover) {
            const hasMedia =
                videoUrl ||
                item.coverUrl ||
                (item.type === "image" && item.content);
            if (!hasMedia) {
                setIsLoaded(true);
            }
        }
    }, [item.type, showCover, videoUrl, item.coverUrl, item.content]);

    const handleCardClick = () => {
        if (hasLink && targetUrl) {
            window.open(targetUrl, "_blank");
        } else if (item.type === "image" || item.type === "video") {
            onOpenFullscreen(item);
        }
    };

    const handleIconJump = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (targetUrl) window.open(targetUrl, "_blank");
    };

    return (
        <div
            className={`break-inside-avoid mb-6 w-full block group cursor-pointer`}
            onClick={handleCardClick}
        >
            <div className={`relative overflow-hidden ${aspectClass} w-full`}>
                {!isLoaded && (
                    <div className="absolute inset-0 z-40 bg-white/45 animate-pulse flex flex-col items-center justify-center">
                        <div className="w-8 h-px bg-white/20 mb-2"></div>
                        <span className="font-mono text-[10px] text-white/30 tracking-widest uppercase">
                            {item.type}
                        </span>
                    </div>
                )}

                {showCover && (
                    <div
                        className={`absolute inset-0 w-full h-full bg-[#0a0a0a] transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"} z-10`}
                    >
                        {item.type === "text" ? (
                            <div className="w-full h-full relative flex flex-col justify-center items-center text-center p-8 overflow-hidden">
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
                                src={videoUrl}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                                onLoadedData={() => setIsLoaded(true)}
                            />
                        ) : item.coverUrl ? (
                            <img
                                src={item.coverUrl}
                                alt={item.title || "artwork"}
                                className="absolute inset-0 w-full h-full object-cover"
                                onLoad={() => setIsLoaded(true)}
                            />
                        ) : item.type === "image" && item.content ? (
                            <img
                                src={item.content}
                                alt={item.title || "artwork"}
                                className="absolute inset-0 w-full h-full object-cover"
                                onLoad={() => setIsLoaded(true)}
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-800 bg-[#0a0a0a]">
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
                        className="absolute inset-0 w-full h-full border-none z-30 bg-[#0a0a0a]"
                        loading="lazy"
                        sandbox="allow-scripts allow-same-origin"
                        onLoad={() => setIsLoaded(true)}
                    />
                )}

                {!showIframe && (
                    <div className="absolute inset-0 z-20 pointer-events-auto bg-transparent hover:bg-white/5 transition-colors duration-300" />
                )}
            </div>

            {(item.title || hasLink) && (
                <div className="w-full">
                    <div className="text-left w-full overflow-hidden">
                        <div
                            className="
                            /* 1. 基础布局与排版 (将 block 改为 flex 容纳按钮) */
                            flex items-center justify-between w-full px-3 py-1.5 
                            font-heading text-[12px] font-bold tracking-wide uppercase
                            transition-all duration-300 ease-out
                            
                            /* 2. 锐利边缘与边框 (无圆角) */
                            rounded-none
                            
                            /* 3. 银灰金属渐变底色 (哑光拉丝感) */
                            bg-gradient-to-b from-[#e8e8e8] via-[#cccccc] to-[#999999]
                            
                            /* 4. 凹陷的雕刻文字效果 */
                            text-[#333333]
                            [text-shadow:0_1px_0_rgba(255,255,255,0.85)]
                            
                            /* 5. 铭牌 3D 物理阴影:
                            - inset_0_1px_0_#fff: 顶部的锋利高光
                            - inset_0_-1px_0_rgba(0,0,0,0.1): 底部的微弱暗部收边
                            - 0_2px_4px_rgba(0,0,0,0.3): 铭牌本身的投影
                            */
                            shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.3)]
                            
                            /* 6. 悬停交互 (配合父级的 group): 擦亮并微微浮起 */
                            group-hover:from-[#ffffff] group-hover:via-[#dcdcdc] group-hover:to-[#a6a6a6]
                            group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.35)]
                            group-hover:-translate-y-[1px]
                            "
                        >
                            {/* 标题文本单独用 span 包裹并加上 truncate 防溢出 */}
                            {item.title && (
                                <span className="truncate flex-1 pr-2">
                                    {item.title}
                                </span>
                            )}

                            {/* 跳转按钮直接集成在金属牌内部 */}
                            {hasLink && (
                                <button
                                    onClick={handleIconJump}
                                    title="Open Link"
                                    className="flex-shrink-0 pointer-events-auto flex items-center justify-center hover:opacity-70 transition-opacity"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 text-[#333333] drop-shadow-[0_1px_0_rgba(255,255,255,0.85)]" />
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
            const matchCategory =
                categoryFilter === "all works" ||
                item.category === categoryFilter;

            let matchMedia = true;
            if (mediaFilter === "video") {
                matchMedia = item.type === "video";
            } else if (mediaFilter === "image") {
                matchMedia = item.type === "image";
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

                    {/* --- 新增：右对齐的总计数量 (通过 ml-auto 实现) --- */}
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

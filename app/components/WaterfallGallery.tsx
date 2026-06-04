"use client";

import React, { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react"; 

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
    onClose 
}: { 
    item: ShowcaseItem | null; 
    onClose: () => void 
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
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            
            <div 
                className="relative w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                {item.type === 'image' && item.content && (
                    <img src={item.content} alt="Fullscreen view" className="max-w-full max-h-full object-contain animate-in fade-in zoom-in duration-300" />
                )}
                {item.type === 'video' && item.content && (
                    <video src={item.content} controls autoPlay className="max-w-full max-h-full outline-none animate-in fade-in zoom-in duration-300" />
                )}
            </div>
        </div>
    );
};

// --- 3. 渲染单个卡片组件 ---
const MediaCard = ({ 
    item, 
    onOpenFullscreen 
}: { 
    item: ShowcaseItem; 
    onOpenFullscreen: (item: ShowcaseItem) => void 
}) => {
    const [isLoaded, setIsLoaded] = useState(item.type === "text");
    
    const aspectClass = aspectClassMap[item.aspectRatio] || "aspect-square";
    const videoUrl = item.previewVideoUrl || (item.type === "video" ? item.content : null);
    
    const isInteractiveType = item.type === "3d" || item.type === "glsl" || item.type === "p5";
    
    // 由后台的 renderMode 直接决定是否挂载 iframe
    const showIframe = isInteractiveType && item.renderMode === "direct";
    const showCover = !isInteractiveType || item.renderMode !== "direct";

    const targetUrl = item.detailLink || (isInteractiveType ? item.content : null);
    const hasLink = !!targetUrl;

    // 兜底设计：如果卡片设置了封面模式，但后台并没有上传图片或视频，强制解除骨架屏状态
    useEffect(() => {
        if (item.type !== "text" && showCover) {
            const hasMedia = videoUrl || item.coverUrl || (item.type === "image" && item.content);
            if (!hasMedia) {
                setIsLoaded(true);
            }
        }
    }, [item.type, showCover, videoUrl, item.coverUrl, item.content]);

    const handleCardClick = () => {
        if (showIframe) return; // iframe 模式下，将点击权限交给内部程序
        
        if (item.detailLink) {
            window.open(item.detailLink, '_blank');
        } else if (item.type === 'image' || item.type === 'video') {
            onOpenFullscreen(item);
        }
    };

    const handleIconJump = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (targetUrl) window.open(targetUrl, '_blank');
    };

    return (
        <div 
            className={`break-inside-avoid mb-6 relative overflow-hidden ${aspectClass} w-full block group ${!showIframe ? 'cursor-pointer' : ''}`}
            onClick={handleCardClick}
        >
            {/* --- 骨架屏 (Skeleton) 层 --- */}
            {!isLoaded && (
                <div className="absolute inset-0 z-40 bg-white/5 animate-pulse flex flex-col items-center justify-center">
                    <div className="w-8 h-px bg-white/20 mb-2"></div>
                    <span className="font-mono text-[10px] text-white/30 tracking-widest uppercase">{item.type}</span>
                </div>
            )}

            {/* --- 基础封面层 (Cover Media) --- */}
            {showCover && (
                <div className={`absolute inset-0 w-full h-full bg-[#0a0a0a] transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'} z-10`}>
                    {item.type === "text" ? (
                        <div className="w-full h-full relative flex flex-col justify-center items-center text-center p-8 overflow-hidden">
                            {item.textBgUrl && (
                                <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen" style={{ backgroundImage: `url(${item.textBgUrl})` }} />
                            )}
                            <div className="relative z-10 font-heading text-2xl font-black text-[#eaeaea] uppercase leading-tight">{item.content}</div>
                        </div>
                    ) : videoUrl ? (
                        <video 
                            src={videoUrl} autoPlay muted loop playsInline
                            className="absolute inset-0 w-full h-full object-cover" 
                            onLoadedData={() => setIsLoaded(true)} 
                        />
                    ) : item.coverUrl ? (
                        <img 
                            src={item.coverUrl} alt={item.title || "artwork"} 
                            className="absolute inset-0 w-full h-full object-cover" 
                            onLoad={() => setIsLoaded(true)} 
                        />
                    ) : item.type === "image" && item.content ? (
                        <img 
                            src={item.content} alt={item.title || "artwork"} 
                            className="absolute inset-0 w-full h-full object-cover" 
                            onLoad={() => setIsLoaded(true)}
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-800 bg-[#0a0a0a]">
                            <span className="text-[10px] uppercase tracking-widest font-bold">NO COVER</span>
                        </div>
                    )}
                </div>
            )}

            {/* --- 动态互动层 (Iframe) --- */}
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

            {/* --- 防火墙层 --- */}
            {/* 防止外层直接点击视频导致的全屏等干扰，仅在没有显示 iframe 时生效 */}
            {!showIframe && (
                <div className="absolute inset-0 z-20 pointer-events-auto bg-transparent hover:bg-white/5 transition-colors duration-300" />
            )}

            {/* --- 右下角悬浮跳转图标 --- */}
            {hasLink && (
                <button
                    onClick={handleIconJump}
                    // 取消悬停显示逻辑，直接保持 opacity-70 并在 hover 时点亮到 opacity-100
                    className="absolute bottom-4 right-4 z-50 p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/80 hover:text-white hover:bg-black/80 hover:scale-110 transition-all duration-300 pointer-events-auto shadow-lg opacity-70 hover:opacity-100"
                    title="Open Link"
                >
                    <ExternalLink className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

// --- 4. 主瀑布流组件 ---
export default function WaterfallGallery() {
    const [items, setItems] = useState<ShowcaseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeMedia, setActiveMedia] = useState<ShowcaseItem | null>(null);
    const [visibleCount, setVisibleCount] = useState(24);

    useEffect(() => {
        const fetchWorks = async () => {
            try {
                const res = await fetch('/api/admin/get-data?type=all-works');
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

    const visibleItems = items.slice(0, visibleCount);

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
                <div className="w-full columns-2 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
                    {visibleItems.map((item) => (
                        <MediaCard 
                            key={item.id} 
                            item={item} 
                            onOpenFullscreen={setActiveMedia} 
                        />
                    ))}
                </div>

                {visibleCount < items.length && (
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
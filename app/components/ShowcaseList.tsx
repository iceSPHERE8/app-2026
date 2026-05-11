"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ModelPreview } from "./ModelPreview";

interface ShowcaseListProps {
    type: "all-works" | "tool-lab";
}

interface ShowcaseItem {
    id: string | number;
    mainMedia: { 
        url: string; 
        type: string; 
        aspectRatio?: number; 
    };
    coverUrl?: string;
    coverAspectRatio?: number;
    detailLink?: string;
    title: string;
    description: string | null;
    createdAt: string;
}

export default function ShowcaseList({ type }: ShowcaseListProps) {
    const [items, setItems] = useState<ShowcaseItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/get-data?type=${type}`);
                if (res.ok) {
                    const data = await res.json();
                    setItems(data);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                // 移除原有的强制 500ms 延迟，改为直接结束
                setLoading(false);
            }
        };
        fetchItems();
    }, [type]);

    const isModel = (url: string) => url.toLowerCase().endsWith(".glb");

    return (
        <div className="relative min-h-[400px]"> {/* 添加最小高度防止底部跳动 */}
            {/* 
                优化逻辑：
                1. 只有在真正没有数据且正在加载（初次进入页面）时才显示 14 个占位骨架。
                2. 切换 Tab 时，items 依然保留着上一个 Tab 的内容，直到请求返回。
                3. 通过 transition-opacity 让切换过程丝滑。
            */}
            
            <div className={`columns-2 sm:columns-4 lg:columns-5 xl:columns-7 gap-6 transition-opacity duration-300 ${loading ? "opacity-40" : "opacity-100"}`}>
                
                {items.length === 0 && loading ? (
                    // --- 仅初次加载时显示的骨架 ---
                    [...Array(14)].map((_, i) => (
                        <div key={`init-skel-${i}`} className="mb-4 break-inside-avoid animate-pulse">
                            <div className="bg-neutral-300 w-full" style={{ paddingBottom: "100%" }} />
                            <div className="py-3">
                                <div className="h-3 bg-neutral-300 w-3/4 mb-2" />
                                <div className="h-2 bg-neutral-200 w-1/2" />
                            </div>
                        </div>
                    ))
                ) : (
                    // --- 正常渲染内容（切换 Tab 时，这里的内容会被新数据直接替换而不会中途消失） ---
                    items.map((item, index) => {
                        const displayUrl = (type === "tool-lab" && item.coverUrl) 
                            ? item.coverUrl 
                            : item.mainMedia?.url;
                        
                        const aspectRatio = (type === "tool-lab" ? item.coverAspectRatio : item.mainMedia?.aspectRatio) 
                            || (isModel(displayUrl || "") ? 1.33 : 1);

                        if (!displayUrl) return null;

                        return (
                            <div key={item.id} className="mb-4 break-inside-avoid group">
                                <a 
                                    href={item.detailLink || "#"} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={item.detailLink ? "cursor-pointer block" : "cursor-default block"}
                                >
                                    <div className="relative overflow-hidden bg-[#EAEAEA]">
                                        {isModel(displayUrl) ? (
                                            <div className="w-full aspect-[3/4] relative">
                                                <ModelPreview url={displayUrl} />
                                                <div className="absolute inset-0 z-10 pointer-events-none"></div>
                                            </div>
                                        ) : (
                                            <div className="relative w-full" style={{ paddingBottom: `${aspectRatio * 100}%` }}>
                                                <Image
                                                    src={displayUrl}
                                                    alt={item.title}
                                                    fill 
                                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw"
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="px-1 pt-3 pb-6">
                                        <div className="font-sans font-bold text-[13px] uppercase tracking-wider group-hover:underline decoration-1 underline-offset-4">
                                            {item.title}
                                        </div>
                                        <div className="leading-tight text-[11px] opacity-60 mt-1 line-clamp-2">
                                            {item.description}
                                        </div>
                                        <div className="leading-none text-[10px] pt-3 opacity-40 font-mono">
                                            [{item.createdAt?.slice(0, 7).replace("-", "/ ")}]
                                        </div>
                                    </div>
                                </a>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
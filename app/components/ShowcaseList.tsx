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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
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
                // 增加小段延迟，确保 Skeleton 动画能平滑过渡
                setTimeout(() => setLoading(false), 500);
            }
        };
        fetchItems();
    }, [type]);

    const isModel = (url: string) => url.toLowerCase().endsWith(".glb");

    return (
        <div className="mt-12 mb-24 px-16 relative">
            <div className="columns-2 sm:columns-4 lg:columns-5 xl:columns-7 gap-4">
                
                {/* 逻辑：
                  1. 初次打开页面（items为空）：渲染 14 个 1:1 的默认骨架。
                  2. 切换 Tab 且正在加载：利用已有的 items 渲染精准比例的骨架，防止页面跳动。
                  3. 加载完成：显示真实内容。
                */}
                
                {loading && items.length === 0 ? (
                    // --- 情况 1: 初次进入的默认骨架 ---
                    [...Array(14)].map((_, i) => (
                        <div key={`init-skel-${i}`} className="mb-4 break-inside-avoid animate-pulse">
                            <div className="bg-neutral-300 w-full rounded-sm" style={{ paddingBottom: "100%" }} />
                            <div className="py-3">
                                <div className="h-3 bg-neutral-300 w-3/4 mb-2 rounded-sm" />
                                <div className="h-2 bg-neutral-200 w-1/2 rounded-sm" />
                            </div>
                        </div>
                    ))
                ) : (
                    // --- 情况 2 & 3: 基于数据的骨架或真实内容 ---
                    items.map((item, index) => {
                        const displayUrl = (type === "tool-lab" && item.coverUrl) 
                            ? item.coverUrl 
                            : item.mainMedia?.url;
                        
                        // 1:1 比例的关键修复：优先取 aspectRatio，没取到则判断如果是模型给 1.33，图片给 1
                        const aspectRatio = (type === "tool-lab" ? item.coverAspectRatio : item.mainMedia?.aspectRatio) 
                            || (isModel(displayUrl || "") ? 1.33 : 1);

                        if (!displayUrl && !loading) return null;

                        return (
                            <div key={item.id || index} className="mb-4 break-inside-avoid group">
                                {loading ? (
                                    // 精准比例骨架屏
                                    <div className="animate-pulse">
                                        <div 
                                            className="bg-neutral-300 w-full rounded-sm" 
                                            style={{ paddingBottom: `${aspectRatio * 100}%` }} 
                                        />
                                        <div className="py-3">
                                            <div className="h-3 bg-neutral-300 w-3/4 mb-2 rounded-sm" />
                                        </div>
                                    </div>
                                ) : (
                                    // 真实卡片内容
                                    <a 
                                        href={item.detailLink || "#"} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={item.detailLink ? "cursor-pointer block" : "cursor-default block"}
                                    >
                                        <div className="relative overflow-hidden bg-[#EAEAEA] border border-black/5">
                                            {isModel(displayUrl || "") ? (
                                                <div className="w-full aspect-[3/4] relative">
                                                    <ModelPreview url={displayUrl!} />
                                                    <div className="absolute inset-0 z-10 pointer-events-none"></div>
                                                </div>
                                            ) : (
                                                <div className="relative w-full" style={{ paddingBottom: `${aspectRatio * 100}%` }}>
                                                    <Image
                                                        src={displayUrl!}
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
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
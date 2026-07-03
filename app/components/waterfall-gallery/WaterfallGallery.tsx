// WaterfallGallery.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { FullScreenViewer } from "./FullScreenViewer";
import { SkeuomorphicDropdown } from "./SkeuomorphicDropdown";
import { MediaCard } from "./MediaCard";
import { ShowcaseItem } from "@/types/types";

export default function WaterfallGallery() {
    const [items, setItems] = useState<ShowcaseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeMedia, setActiveMedia] = useState<{
        item: ShowcaseItem;
        rect?: DOMRect;
    } | null>(null);
    const [visibleCount, setVisibleCount] = useState(24);

    const [categoryFilter, setCategoryFilter] = useState("all works");
    const [mediaFilter, setMediaFilter] = useState("all works");

    const observerTarget = useRef<HTMLDivElement>(null);

    const categories = ["all works", "project", "practice", "tool"];
    const mediaTypes = ["all works", "video", "interactive coding", "image"];

    useEffect(() => {
        // 检查当前 URL 的 hash 是否是我们想要的锚点
        if (
            typeof window !== "undefined" &&
            window.location.hash === "#waterfall-gallery"
        ) {
            // 设置一个短暂的延迟，确保页面的 DOM 和图片已经渲染撑开高度
            const timer = setTimeout(() => {
                const gallerySection =
                    document.getElementById("waterfall-gallery");
                if (gallerySection) {
                    gallerySection.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }
            }, 300); // 300毫秒的延迟通常足够，如果还是不滚，可以调大到 500

            return () => clearTimeout(timer);
        }
    }, []);

    // 🌟 监听来自 Header 的跨组件事件，动态切换分类
    useEffect(() => {
        const handleFilterChange = (e: Event) => {
            const customEvent = e as CustomEvent<{ category: string }>;
            if (customEvent.detail && customEvent.detail.category) {
                setCategoryFilter(customEvent.detail.category);
                setVisibleCount(24); // 重置显示数量
            }
        };

        window.addEventListener("updateGalleryCategory", handleFilterChange);
        return () =>
            window.removeEventListener(
                "updateGalleryCategory",
                handleFilterChange,
            );
    }, []);

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
                matchMedia =
                    item.type === "image" || item.type === "image-list";
            } else if (mediaFilter === "interactive coding") {
                matchMedia = ["p5", "glsl", "3d"].includes(item.type);
            }

            return matchCategory && matchMedia;
        });
    }, [items, categoryFilter, mediaFilter]);

    const visibleItems = filteredItems.slice(0, visibleCount);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    visibleCount < filteredItems.length
                ) {
                    handleLoadMore();
                }
            },
            { rootMargin: "0px 0px 400px 0px" },
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [visibleCount, filteredItems.length]);

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
            {/* 🌟 加入 ID 用于平滑滚动锚点定位 */}
            <section
                id="waterfall-gallery"
                className="w-full min-h-screen px-4 md:px-8 py-12 flex flex-col items-center"
            >
                {/* 🌟 完美的吸顶筛选块：贴紧屏幕顶部，且带有向下渐变遮罩 */}
                <div className="sticky top-0 z-50 w-full pt-20 md:pt-6 pb-4 md:pb-12 mb-6 select-none bg-[#eaeaea] md:bg-transparent md:bg-gradient-to-b md:from-[#eaeaea] md:from-60% md:to-transparent shadow-[0_8px_20px_#eaeaea] md:shadow-none">
                    <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-9">
                        {/* 上半区（手机端） / 左半区（PC端）：下拉菜单组 */}
                        <div className="flex items-center gap-4 md:gap-9">
                            <SkeuomorphicDropdown
                                label="(by Category:"
                                options={categories}
                                value={categoryFilter}
                                onChange={(val) => {
                                    setCategoryFilter(val);
                                    setVisibleCount(8); // 保持之前修改的内存优化数量
                                }}
                            />

                            <SkeuomorphicDropdown
                                label="(by Media:"
                                options={mediaTypes}
                                value={mediaFilter}
                                onChange={(val) => {
                                    setMediaFilter(val);
                                    setVisibleCount(8); // 保持之前修改的内存优化数量
                                }}
                            />
                        </div>

                        {/* 下半区（手机端） / 右半区（PC端）：总数 */}
                        <div className="flex justify-end md:ml-auto w-full md:w-auto mt-1 md:mt-0">
                            <div className="font-heading tracking-wide text-[16px] md:text-[32px] text-[#000000] leading-none">
                                ({filteredItems.length})
                            </div>
                        </div>
                    </div>
                </div>

                {filteredItems.length > 0 ? (
                    <div className="w-full columns-2 sm:columns-2 lg:columns-4 xl:columns-5 gap-6 transition-all duration-500">
                        {visibleItems.map((item) => (
                            <MediaCard
                                key={item.id}
                                item={item}
                                // 🔴 2. 接收 item 和 rect 并存入 state
                                onOpenFullscreen={(item, rect) =>
                                    setActiveMedia({ item, rect })
                                }
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-[#a1a1a1] font-mono text-xs uppercase tracking-widest w-full text-left">
                        NO RESULTS FOUND FOR CURRENT FILTERS.
                    </div>
                )}

                {visibleCount < filteredItems.length && (
                    <div
                        ref={observerTarget}
                        className="mt-12 w-full flex justify-center pb-8"
                    >
                        <button
                            onClick={handleLoadMore}
                            className="px-8 py-3 bg-transparent border border-white/20 text-white/70 font-mono text-xs uppercase tracking-widest hover:border-white/60 hover:text-white hover:bg-white/5 transition-all duration-300"
                        >
                            [ Loading More Algorithms... ]
                        </button>
                    </div>
                )}
            </section>

            <FullScreenViewer
                item={activeMedia?.item || null}
                originRect={activeMedia?.rect}
                onClose={() => setActiveMedia(null)}
            />
        </>
    );
}

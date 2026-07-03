"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";

interface ShowcaseItem {
    id: string;
    createdAt?: string;
    title?: string;
    description?: string;
    detailLink?: string;
    type: string;
    category?: string;
    content?: string;
    imageList?: string[];
    coverUrl?: string;
    previewVideoUrl?: string;
    aspectRatio: string;
    renderMode?: string;
    textBgUrl?: string;
    updatedAt?: string;
}

export const ProfessionalSpecialties = () => {
    const [items, setItems] = useState<ShowcaseItem[]>([]);
    const [loading, setLoading] = useState(true);

    const containerRef = useRef<HTMLDivElement>(null);

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

    const recentLogs = useMemo(() => {
        if (!items || items.length === 0) return [];
        
        return [...items]
            .filter((item) => item.createdAt)
            .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
            .slice(0, 9) 
            .map((item) => {
                const dateObj = new Date(item.createdAt!);
                const yyyy = dateObj.getFullYear();
                const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
                const dd = String(dateObj.getDate()).padStart(2, '0');
                
                return {
                    id: item.id,
                    date: `${yyyy}.${mm}.${dd}`,
                    type: item.category ? item.category.toUpperCase() : "UNKNOWN",
                    title: item.title || "UNTITLED WORK",
                    link: item.detailLink || "",
                };
            });
    }, [items]);

    return (
        // 适配点 1: 细化 padding，增加 sm 断点平滑过渡，并在小屏上增加适当左右内边距 (px-5)
        <section 
            ref={containerRef}
            className="w-full px-5 sm:px-8 pt-16 sm:pt-24 md:pt-48 lg:pt-64 pb-16 sm:pb-24 md:pb-32 flex flex-col items-center overflow-hidden"
        >
            {/* 适配点 2: 细化 bottom margin，小屏幕不宜留白过大 */}
            <div className="w-full max-w-7xl mx-auto flex flex-col items-center text-left md:text-center mb-16 sm:mb-24 md:mb-40 lg:mb-64">
                
                <div className="max-w-4xl space-y-5 md:space-y-6">
                    {/* 适配点 3: 优化标题字号，增加 break-words 防止长单词在极小屏幕溢出 */}
                    <h2 className="text-[28px] sm:text-[32px] md:text-[40px] lg:text-[48px] uppercase font-bold text-black leading-tight md:leading-none break-words">
                        Multidisciplinary Digital Artist & Creative Developer
                    </h2>
                    {/* 适配点 4: 优化段落字号，移动端缩小至 16px/18px 提升阅读体验 */}
                    <p className="font-light text-[16px] sm:text-[18px] md:text-[24px] lg:text-[36px] leading-relaxed md:leading-snug lg:leading-none tracking-wide text-gray-800 md:text-black">
                        专长于平面与动态设计、3D建模、CG艺术、程序动画、网页应用开发和交互式视觉编程。怀揣着对探索新兴技术的深厚热情，并无缝整合多样的软件流水线，打造创新的跨学科数字体验
                    </p>
                </div>
            </div>

            <div className="w-full max-w-7xl mx-auto flex flex-col justify-center">
                
                {loading ? (
                    <div className="text-xs font-light text-[#a1a1a1] uppercase tracking-widest pl-6 border-l border-[#e5e5e5]">
                        FETCHING LOGS FROM SERVER...
                    </div>
                ) : recentLogs.length > 0 ? (
                    // 适配点 5: 优化网格系统，增加 sm:grid-cols-2 断点，调整移动端 gap
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 lg:gap-x-12 gap-y-8 sm:gap-y-6 md:gap-y-8 w-full">
                        {recentLogs.map((log) => (
                            <li key={log.id} className="flex flex-col group">
                                
                                <div className="flex items-center gap-3 mb-2 md:mb-1.5">
                                    <span className="text-[12px] font-normal text-[#a1a1a1] leading-none">{log.date}</span>
                                    <span className="text-[12px] px-1.5 text-[#8b8b8b] font-normal tracking-wider leading-none">{log.type}</span>
                                </div>
                                
                                {log.link ? (
                                    // 适配点 6: 移动端增加 py-1 扩大触摸点击热区 (Touch Target)
                                    <a href={log.link} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 group/link cursor-pointer py-1 md:py-0">
                                        <span className="text-[12px] font-normal text-[#a1a1a1] uppercase shrink-0 leading-none mt-0.5">UPLOAD_</span>
                                        <span className="text-[15px] sm:text-[14px] md:text-[12px] font-bold uppercase tracking-wider text-black group-hover/link:text-[#5a5a5a] transition-colors leading-snug md:leading-none line-clamp-2">
                                            {log.title}
                                        </span>
                                        <div className="w-4 h-4 md:w-3.5 md:h-3.5 shrink-0 bg-[#f5f5f5] group-hover/link:bg-black group-hover/link:text-white text-[#a1a1a1] transition-colors flex items-center justify-center mt-0.5 md:mt-0">
                                            <svg width="6" height="6" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M1 9L9 1M9 1H3M9 1V7" />
                                            </svg>
                                        </div>
                                    </a>
                                ) : (
                                    <div className="flex items-start gap-2 py-1 md:py-0">
                                        <span className="text-[12px] font-normal text-[#a1a1a1] uppercase shrink-0 leading-none mt-0.5">UPLOAD_</span>
                                        <span className="text-[15px] sm:text-[14px] md:text-[12px] font-bold uppercase tracking-wider text-black transition-colors leading-snug md:leading-none line-clamp-2">
                                            {log.title}
                                        </span>
                                    </div>
                                )}
                                
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-xs font-mono text-[#a1a1a1] uppercase tracking-widest pl-6 border-l border-[#e5e5e5]">
                        NO RECENT LOGS FOUND.
                    </div>
                )}
            </div>
        </section>
    );
};
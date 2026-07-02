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
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

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

    // 🟢 升级后的磁吸与距离算法
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        
        itemRefs.current.forEach((el) => {
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.bottom; 

            const distance = Math.sqrt(
                Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
            );

            const maxDistance = 200; 
            let scale = 1;

            if (distance < maxDistance) {
                const distanceRatio = 1 - distance / maxDistance;
                scale = 1 + Math.pow(distanceRatio, 2) * 1.6; 
            }

            el.style.transform = `scale(${scale})`;
        });
    };

    // 🟢 离开时恢复
    const handleMouseLeave = () => {
        itemRefs.current.forEach((el) => {
            if (!el) return;
            el.style.transform = `scale(1)`;
        });
    };

    return (
        // 适配点 1: 调整移动端与桌面端的上下留白 (pt-24/pb-16 -> pt-64/pb-32)
        <section 
            ref={containerRef}
            className="w-full px-4 pt-24 md:pt-64 pb-16 md:pb-32 flex flex-col items-center"
        >
            {/* 适配点 2: 调整 mb */}
            <div className="w-full max-w-7xl mx-auto flex flex-col items-center text-center mb-20 md:mb-64">
                
                <div className="max-w-4xl space-y-4 md:space-y-6 text-left md:text-center">
                    {/* 适配点 3: 标题大小和行高 */}
                    <h2 className="text-[32px] md:text-[48px] uppercase font-bold text-black leading-tight md:leading-none">
                        Multidisciplinary Digital Artist & Creative Developer
                    </h2>
                    {/* 适配点 4: 段落文本大小和行高 */}
                    <p className="font-light text-[18px] sm:text-[20px] md:text-[36px] leading-snug md:leading-none tracking-wide">
                        Specializing in graphic and motion design, 3D modeling, CG art, procedural animation, web application development, and interactive visual programming. 
                        Driven by a deep passion for exploring emerging technologies and seamlessly combining diverse software pipelines to engineer innovative, cross-disciplinary digital experiences.
                    </p>
                </div>
            </div>

            <div className="w-full max-w-7xl mx-auto flex flex-col justify-center">
                
                {loading ? (
                    <div className="text-xs font-light text-[#a1a1a1] uppercase tracking-widest pl-6 border-l border-[#e5e5e5]">
                        FETCHING LOGS FROM SERVER...
                    </div>
                ) : recentLogs.length > 0 ? (
                    // 适配点 5: 优化移动端卡片纵向间距 (gap-y-6 md:gap-y-4)
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6 md:gap-y-4 w-full">
                        {recentLogs.map((log) => (
                            <li key={log.id} className="flex flex-col group">
                                
                                <div className="flex items-center gap-3 mb-1.5 md:mb-0">
                                    <span className="text-[12px] font-normal text-[#a1a1a1] leading-none">{log.date}</span>
                                    <span className="text-[12px] px-1.5 text-[#8b8b8b] font-normal tracking-wider leading-none">{log.type}</span>
                                </div>
                                
                                {log.link ? (
                                    <a href={log.link} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 group/link cursor-pointer">
                                        <span className="text-[12px] font-normal text-[#a1a1a1] uppercase shrink-0 leading-none mt-0.5">UPLOAD_</span>
                                        <span className="text-[14px] md:text-[12px] font-bold uppercase tracking-wider text-black group-hover/link:text-[#5a5a5a] transition-colors leading-tight md:leading-none line-clamp-2">
                                            {log.title}
                                        </span>
                                        <div className="w-4 h-4 md:w-3.5 md:h-3.5 shrink-0 bg-[#f5f5f5] group-hover/link:bg-black group-hover/link:text-white text-[#a1a1a1] transition-colors flex items-center justify-center mt-0.5">
                                            <svg width="6" height="6" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M1 9L9 1M9 1H3M9 1V7" />
                                            </svg>
                                        </div>
                                    </a>
                                ) : (
                                    <div className="flex items-start gap-2">
                                        <span className="text-[12px] font-normal text-[#a1a1a1] uppercase shrink-0 leading-none mt-0.5">UPLOAD_</span>
                                        <span className="text-[14px] md:text-[12px] font-bold uppercase tracking-wider text-black group-hover/link:text-[#5a5a5a] transition-colors leading-tight md:leading-none line-clamp-2">
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
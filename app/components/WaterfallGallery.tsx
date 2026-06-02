"use client";

import React, { useState, useEffect } from "react";

// --- 1. 定义数据类型 ---
type MediaType = "image" | "video" | "p5" | "glsl" | "3d" | "text";

interface ShowcaseItem {
    id: string;
    type: MediaType;
    title?: string;
    content?: string; // 用于文字板块的文本，图片/视频的 URL，或互动组件(iframe)的嵌入链接
    aspectRatio: string; // 预设比例，帮助瀑布流错落有致
}

// --- 2. 构造假数据 (已添加互动组件的示例 URL) ---
const MOCK_DATA: ShowcaseItem[] = [
    { 
        id: "1", 
        type: "text", 
        content: "SYSTEM.INIT() / ALGORITHMIC CHAOS", 
        aspectRatio: "aspect-square", 
        title: "ATMOSPHERE" 
    },
    { 
        id: "2", 
        type: "image", 
        content: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop", 
        aspectRatio: "aspect-[3/4]" 
    },
    { 
        id: "3", 
        type: "glsl", 
        title: "Fluid Shader", 
        content: "https://editor.p5js.org/p5/embed/hello-p5", // 示例：可以替换为你的Shader/Canvas网页链接
        aspectRatio: "aspect-square" 
    },
    { 
        id: "4", 
        type: "video", 
        content: "https://www.w3schools.com/html/mov_bbb.mp4", 
        aspectRatio: "aspect-video" 
    },
    { 
        id: "5", 
        type: "3d", 
        title: "Procedural Geometry", 
        content: "https://codesandbox.io/embed/qtzq4?view=preview&module=%2Fsrc%2FApp.js&hidenavigation=1", // 示例：Three.js/WebGL等嵌入链接
        aspectRatio: "aspect-[4/5]" 
    },
    { 
        id: "6", 
        type: "text", 
        content: "WE DON'T JUST RENDER IMAGES; WE ARCHITECT DIGITAL BEHAVIORS.", 
        aspectRatio: "aspect-[2/1]" 
    },
    { 
        id: "7", 
        type: "p5", 
        title: "Boids Simulation", 
        content: "https://editor.p5js.org/fatoony/full/fI58Wv89K", 
        aspectRatio: "aspect-square" 
    },
    { 
        id: "8", 
        type: "image", 
        content: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop", 
        aspectRatio: "aspect-auto" 
    },
    { 
        id: "9", 
        type: "text", 
        content: "16-BIT / REAL-TIME", 
        aspectRatio: "aspect-square" 
    },
];

// --- 3. 渲染单个卡片的子组件 ---
const RenderCardContent = ({ item }: { item: ShowcaseItem }) => {
    switch (item.type) {
        case "image":
            return (
                <img 
                    src={item.content} 
                    alt={item.title || "artwork"} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
            );
        case "video":
            return (
                <video 
                    src={item.content} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover" 
                />
            );
        case "text":
            return (
                <div className="w-full h-full bg-[#182018] text-[#eaeaea] p-8 flex flex-col justify-center">
                    <div className="font-heading text-2xl font-black uppercase leading-tight">
                        {item.content}
                    </div>
                </div>
            );
        case "glsl":
        case "p5":
        case "3d":
            return (
                <div className="w-full h-full bg-[#111] relative overflow-hidden group/card">
                    {item.content ? (
                        // 如果有 URL 链接，则渲染 iframe
                        <iframe
                            src={item.content}
                            title={item.title || "Interactive Content"}
                            className="absolute inset-0 w-full h-full border-none z-0"
                            loading="lazy" // 延迟加载，优化多组件瀑布流性能
                            sandbox="allow-scripts allow-same-origin" // 安全沙箱策略
                        />
                    ) : (
                        // 如果没有 URL 链接，渲染原有的动态噪点占位图
                        <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] to-[#111] flex flex-col items-center justify-center">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                            <div className="font-table text-[#a1a1a1] text-xs z-10 uppercase tracking-widest">
                                {item.title || "NO SOURCE"}
                            </div>
                        </div>
                    )}
                    
                    {/* 左上角悬浮的互动媒体类型标签 */}
                    {/* 添加 pointer-events-none 避免阻挡鼠标对 iframe 的点击，hover 时微调透明度降低视觉干扰 */}
                    <div className="absolute top-4 left-4 font-mono text-[#eaeaea] text-[10px] z-10 bg-black/60 px-2.5 py-0.5 rounded-full border border-[#444] backdrop-blur-sm pointer-events-none transition-opacity duration-300 group-hover/card:opacity-30">
                        [ {item.type.toUpperCase()} ]
                    </div>
                    
                    {/* 仅在有 URL 且未悬浮时提示可互动（可选，根据视觉需要留存） */}
                    {item.content && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-100 group-hover/card:opacity-0 transition-opacity duration-300 font-mono text-[9px] text-green-400/70 bg-black/40 px-2 py-0.5 rounded pointer-events-none z-10">
                            Hover / Click to Interact
                        </div>
                    )}
                </div>
            );
        default:
            return null;
    }
};

// --- 4. 主瀑布流组件 ---
export default function WaterfallGallery() {
    const [items, setItems] = useState<ShowcaseItem[]>([]);

    useEffect(() => {
        // 模拟从后台 API 获取数据，并打乱顺序
        const fetchWorks = async () => {
            // 模拟网络延迟
            await new Promise((resolve) => setTimeout(resolve, 500));
            const shuffled = [...MOCK_DATA].sort(() => Math.random() - 0.5);
            setItems(shuffled);
        };
        fetchWorks();
    }, []);

    return (
        <section className="w-full min-h-screen bg-[#0d0d0d] px-4 md:px-8 py-12">
            {/* 瀑布流核心布局：利用 columns 控制列数，随屏幕宽度自适应 */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
                
                {items.map((item) => (
                    // break-inside-avoid 防止卡片被硬生生截断分到下一列
                    // mb-6 替代 row-gap，因为在 columns 布局中，垂直间距需要用 margin-bottom 设定
                    <div 
                        key={item.id} 
                        className={`break-inside-avoid mb-6 relative group overflow-hidden ${item.aspectRatio} w-full rounded-lg border border-white/5 bg-[#141414]`}
                    >
                        {/* 核心内容渲染 */}
                        <RenderCardContent item={item} />
                        
                        {/* 统一的全局黑色渐变遮罩 (除了纯文本板块) */}
                        {/* 注意：pointer-events-none 非常关键，否则鼠标无法点击到底层的 iframe 进行交互 */}
                        {item.type !== 'text' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-end p-6 z-20">
                                <span className="font-mono text-[10px] text-white/60 uppercase tracking-wider">{item.type}</span>
                                {item.title && (
                                    <h3 className="font-heading text-base font-bold text-white leading-none mt-1">
                                        {item.title}
                                    </h3>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                
            </div>
        </section>
    );
}
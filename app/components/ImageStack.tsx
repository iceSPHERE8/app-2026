"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const displayImages = [
    "/images/display/2b70f6c9c5767d65ac14f9529ca56e7f.jpg",
    "/images/display/34e8d07c5b57c0eb3d79de2e50f73467.jpg",
    "/images/display/ae6c3bb5ef0e46d9313b2cce91f7916f.jpg",
    "/images/display/de9ffa09a3742c3354326b84bafecaf6.jpg",
    "/images/display/e9f644185978884a335f84c7b38ff648.jpg",
    "/images/display/2b70f6c9c5767d65ac14f9529ca56e7f.jpg",
    "/images/display/34e8d07c5b57c0eb3d79de2e50f73467.jpg", 
];

export default function ImageStack() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isHovered) return;

        const interval = setInterval(() => {
            setActiveIndex((prevIndex) => (prevIndex + 1) % displayImages.length);
        }, 3500);

        return () => clearInterval(interval);
    }, [isHovered]);

    return (
        <div className="flex flex-row items-center justify-center w-full min-h-[720px] px-8 overflow-hidden">
            {displayImages.map((src, index) => {
                const isActive = activeIndex === index;

                return (
                    <div
                        key={index}
                        onMouseEnter={() => {
                            setActiveIndex(index);
                            setIsHovered(true);
                        }}
                        onMouseLeave={() => setIsHovered(false)}
                        className={`
                            relative overflow-hidden cursor-pointer
                            transition-all duration-1000
                            ${isActive ? "flex-[5] z-20" : "flex-1 z-10"}
                            ${index > 0 ? "-ml-12" : ""} 
                            h-[720px] 
                            group
                        `}
                    >
                        {/* 绝对定位固定尺寸的内层容器，防止 flex 动画导致图片缩放 */}
                        <div className="absolute top-0 left-1/2 h-full w-[1000px] -translate-x-1/2">
                            <Image
                                src={src}
                                alt={`展示图片 ${index + 1}`}
                                fill
                                className={`
                                    object-cover object-center
                                    transition-all duration-1000
                                    ${isActive ? "saturate-100" : "saturate-50"}
                                `}
                                sizes="(max-width: 768px) 100vw, 33vw"
                                priority={index === 0}
                            />
                        </div>
                        
                        <div 
                            className={`
                                absolute inset-0 bg-black pointer-events-none 
                                transition-opacity duration-1000
                                ${isActive ? "opacity-0" : "opacity-40"}
                            `}
                        />
                    </div>
                );
            })}
        </div>
    );
}
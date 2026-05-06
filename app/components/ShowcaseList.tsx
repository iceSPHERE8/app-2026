"use client";

import { useState, useEffect } from "react";

import Image from "next/image";

const lists = [
    "/images/display/2b70f6c9c5767d65ac14f9529ca56e7f.jpg",
    "/images/display/34e8d07c5b57c0eb3d79de2e50f73467.jpg",
    "/images/display/ae6c3bb5ef0e46d9313b2cce91f7916f.jpg",
    "/images/display/de9ffa09a3742c3354326b84bafecaf6.jpg",
    "/images/display/2b70f6c9c5767d65ac14f9529ca56e7f.jpg",
    "/images/display/34e8d07c5b57c0eb3d79de2e50f73467.jpg",
    "/images/display/ae6c3bb5ef0e46d9313b2cce91f7916f.jpg",
    "/images/display/de9ffa09a3742c3354326b84bafecaf6.jpg",
    "/images/display/ae6c3bb5ef0e46d9313b2cce91f7916f.jpg",
    "/images/display/de9ffa09a3742c3354326b84bafecaf6.jpg",
];

interface ShowcaseListProps {
    type: "all-works" | "tool-lab";
}

interface ShowcaseItem {
    id: String | number;
    mainMedia: {
        url: string;
    };
}

const ShowcaseItem: Object = {
    src: "/images/display/2b70f6c9c5767d65ac14f9529ca56e7f.jpg",
    title: "title",
    description: "2025",
    filter: "Individual",
};

export default function ShowcaseList({ type }: ShowcaseListProps) {
    const [items, setItems] = useState<ShowcaseItem[]>([]);

    const fetchItems = async () => {
        const res = await fetch(`/api/admin/get-data?type=${type}`);
        if (res.ok) setItems(await res.json());
    };

    useEffect(() => {
        fetchItems();
    }, [type]);

    return (
        <div className="columns-2 sm:columns-4 lg:columns-5 xl:columns-7 gap-4 mt-24 mb-24 px-8">
            {items.map((item, index) => (
                <div
                    key={index}
                    className="mb-4 break-inside-avoid" // 关键：防止图片在列中间断开
                >
                    <div className="relative overflow-hidden">
                        <Image
                            src={item.mainMedia.url}
                            alt={`展示图片 ${index + 1}`}
                            width={400} // 固定宽度建议值
                            height={600} // 只是占位，实际高度由图片决定
                            className="w-full h-auto object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

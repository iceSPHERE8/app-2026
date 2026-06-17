"use client";

import React, { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Film, FileBox, Play, X } from "lucide-react";

// --- 类型定义 ---
export type MediaType = "image" | "video" | "other";

export interface MediaItem {
  id: string;
  url: string;
  title: string;
  type: MediaType;
  isHighlight?: boolean;
}

interface MediaCanvasProps {
  items: MediaItem[];
  vacuumRadius?: number; // 高亮区域和普通区域之间的真空范围半径
}

interface PositionedItem extends MediaItem {
  x: number;
  y: number;
  originX: number; // 动画起始中心点 X
  originY: number; // 动画起始中心点 Y
  zIndex: number;
}

// --- 可拖拽子组件 ---
const DraggableItem = ({
  item,
  onDoubleClick,
  onDragStart,
}: {
  item: PositionedItem;
  onDoubleClick: (item: MediaItem) => void;
  onDragStart: (id: string) => void;
}) => {
  // 初始位置设为中心点 (originX, originY)
  const [pos, setPos] = useState({ x: item.originX, y: item.originY });
  const [isEntering, setIsEntering] = useState(true);
  
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // 处理出现动画
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPos({ x: item.x, y: item.y });
    }, 50);

    // 动画时间延长到了 1.2s，所以这里对应的状态关闭时间同步调大到 1250ms
    const timer2 = setTimeout(() => {
      setIsEntering(false);
    }, 1250);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // 监听父组件传来的坐标变化
  useEffect(() => {
    if (!isEntering && !isDragging.current) {
      setPos({ x: item.x, y: item.y });
    }
  }, [item.x, item.y, isEntering]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    isDragging.current = true;
    setIsEntering(false); // 抓取时立刻打断动画
    onDragStart(item.id);
    
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;
      setPos({
        x: moveEvent.clientX - dragOffset.current.x,
        y: moveEvent.clientY - dragOffset.current.y,
      });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const isAtOrigin = isEntering && pos.x === item.originX && pos.y === item.originY;

  return (
    <div
      className="absolute flex flex-col items-center cursor-grab active:cursor-grabbing w-20 group select-none"
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px) scale(${isAtOrigin ? 0.3 : 1})`,
        opacity: 1, 
        // 核心修改：使用 1.2s 搭配强缓动曲线，让初始在中心停顿的时间明显变长
        transition: isEntering 
          ? 'transform 1.2s cubic-bezier(0.85, 0, 0.15, 1)' 
          : 'none',
        zIndex: item.zIndex,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick(item);
      }}
    >
      <div className="relative w-16 h-16 bg-white rounded-xl shadow-md border-3 border-white flex items-center justify-center overflow-hidden group-hover:shadow-xl transition-shadow">
        {item.type === "image" && (
          <img
            src={item.url}
            alt={item.title}
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />
        )}
        {item.type === "video" && (
          <div className="relative w-full h-full">
            <video
              src={item.url}
              className="w-full h-full object-cover pointer-events-none"
            />
            <div className="absolute inset-0 bg-black/65 m-3 rounded-full flex items-center justify-center">
              <Play className="fill-white text-transparent w-6 h-6" />
            </div>
          </div>
        )}
        {item.type === "other" && <FileBox className="w-6 h-6 text-gray-400" />}
      </div>
      <span className="mt-2 text-sm text-black text-center px-1 font-sans font-bold">
        {item.title}
      </span>
    </div>
  );
};

// --- 主画布组件 ---
export default function MediaCanvas({ items, vacuumRadius = 250 }: MediaCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positionedItems, setPositionedItems] = useState<PositionedItem[]>([]);
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(10);

  // 初始化坐标分配
  useEffect(() => {
    if (!containerRef.current) return;
    const { clientWidth: width, clientHeight: height } = containerRef.current;
    const centerX = width / 2;
    const centerY = height / 2;
    
    const OFFSET = 40; 
    const originX = centerX - OFFSET;
    const originY = centerY - OFFSET;

    const highlights = items.filter((i) => i.isHighlight);
    const normals = items.filter((i) => !i.isHighlight);

    const newItems: PositionedItem[] = [];

    // 1. 均匀分布 Highlight 元素
    const columns = Math.ceil(Math.sqrt(highlights.length));
    const gap = 90; 
    const startX = centerX - ((columns - 1) * gap) / 2;
    const startY = centerY - ((Math.ceil(highlights.length / columns) - 1) * gap) / 2;

    highlights.forEach((item, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      newItems.push({
        ...item,
        x: startX + col * gap - OFFSET,
        y: startY + row * gap - OFFSET,
        originX,
        originY,
        zIndex: 1,
      });
    });

    // 2. 普通元素环绕分布 (斐波那契螺旋)
    const goldenAngle = 137.508 * (Math.PI / 180);
    const spreadFactor = 20; 

    normals.forEach((item, index) => {
      const radius = vacuumRadius + Math.sqrt(index) * spreadFactor;
      const angle = index * goldenAngle;

      const randomJitterX = (Math.random() - 0.5) * 40;
      const randomJitterY = (Math.random() - 0.5) * 40;

      const x = centerX + radius * Math.cos(angle) + randomJitterX - OFFSET;
      const y = centerY + radius * Math.sin(angle) + randomJitterY - OFFSET;

      newItems.push({
        ...item,
        x,
        y,
        originX,
        originY,
        zIndex: 1,
      });
    });

    setPositionedItems(newItems);
  }, [items, vacuumRadius]);

  const handleDragStart = (id: string) => {
    setMaxZIndex((prev) => prev + 1);
    setPositionedItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, zIndex: maxZIndex + 1 } : item
      )
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#eaeaea]"
    >
      {/* 渲染桌面元素 */}
      {positionedItems.map((item) => (
        <DraggableItem
          key={item.id}
          item={item}
          onDoubleClick={setActiveItem}
          onDragStart={handleDragStart}
        />
      ))}

      {/* 媒体预览弹窗 */}
      {activeItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setActiveItem(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[80vh] w-full mx-4 bg-transparent flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors bg-black/40 rounded-full p-2"
              onClick={() => setActiveItem(null)}
              aria-label="关闭预览"
              title="关闭"
            >
              <X size={24} />
            </button>

            {activeItem.type === "image" && (
              <img
                src={activeItem.url}
                alt={activeItem.title}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
            )}

            {activeItem.type === "video" && (
              <video
                src={activeItem.url}
                controls
                autoPlay
                className="max-w-full max-h-[80vh] rounded-lg shadow-2xl outline-none"
              />
            )}

            {activeItem.type === "other" && (
              <div className="w-64 h-64 bg-white rounded-xl flex flex-col items-center justify-center shadow-2xl">
                <FileBox className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-800 font-medium text-center px-4">
                  无法预览此类型文件
                </p>
                <a 
                  href={activeItem.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                >
                  外部打开
                </a>
              </div>
            )}
            
            <div className="mt-4 text-white text-lg font-medium drop-shadow-md">
              {activeItem.title}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
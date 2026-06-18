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
  vacuumRadius?: number;
}

interface PositionedItem extends MediaItem {
  x: number;
  y: number;
  originX: number;
  originY: number;
  zIndex: number;
}

// 用于在兄弟组件之间进行高性能物理碰撞检测和位置同步的共享状态池
interface SharedPhysicsState {
  positions: Record<string, { x: number; y: number }>;
  setters: Record<string, React.Dispatch<React.SetStateAction<{ x: number; y: number }>>>;
}

// --- 可拖拽子组件 ---
const DraggableItem = ({
  item,
  onDoubleClick,
  onDragStart,
  physicsState,
}: {
  item: PositionedItem;
  onDoubleClick: (item: MediaItem) => void;
  onDragStart: (id: string) => void;
  physicsState: SharedPhysicsState;
}) => {
  const [pos, setPos] = useState({ x: item.originX, y: item.originY });
  const [isEntering, setIsEntering] = useState(true);
  
  const [isDraggingState, setIsDraggingState] = useState(false); 
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // 挂载时，将自己的坐标和更新函数注册到物理引擎池中
  useEffect(() => {
    physicsState.setters[item.id] = setPos;
    return () => {
      delete physicsState.setters[item.id];
      delete physicsState.positions[item.id];
    };
  }, [item.id, physicsState]);

  // 实时同步自己的位置到共享池
  useEffect(() => {
    physicsState.positions[item.id] = pos;
  }, [pos, item.id, physicsState]);

  // 处理出现动画
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPos({ x: item.x, y: item.y });
    }, 50);

    const timer2 = setTimeout(() => {
      setIsEntering(false);
    }, 1250);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [item.x, item.y]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    isDragging.current = true;
    setIsDraggingState(true); 
    setIsEntering(false);
    onDragStart(item.id);
    
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;
      const newX = moveEvent.clientX - dragOffset.current.x;
      const newY = moveEvent.clientY - dragOffset.current.y;

      setPos({ x: newX, y: newY });
      physicsState.positions[item.id] = { x: newX, y: newY };

      // --- 物理排斥（Collision & Repulsion）逻辑 ---
      const REPULSION_RADIUS = 95; 
      const REPULSION_FORCE = 0.35; 

      Object.keys(physicsState.positions).forEach((otherId) => {
        if (otherId === item.id) return; 

        const otherPos = physicsState.positions[otherId];
        const dx = otherPos.x - newX;
        const dy = otherPos.y - newY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0 && dist < REPULSION_RADIUS) {
          const overlap = REPULSION_RADIUS - dist;
          const forceX = (dx / dist) * overlap * REPULSION_FORCE;
          const forceY = (dy / dist) * overlap * REPULSION_FORCE;

          const nextOtherX = otherPos.x + forceX;
          const nextOtherY = otherPos.y + forceY;

          if (physicsState.setters[otherId]) {
            physicsState.setters[otherId]({ x: nextOtherX, y: nextOtherY });
            physicsState.positions[otherId] = { x: nextOtherX, y: nextOtherY };
          }
        }
      });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      setIsDraggingState(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className={`absolute flex flex-col items-center cursor-grab active:cursor-grabbing w-20 group select-none ${isDraggingState ? 'z-50' : ''}`}
      style={{
        // 核心修改：去除了 scale()，仅保留位移动画，大小始终保持不变
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        opacity: 1, 
        transition: isEntering 
          ? 'transform 1.2s cubic-bezier(0.85, 0, 0.15, 1)' 
          : isDraggingState 
            ? 'none' 
            : 'transform 0.15s ease-out',
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

  // 初始化物理共享状态池
  const physicsState = useRef<SharedPhysicsState>({
    positions: {},
    setters: {},
  });

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
      className="relative w-full h-screen bg-transparent"
    >
      {/* 渲染桌面元素 */}
      {positionedItems.map((item) => (
        <DraggableItem
          key={item.id}
          item={item}
          onDoubleClick={setActiveItem}
          onDragStart={handleDragStart}
          physicsState={physicsState.current} // 将物理状态池传入
        />
      ))}

      {/* 媒体预览弹窗 */}
      {activeItem && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
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
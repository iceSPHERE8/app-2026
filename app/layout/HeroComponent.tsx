import React, { ReactNode } from 'react';

export interface HeroProps {
  backgroundElement?: ReactNode;
  className?: string;
}

export default function HeroComponent({
  backgroundElement,
  className = '',
}: HeroProps) {
  return (
    <section 
      className={`relative w-full flex flex-col overflow-hidden select-none 
      /* 高度适配：移动端缩小1/3 (即占屏幕 66vh)，中大屏幕保持全屏 (min-h-screen) */
      min-h-[66vh] md:min-h-screen
      /* 左右内边距固定为 4 (16px) */
      px-4 
      ${backgroundElement ? 'bg-transparent text-white' : 'bg-black text-white'} ${className}`}
    >
      {/* 动态背景层 */}
      {backgroundElement && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          {backgroundElement}
        </div>
      )}
      
      {/* 核心排版区：下内边距固定为 4 (16px) */}
      <div className="relative z-10 flex-1 flex flex-col justify-end items-left w-full pointer-events-none pb-4">
        
        {/* 内部文字容器：限制最大宽度(max-w-full)防溢出 */}
        <div className="flex flex-col items-start font-bold text-[clamp(1.5rem,7.5vw,12rem)] leading-[1] md:leading-[0.9] tracking-tighter max-w-full">
          
          {/* 第一行 */}
          <div className="flex items-baseline gap-1.5 sm:gap-2 md:gap-4 max-w-full">
            <span className="whitespace-nowrap">Procedural Logic</span>
            <span className="font-light text-[clamp(1.25rem,7.5vw,10rem)] text-neutral-400 md:text-white">/</span>
          </div>
          
          {/* 第二行 */}
          <div className="flex items-baseline gap-1.5 sm:gap-2 md:gap-4 max-w-full">
            <span className="whitespace-nowrap">3D Visuals</span>
            <span className="font-light text-[clamp(1.25rem,7.5vw,10rem)] text-neutral-400 md:text-white">/</span>
          </div>
          
          {/* 第三行 */}
          <div className="flex items-baseline gap-1.5 sm:gap-2 md:gap-4 max-w-full">
            <span className="whitespace-nowrap">Interactive Tech</span>
          </div>
          
        </div>
      </div>
      
    </section>
  );
}
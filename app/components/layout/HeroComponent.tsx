import React, { ReactNode } from 'react';
import MailIcon from '../icons/MailIcon';

export interface HeroProps {
  backgroundElement?: ReactNode;
  email?: string;
  className?: string;
}

export default function HeroComponent({
  backgroundElement,
  email = 'icesphere8@outlook.com',
  className = '',
}: HeroProps) {
  return (
    <section 
      className={`relative w-full min-h-screen p-2 flex flex-col justify-between overflow-hidden select-none ${
        backgroundElement ? 'bg-transparent text-white' : 'bg-black text-white'
      } ${className}`}
    >
      {/* 动态背景层 */}
      {backgroundElement && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          {backgroundElement}
        </div>
      )}
      
      {/* 核心排版区：外层 flex-1 绝对居中 */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center w-full pointer-events-none mt-12 md:mt-0">
        
        {/* 内部文字容器：items-start 保持左对齐 */}
        <div className="flex flex-col items-start font-bold text-[clamp(3rem,8vw,12rem)] leading-[0.9] tracking-tighter">
          
          {/* 第一行 */}
          <div className="flex items-baseline gap-2 md:gap-4">
            <span className="whitespace-nowrap">Procedural Logic</span>
            <span className="font-light text-[clamp(2.5rem,8vw,10rem)]">/</span>
          </div>
          
          {/* 第二行 */}
          <div className="flex items-baseline gap-2 md:gap-4">
            <span className="whitespace-nowrap">3D Visuals</span>
            <span className="font-light text-[clamp(2.5rem,8vw,10rem)]">/</span>
          </div>
          
          {/* 第三行 */}
          <div className="flex items-baseline gap-2 md:gap-4">
            <span className="whitespace-nowrap">Interactive Tech</span>
          </div>
          
        </div>
      </div>

      {/* 右下角联系方式 */}
      <div className="relative z-10 flex justify-end items-center gap-3 w-full pb-4 pr-2 font-normal text-lg md:text-2xl lg:text-[2rem] tracking-wide">
        <MailIcon className="w-6 h-6 md:w-8 md:h-8 lg:w-12 lg:h-12 shrink-0" />
        <a 
          href={`mailto:${email}`}
          className="hover:text-neutral-400 transition-colors duration-300 cursor-pointer pointer-events-auto"
        >
          {email}
        </a>
      </div>
      
    </section>
  );
}
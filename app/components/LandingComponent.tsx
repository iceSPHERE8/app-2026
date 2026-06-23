import type { NextPage } from 'next';
import Head from 'next/head';

import GlitchArtMath from './canvas/GlitchArtMath';

const LandingComponent: NextPage = () => {
  // --- 样式变量提取 ---

  // 1. 金属面板基底 (Header 和 Footer)
  const metalPanelClass = `
    relative flex items-center justify-between px-12 w-full z-50
    bg-[#C4C4C4]
  `;

  // 2. 镂空雕刻标签 (用于 SINCE 2022 等纯展示文本)
  const metalTagClass = `
    flex items-center justify-center px-3 py-0.5 
    bg-transparent text-gray-950
  `;

  // 3. 面板雕刻文字
  const engravedTextClass = `
    text-gray-950
  `;

  // 4. 纠正后的最终版本：极简全圆角基底 + 悬停 Aqua 果冻红
  const buttonClass = `
    /* 1. 核心外观：完全还原你最新发来的精致紧凑全圆角、单层细边框布局 */
    relative flex items-center justify-center
    px-2 py-1 rounded-full border border-[#a1a1a1]
    text-[11px] leading-none font-normal uppercase cursor-pointer tracking-widest
    bg-gradient-to-b from-[#eaeaea] via-[#e6e6e6] to-[#ababab] text-[#4a4a4a] [text-shadow:0_1px_0_rgba(255,255,255,0.8)] shadow-[inset_0_1px_0_rgba(255,255,255,1),0_1.5px_3px_rgba(0,0,0,0.5)]
    
    /* 2. 常态文字颜色与背景清透感 */
    bg-transparent text-gray-950
    
    /* 核心动画曲线：使用你指定的 ease-in-out duration-150 */
    transition-all ease-in-out duration-150 outline-none select-none
    
    /* === 交互状态：当鼠标悬停时，立刻优雅地注入早期 macOS 标志性的果冻红三维光影 === */
    hover:-translate-y-px
    hover:border-red-900/60
    hover:from-red-100 hover:via-red-500 hover:to-red-700 hover:stops-[0%,50%,50%,100%]
    hover:bg-gradient-to-b
    hover:text-white hover:[text-shadow:0_-1px_0_rgba(0,0,0,0.5)]
    hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_8px_4px_-3px_white,inset_0_-3px_6px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.2)]

    /* === 按下状态：实体按键按压反馈 === */
    active:translate-y-px active:scale-[0.98]
    active:from-red-800 active:to-red-600
    active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_1px_1px_rgba(0,0,0,0.1)]
  `;

  return (
    <>
      <Head>
        <title>Badbug.Studio | Interactive Coding \ CG Art \ Motion</title>
      </Head>

      {/* 主容器 */}
      <div className="min-h-160 flex flex-col bg-[#eaeaea] font-bold text-gray-950">
        
        {/* Header：金属面板质感 */}
        <header className={`${metalPanelClass} h-10`}>
          <div className="flex items-center">
            <span className={`font-bold text-lg tracking-wide ${engravedTextClass}`}>
              BADBUG.STUDIO
            </span>
          </div>
          
          <div className="flex items-center text-center">
            <span className={`text-sm font-normal tracking-widest ${metalTagClass}`}>
              SINCE 2022
            </span>
          </div>
          
          <div className="flex items-center text-center">
            <span className={`font-normal text-xs tracking-widest uppercase ${engravedTextClass}`}>
              Interactive Coding \ CG Art \ Motion
            </span>
          </div>
          
          <div className="flex items-center text-right">
            {/* 正确样式的按钮：Contact me */}
            <button className={buttonClass}>
              Contact me
            </button>
          </div>
        </header>

        {/* 画布占位区域 */}
        <main className="flex-grow bg-transparent flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-opacity-5 flex items-center justify-center pointer-events-none">
            <GlitchArtMath />
          </div>
        </main>

        {/* Footer */}
        <footer className={`
          relative flex items-center justify-between px-12 w-full mt-auto z-50 h-10
          bg-[#C4C4C4]
        `}>
          <div className="flex items-center">
            {/* 正确样式的按钮：Tool Lab */}
            <button className={buttonClass}>
              Tool Lab
            </button>
          </div>
          
          <div className="flex items-center text-center">
            <span className={`font-normal text-xs tracking-widest uppercase ${engravedTextClass}`}>
              P5 \ ThreeJS \ Blender \ Houdini
            </span>
          </div>
          
          <div className="flex items-center text-right">
            {/* 正确样式的按钮：My Works */}
            <button className={buttonClass}>
              My Works
            </button>
          </div>
          
          <div className="flex items-center text-right">
            <span className={`font-normal text-xs tracking-wider uppercase ${engravedTextClass}`}>
              Mail to: <span className="font-bold ml-1 tracking-normal">ice.sphere8@outlook.com</span>
            </span>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingComponent;
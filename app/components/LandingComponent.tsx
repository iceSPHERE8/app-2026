'use client';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';

// 引入刚刚重构好的两个分离组件
import GenerativeArchitect from './canvas/GlitchArtMath';
import ControlPanel, { initialControls } from "./canvas/components/ControlPanel"

const LandingComponent: NextPage = () => {
  // === 状态提升：将数据源放在最外层 ===
  const [controls, setControls] = useState(initialControls);
  const [isUiVisible, setIsUiVisible] = useState(false);

  const updateControl = (key: string, value: any) => {
    setControls((prev) => ({ ...prev, [key]: value }));
  };

  // --- 样式变量提取 ---
  const metalPanelClass = `relative flex items-center justify-between px-12 w-full z-50 bg-[#C4C4C4]`;
  const metalTagClass = `flex items-center justify-center px-3 py-0.5 bg-transparent text-gray-950`;
  const engravedTextClass = `text-gray-950`;
  const buttonClass = `relative flex items-center justify-center px-2 py-1 rounded-full border border-[#a1a1a1] text-[11px] leading-none font-normal uppercase cursor-pointer tracking-widest bg-gradient-to-b from-[#eaeaea] via-[#e6e6e6] to-[#ababab] text-[#4a4a4a] [text-shadow:0_1px_0_rgba(255,255,255,0.8)] shadow-[inset_0_1px_0_rgba(255,255,255,1),0_1.5px_3px_rgba(0,0,0,0.5)] bg-transparent text-gray-950 transition-all ease-in-out duration-150 outline-none select-none hover:-translate-y-px hover:border-red-900/60 hover:from-red-100 hover:via-red-500 hover:to-red-700 hover:stops-[0%,50%,50%,100%] hover:bg-gradient-to-b hover:text-white hover:[text-shadow:0_-1px_0_rgba(0,0,0,0.5)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_8px_4px_-3px_white,inset_0_-3px_6px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.2)] active:translate-y-px active:scale-[0.98] active:from-red-800 active:to-red-600 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_1px_1px_rgba(0,0,0,0.1)]`;

  return (
    <>
      <Head>
        <title>Badbug.Studio | Interactive Coding \ CG Art \ Motion</title>
      </Head>

      {/* 主容器：使用 flex-col 和 min-h-screen 构建坚固的文档流 */}
      <div className="w-full flex flex-col bg-[#eaeaea] font-bold text-gray-950 select-none">
        
        {/* === 1. 顶部 Header (固定高度) === */}
        <header className={`${metalPanelClass} h-10 flex-shrink-0`}>
          <div className="flex items-center"><span className={`font-bold text-lg tracking-wide ${engravedTextClass}`}>BADBUG.STUDIO</span></div>
          <div className="flex items-center text-center"><span className={`text-sm font-normal tracking-widest ${metalTagClass}`}>SINCE 2022</span></div>
          <div className="flex items-center text-center"><span className={`font-normal text-xs tracking-widest uppercase ${engravedTextClass}`}>Interactive Coding \ CG Art \ Motion</span></div>
          <div className="flex items-center text-right"><button className={buttonClass}>Contact me</button></div>
        </header>

        {/* === 2. 核心画布区域 (尺寸锁死) === */}
        {/* flex-shrink-0 确保即便页面撑破一屏，画布的 640px 也绝不会被压缩或变形 */}
        <main className="h-[640px] w-full bg-[#020204] relative z-0 flex-shrink-0">
          <GenerativeArchitect controls={controls} />
        </main>

        {/* === 3. 展开/折叠触发器 (物理存在于文档流中) === */}
        <button 
          onClick={() => setIsUiVisible(!isUiVisible)}
          className="w-full flex-shrink-0 bg-[#060608] border-t border-b border-[#222233] text-[#60e0ff] text-[9px] py-1.5 uppercase font-bold tracking-widest hover:bg-[#12121a] hover:text-white transition-colors duration-300 outline-none flex items-center justify-center cursor-pointer"
        >
          {isUiVisible ? '▼ Hide Control Panel' : '▲ Open Control Panel'}
        </button>

        {/* === 4. 独立出来的控制面板 === */}
        <ControlPanel 
          controls={controls} 
          updateControl={updateControl} 
          isUiVisible={isUiVisible} 
        />

        {/* === 5. 底部 Footer === */}
        {/* mt-auto 是精髓：在 UI 隐藏时，它会自动去寻找屏幕的最底端；在 UI 展开时，它会被物理推下去 */}
        <footer className={`${metalPanelClass} h-10 flex-shrink-0`}>
          <div className="flex items-center"><button className={buttonClass}>Tool Lab</button></div>
          <div className="flex items-center text-center"><span className={`font-normal text-xs tracking-widest uppercase ${engravedTextClass}`}>P5 \ ThreeJS \ Blender \ Houdini</span></div>
          <div className="flex items-center text-right"><button className={buttonClass}>My Works</button></div>
          <div className="flex items-center text-right"><span className={`font-normal text-xs tracking-wider uppercase ${engravedTextClass}`}>Mail to: <span className="font-bold ml-1 tracking-normal">ice.sphere8@outlook.com</span></span></div>
        </footer>

      </div>
    </>
  );
};

export default LandingComponent;
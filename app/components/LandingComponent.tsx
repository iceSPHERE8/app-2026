import type { NextPage } from 'next';
import Head from 'next/head';

import GlitchArtMath from './canvas/GlitchArtMath';

const LandingComponent: NextPage = () => {
  // --- 样式变量提取 ---

  // 1. 金属面板基底 (Header 和 Footer)
  const metalPanelClass = `
    relative flex items-center justify-between px-12 w-full z-50
    bg-gradient-to-b from-[#e6e6e6] via-[#d4d4d4] to-[#b5b5b5]
    border-y border-[#999999]
    shadow-[inset_0_1px_0_rgba(255,255,255,1),0_4px_10px_rgba(0,0,0,0.15)]
  `;

  // 2. 镂空雕刻标签 (保留圆角，背景透明，边框与文字共享凹陷高光)
  const metalTagClass = `
    flex items-center justify-center px-3 py-0.5 
    rounded-full bg-transparent
    border border-[#333333] text-[#333333]
    drop-shadow-[0_1px_0_rgba(255,255,255,0.85)]
  `;

  // 3. 面板雕刻文字
  const engravedTextClass = `
    text-[#333333] [text-shadow:0_1px_0_rgba(255,255,255,0.85)]
  `;

  return (
    <>
      <Head>
        <title>Badbug.Studio | Interactive Coding \ CG Art \ Motion</title>
      </Head>

      {/* 主容器 */}
      <div className="min-h-160 flex flex-col bg-[#eaeaea] font-heading text-gray-950">
        
        {/* Header：金属面板质感 */}
        <header className={`${metalPanelClass} h-10`}>
          <div className="flex items-center">
            <span className={`font-black text-lg tracking-wide ${engravedTextClass}`}>
              BADBUG.STUDIO
            </span>
          </div>
          
          <div className="flex items-center text-center">
            <span className={`font-table text-xs font-black tracking-widest ${metalTagClass}`}>
              SINCE 2022
            </span>
          </div>
          
          <div className="flex items-center text-center">
            <span className={`font-extrabold text-[13px] tracking-[0.2em] uppercase ${engravedTextClass}`}>
              Interactive Coding \ CG Art \ Motion
            </span>
          </div>
          
          <div className="flex items-center text-right">
            <span className={`font-table text-xs font-black tracking-widest ${metalTagClass}`}>
              CHENGDU \ CN
            </span>
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
          bg-gradient-to-b from-[#e6e6e6] via-[#d4d4d4] to-[#b5b5b5]
          border-t border-[#999999]
          shadow-[inset_0_1px_0_rgba(255,255,255,1),0_-4px_10px_rgba(0,0,0,0.1)]
        `}>
          <div className="flex items-center">
            <span className={`font-table text-xs font-black tracking-widest uppercase ${metalTagClass}`}>
              Generative Art
            </span>
          </div>
          
          <div className="flex items-center text-center">
            <span className={`font-table font-bold text-xs tracking-widest uppercase ${engravedTextClass}`}>
              P5 \ ThreeJS \ Blender \ Houdini
            </span>
          </div>
          
          <div className="flex items-center text-right">
            <span className={`font-table text-xs font-black tracking-widest ${metalTagClass}`}>
              TILL NOW
            </span>
          </div>
          
          <div className="flex items-center text-right">
            <span className={`font-table font-bold text-xs tracking-wider uppercase ${engravedTextClass}`}>
              Mail to: <span className="font-heading ml-1 tracking-normal">ice.sphere8@outlook.com</span>
            </span>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingComponent;
import type { NextPage } from 'next';
import Head from 'next/head';

import GlitchArtMath from './canvas/GlitchArtMath';

const LandingComponent: NextPage = () => {
  return (
    <>
      <Head>
        <title>Badbug.Studio | Interactive Coding \ CG Art \ Motion</title>
      </Head>

      {/* 主容器 */}
      <div className="min-h-160 flex flex-col bg-transparent font-heading text-gray-950">
        
        {/* Header：左右两端靠边，内部元素平分间距 */}
        <header className="bg-[#C4C4C4] h-8 flex items-center justify-between px-12 w-full shadow-sm z-50">
          <div className="flex items-center">
            <span className="font-extrabold text-lg tracking-tight">BADBUG.STUDIO</span>
          </div>
          
          <div className="flex items-center text-center">
            <span className="font-table text-sm bg-black rounded-full px-1.5 text-[#eaeaea] tracking-widest">SINCE 2022</span>
          </div>
          
          <div className="flex items-center text-center">
            <span className="font-extrabold text-base tracking-widest">INTEREACTIVE CODING \ CG ART \ MOTION</span>
          </div>
          
          <div className="flex items-center text-right">
            <span className="text-sm tracking-widest border-2 rounded-full px-1.5">CHENGDU\CN</span>
          </div>
        </header>

        {/* 画布占位区域 */}
        <main className="flex-grow bg-transparent flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-opacity-5 flex items-center justify-center pointer-events-none">
            {/* <span className="text-black text-opacity-10 font-black text-6xl tracking-widest uppercase selection:bg-transparent">
              Canvas Placeholder
            </span> */}
            <GlitchArtMath />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-[#C4C4C4] h-8 flex items-center justify-between px-12 w-full shadow-inner mt-auto z-50">
          <div className="flex items-center">
            <span className="text-sm tracking-widest border-2 rounded-full px-1.5">Generative Art</span>
          </div>
          
          <div className="flex items-center text-center">
            <span className="font-light text-sm tracking-widest">P5 \ ThreeJS \ Blender \ Houdini</span>
          </div>
          
          <div className="flex items-center text-right">
            <span className="font-table text-sm bg-black rounded-full px-1.5 text-[#eaeaea] tracking-widest">TILL NOW</span>
          </div>
          
          <div className="flex items-center text-right">
            <span className="font-table text-sm tracking-widest">
              Mail to: <span className="font-heading">ice.sphere8@outlook.com</span>
            </span>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingComponent;
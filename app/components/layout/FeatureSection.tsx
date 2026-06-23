import React from 'react';
// 根据你的描述，假定这些图标文件放在该目录下
import SectionIcon1 from '../icons/SectionIcon_1';
import SectionIcon2 from '../icons/SectionIcon_2';
import SectionIcon3 from '../icons/SectionIcon_3';

export interface FeatureSectionProps {
  className?: string;
}

export default function FeatureSection({ className = '' }: FeatureSectionProps) {
  return (
    <section className={`w-full py-64 flex justify-center bg-[#eaeaea] text-black ${className}`}>
      {/* 使用 grid 布局确保三列等宽分布
        在移动端自动堆叠为一列，在中等屏幕及以上显示为三列 
      */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-32 max-w-7xl w-full">
        
        {/* Block 1 */}
        <div className="flex flex-col items-start w-full mx-auto max-w-[320px]">
          {/* 图标容器，预留固定高度以确保下方文字顶部对齐 */}
          <div className="h-20 mb-6 flex items-end">
            <SectionIcon1 className="w-auto h-16 object-contain" />
          </div>
          {/* font-table: 你指定的自定义字体
            text-justify & hyphens-auto: 实现图中的两端对齐和自动连字符效果
            注意: hyphens-auto 依赖于 HTML 标签上的 lang 属性 (如 lang="en") 才能最完美工作
          */}
          <p className="font-light text-sm leading-none tracking-wide">
            Autonomous Motion. Engineering GLSL shaders and GPGPU simulations via Houdini. We craft procedural systems where algorithmic logic creates relentless, evolving digital patterns.
          </p>
        </div>

        {/* Block 2 */}
        <div className="flex flex-col items-start w-full mx-auto max-w-[320px]">
          <div className="h-20 mb-6 flex items-end">
            <SectionIcon2 className="w-auto h-16 object-contain" />
          </div>
          <p className="font-light text-sm leading-none tracking-wide">
            Cinematic Impact. High-fidelity 3D motion rendered in Redshift. Focused on physics-based animation and sharp digital aesthetics that command the visual landscape.
          </p>
        </div>

        {/* Block 3 */}
        <div className="flex flex-col items-start w-full mx-auto max-w-[320px]">
          <div className="h-20 mb-6 flex items-end">
            <SectionIcon3 className="w-auto h-16 object-contain" />
          </div>
          <p className="font-light text-sm leading-none tracking-wide">
            Creative Coding. Building immersive Three.js experiences with React and TypeScript. We bridge technical art and full-stack performance to infect the web.
          </p>
        </div>

      </div>
    </section>
  );
}
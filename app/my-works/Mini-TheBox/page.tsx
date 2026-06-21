"use client"; // 引入 useRouter 需要声明为客户端组件

import { useRouter } from "next/navigation";
import MediaCanvas, {MediaItem} from "@/app/components/MediaCanvas";
import ImageStack from "@/app/components/ImageStack";

export default function Page() {
  const router = useRouter();

  const mockData: MediaItem[] = [
    // --- Highlights ---
    { id: "1", url: "https://picsum.photos/seed/1/800/600", title: "核心设计稿_v2.png", type: "image", isHighlight: true },
    { id: "2", url: "https://www.w3schools.com/html/mov_bbb.mp4", title: "主视觉演示视频.mp4", type: "video", isHighlight: true },
    { id: "3", url: "https://picsum.photos/seed/2/800/600", title: "Wasteland_Doctor_Sprite_64x64.png", type: "image", isHighlight: true },
    { id: "4", url: "https://picsum.photos/seed/3/800/600", title: "Houdini_Redshift_Render_Final.png", type: "image", isHighlight: true },
    { id: "5", url: "https://www.w3schools.com/html/mov_bbb.mp4", title: "GPGPU_Particles_Sim.mp4", type: "video", isHighlight: true },
    
    // --- Normal ---
    { id: "6", url: "https://picsum.photos/seed/4/400/400", title: "参考图集_环境光.jpg", type: "image", isHighlight: false },
    { id: "7", url: "https://picsum.photos/seed/5/400/400", title: "参考图集_废土风格.jpg", type: "image", isHighlight: false },
    { id: "8", url: "https://picsum.photos/seed/6/400/400", title: "Threejs_DataTexture_Map.png", type: "image", isHighlight: false },
    { id: "9", url: "https://www.w3schools.com/html/mov_bbb.mp4", title: "Blender_Eevee_Next_Test.mp4", type: "video", isHighlight: false },
    { id: "10", url: "", title: "p6mm_Kaleidoscope.glsl", type: "other", isHighlight: false },
    { id: "11", url: "", title: "项目基础配置.json", type: "other", isHighlight: false },
    { id: "12", url: "https://picsum.photos/seed/7/400/400", title: "Admin_Dashboard_UI.png", type: "image", isHighlight: false },
    { id: "13", url: "https://picsum.photos/seed/8/400/400", title: "16bit_Item_Icons_Sheet.png", type: "image", isHighlight: false },
    { id: "14", url: "", title: "Tauri_Desktop_Config.toml", type: "other", isHighlight: false },
    { id: "15", url: "https://picsum.photos/seed/9/400/400", title: "Shader_Node_Graph_Setup.png", type: "image", isHighlight: false },
    { id: "16", url: "https://picsum.photos/seed/10/400/400", title: "Character_Concept_Sketches.jpg", type: "image", isHighlight: false },
    { id: "17", url: "", title: "API_Routes_Handler.ts", type: "other", isHighlight: false },
    { id: "18", url: "https://www.w3schools.com/html/mov_bbb.mp4", title: "VFX_Reference_Reel.mp4", type: "video", isHighlight: false },
    { id: "19", url: "", title: "Cloud_Server_Deploy_Log.txt", type: "other", isHighlight: false },
    { id: "20", url: "", title: "ICP_Filing_Docs.pdf", type: "other", isHighlight: false },
    { id: "21", url: "https://picsum.photos/seed/11/400/400", title: "portfolio_assets_v1.png", type: "image", isHighlight: false },
    { id: "22", url: "", title: "Particle_Params_Preset.json", type: "other", isHighlight: false },
    { id: "23", url: "https://picsum.photos/seed/12/400/400", title: "UI_Components_Library.png", type: "image", isHighlight: false },
    { id: "24", url: "", title: "README_Draft.md", type: "other", isHighlight: false },
    { id: "25", url: "https://picsum.photos/seed/13/400/400", title: "Texture_Albedo_01.jpg", type: "image", isHighlight: false }
  ];

  return (
    <main className="min-h-screen bg-[#eaeaea] overflow-hidden flex flex-col">
      
      {/* 1. 顶部导航栏 */}
      <div className="relative w-full border-b-[1px] border-gray-300 px-6 py-3 flex justify-center items-center z-0">
        {/* 使用 font-table */}
        <span className="font-table text-[#111] tracking-[0.2em] text-sm font-medium uppercase">
          Project-Work
        </span>
        {/* 添加 onClick 事件调用 router.back()，并使用 font-table */}
        <button 
          onClick={() => router.back()}
          className="font-table absolute right-6 text-[#111] font-light tracking-wide text-sm hover:opacity-60 transition-opacity"
        >
          Back
        </button>
      </div>

      {/* 2. 主视觉文字排版区 (Hero Section) */}
      <div className="w-full px-12 pt-16 pb-32 relative z-0">
        <div className="flex justify-between items-start">
          {/* 巨型标题：仅此处使用 font-heading */}
          <h1 className="font-heading text-[8rem] xl:text-[10rem] leading-[0.85] font-black tracking-tighter text-[#111]">
            MINI-THEBOX-<br />
            2024/
          </h1>
          
          {/* Logo 占位 div：使用 font-table */}
          <div className="w-32 xl:w-48 h-16 xl:h-24 mt-8 flex-shrink-0 border-2 border-dashed border-gray-400 bg-gray-200 flex items-center justify-center">
            <span className="font-table text-gray-500 tracking-widest text-sm">LOGO</span>
          </div>
        </div>

        {/* 带有大黑点的副标题区：全部使用 font-table */}
        <div className="mt-20 flex flex-col gap-6">
          <div className="flex items-center gap-24">
            <div className="flex items-center gap-6">
              <div className="w-10 h-10 rounded-full bg-[#111]"></div>
              <span className="font-table text-6xl font-light tracking-tight text-[#111]">Absolute MINI</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-10 h-10 rounded-full bg-[#111]"></div>
              <span className="font-table text-6xl font-light tracking-tight text-[#111]">JCW</span>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-4">
            <div className="w-10 h-10 rounded-full bg-[#111]"></div>
            <span className="font-table text-6xl font-light tracking-widest text-[#111]">创造力文化展</span>
          </div>
        </div>
      </div>

      {/* 3. MediaCanvas 图标区域 (保留向上的重叠覆盖) */}
      <div className="relative w-full flex-1 z-10 -mt-[400px]">
        <MediaCanvas items={mockData} vacuumRadius={320} />
      </div>

    </main>
  );
}
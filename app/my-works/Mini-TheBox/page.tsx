import MediaCanvas, {MediaItem} from "@/app/components/MediaCanvas";

export default function Page() {
  const mockData: MediaItem[] = [
  // --- Highlights (居中展示的核心文件) ---
  { id: "1", url: "https://picsum.photos/seed/1/800/600", title: "核心设计稿_v2.png", type: "image", isHighlight: true },
  { id: "2", url: "https://www.w3schools.com/html/mov_bbb.mp4", title: "主视觉演示视频.mp4", type: "video", isHighlight: true },
  { id: "3", url: "https://picsum.photos/seed/2/800/600", title: "Wasteland_Doctor_Sprite_64x64.png", type: "image", isHighlight: true },
  { id: "4", url: "https://picsum.photos/seed/3/800/600", title: "Houdini_Redshift_Render_Final.png", type: "image", isHighlight: true },
  { id: "5", url: "https://www.w3schools.com/html/mov_bbb.mp4", title: "GPGPU_Particles_Sim.mp4", type: "video", isHighlight: true },
  
  // --- Normal (外围随机分布的参考图与文件) ---
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
    <main>
      <MediaCanvas items={mockData} vacuumRadius={300} />
    </main>
  );
}
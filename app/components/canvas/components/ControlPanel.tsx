'use client';

// --- 1. 导出初始状态，供父组件使用 ---
export const initialControls = {
  globalSpeed: 1.0, blockWaveX: 1.5, blockWaveY: 0.8, scaleAnimSpeed: 3.0, scaleAnimAmp: 0.8,
  gradColor1: '#ff2a6d', gradColor2: '#b100ff', gradColor3: '#05d9e8', gradColor4: '#010048', 
  gradRange: 50.0, gradNoiseScale: 0.06, gradNoiseAmp: 20.0, planeAlpha: 0.85, glowIntensity: 1.5,
  noiseScale: 0.05, noiseThreshold: 0.0, smoothEdge: 0.2, ringCount: 2.0, noiseOffsetAmp: 1.5, 
  noiseOffsetX: 15.0, noiseOffsetY: 20.0, ringRadius: 25.0, ringWidth: 12.0, ringThreshold: 0.1,
  spreadX: 80.0, spreadY: 60.0, depthZ: 15.0, gridDensity: 1.5, blockSize: 1.2, cornerDotSize: 0.075, cornerDistance: 0.2,
  colorWhite: '#ffffff', colorShadow: '#0a0d14', colorAccent: '#767676', colorGrid: '#222233', colorGridDot: '#88aaff',
};

// --- 2. 基础 UI 控件 ---
const SliderControl = ({ label, value, min, max, step = 0.01, onChange, compact }: any) => (
  <div className={`flex ${compact ? 'flex-col gap-1.5' : 'items-center gap-2'} w-full`}>
    {/* 加宽了非 compact 状态下的宽度到 w-20 确保冒号显示，全局添加空格和冒号 */}
    <span className={`text-[10px] font-normal text-black ${compact ? 'w-full' : 'w-20'} truncate`} title={label}>
      {label} :
    </span>
    <input 
      title="slider"
      type="range" min={min} max={max} step={step} value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={`clean-slider ${compact ? 'w-full' : 'flex-1'}`}
    />
  </div>
);

const ColorControl = ({ label, value, onChange, compact }: any) => (
  // 增加 items-center 确保纵向居中对齐
  <div className={`flex items-center ${compact ? 'justify-between' : 'gap-2'} w-full`}>
    <span className={`text-[10px] font-normal text-black ${compact ? 'truncate' : 'w-20 truncate'}`} title={label}>
      {label} :
    </span>
    <div className="h-3.5 w-8 rounded-[2px] overflow-hidden border border-[#8a8a8a] shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] flex-shrink-0">
      <input 
        title="color"
        type="color" value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="clean-color-picker w-full h-full p-0 border-0 cursor-pointer block bg-transparent"
      />
    </div>
  </div>
);

const PanelGroup = ({ title, children }: any) => (
  <div className="flex-1 min-w-[150px] flex flex-col gap-2 p-3 bg-[#c4c4c4]">
    <h3 className="text-[10px] font-bold text-black uppercase tracking-wider">{title}</h3>
    <div className="flex flex-col gap-2 overflow-y-auto pr-4 custom-scroll">
      {children}
    </div>
  </div>
);

// --- 3. 导出的主控制面板组件 ---
export default function ControlPanel({ controls, updateControl, isUiVisible }: any) {
  return (
    <>
      <style>{`
        .clean-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          background: #d4d4d8; 
          border-radius: 999px;
          outline: none;
        }

        .clean-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 6px;
          height: 18px;
          border-radius: 9999px;
          border: 1px solid #a1a1a1;
          cursor: pointer;
          background: linear-gradient(to bottom, #eaeaea, #e6e6e6, #ababab);
          box-shadow: inset 0 1px 0 rgba(255,255,255,1), 0 1px 2px rgba(0,0,0,0.2);
        }

        .clean-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          border: 1px solid #a1a1a1;
          cursor: pointer;
          background: linear-gradient(to bottom, #eaeaea, #e6e6e6, #ababab);
          box-shadow: inset 0 1px 0 rgba(255,255,255,1), 0 1.5px 3px rgba(0,0,0,0.5);
        }
        
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #a1a1a1;
          border-radius: 4px;
        }

        .clean-color-picker::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        .clean-color-picker::-webkit-color-swatch {
          border: none;
        }
        .clean-color-picker::-moz-color-swatch {
          border: none;
        }
      `}</style>

      <div 
        className="w-full bg-[#a8a8a8] overflow-hidden transition-[height] duration-300 ease-in-out flex-shrink-0 border-b border-[#888]"
        style={{ height: isUiVisible ? '240px' : '0px' }}
      >
        <div className="h-[240px] w-full pt-4 px-4 pb-6 flex flex-nowrap gap-3 items-stretch overflow-x-auto custom-scroll">
          
          <PanelGroup title="Anim">
            <SliderControl label="Speed" value={controls.globalSpeed} min={0} max={3} onChange={(v:any)=>updateControl('globalSpeed',v)} />
            <SliderControl label="Wave X" value={controls.blockWaveX} min={0} max={5} onChange={(v:any)=>updateControl('blockWaveX',v)} />
            <SliderControl label="Wave Y" value={controls.blockWaveY} min={0} max={5} onChange={(v:any)=>updateControl('blockWaveY',v)} />
            <div className="grid grid-cols-2 gap-2 mt-1">
              <SliderControl label="Scl Spd" value={controls.scaleAnimSpeed} min={0} max={10} onChange={(v:any)=>updateControl('scaleAnimSpeed',v)} compact />
              <SliderControl label="Scl Amp" value={controls.scaleAnimAmp} min={0} max={3} onChange={(v:any)=>updateControl('scaleAnimAmp',v)} compact />
            </div>
          </PanelGroup>

          <PanelGroup title="Glow">
            <SliderControl label="Range" value={controls.gradRange} min={10} max={150} step={1} onChange={(v:any)=>updateControl('gradRange',v)} />
            <SliderControl label="Noise Scl" value={controls.gradNoiseScale} min={0.01} max={0.3} onChange={(v:any)=>updateControl('gradNoiseScale',v)} />
            <SliderControl label="Noise Amp" value={controls.gradNoiseAmp} min={0} max={80} step={1} onChange={(v:any)=>updateControl('gradNoiseAmp',v)} />
            <div className="grid grid-cols-2 gap-2 mt-1">
              <SliderControl label="Alpha" value={controls.planeAlpha} min={0.1} max={1.0} step={0.05} onChange={(v:any)=>updateControl('planeAlpha',v)} compact />
              <SliderControl label="Intensity" value={controls.glowIntensity} min={1.0} max={10.0} step={0.1} onChange={(v:any)=>updateControl('glowIntensity',v)} compact />
            </div>
          </PanelGroup>

          <PanelGroup title="Noise">
            <SliderControl label="Scale" value={controls.noiseScale} min={0.01} max={0.2} onChange={(v:any)=>updateControl('noiseScale',v)} />
            <SliderControl label="Thresh" value={controls.noiseThreshold} min={-1.0} max={1.0} step={0.05} onChange={(v:any)=>updateControl('noiseThreshold',v)} />
            <SliderControl label="Smooth" value={controls.smoothEdge} min={0.01} max={1.0} onChange={(v:any)=>updateControl('smoothEdge',v)} />
            <SliderControl label="Rings" value={controls.ringCount} min={1} max={5} step={1} onChange={(v:any)=>updateControl('ringCount',v)} />
            
            <div className="grid grid-cols-2 gap-2 mt-1">
              <SliderControl label="Offset X" value={controls.noiseOffsetX} min={-50} max={50} onChange={(v:any)=>updateControl('noiseOffsetX',v)} compact />
              <SliderControl label="Offset Y" value={controls.noiseOffsetY} min={-50} max={50} onChange={(v:any)=>updateControl('noiseOffsetY',v)} compact />
              <SliderControl label="Radius" value={controls.ringRadius} min={10} max={60} onChange={(v:any)=>updateControl('ringRadius',v)} compact />
              <SliderControl label="Width" value={controls.ringWidth} min={1} max={30} onChange={(v:any)=>updateControl('ringWidth',v)} compact />
            </div>
            <SliderControl label="R Thresh" value={controls.ringThreshold} min={-1.0} max={1.0} step={0.05} onChange={(v:any)=>updateControl('ringThreshold',v)} />
          </PanelGroup>

          <PanelGroup title="Struct">
            <div className="grid grid-cols-2 gap-2">
              <SliderControl label="Spread X" value={controls.spreadX} min={20} max={150} onChange={(v:any)=>updateControl('spreadX',v)} compact />
              <SliderControl label="Spread Y" value={controls.spreadY} min={20} max={120} onChange={(v:any)=>updateControl('spreadY',v)} compact />
              <SliderControl label="Density" value={controls.gridDensity} min={0.5} max={3.0} onChange={(v:any)=>updateControl('gridDensity',v)} compact />
              <SliderControl label="Size" value={controls.blockSize} min={0.5} max={3.0} onChange={(v:any)=>updateControl('blockSize',v)} compact />
              <SliderControl label="Dot Size" value={controls.cornerDotSize} min={0.01} max={0.8} onChange={(v:any)=>updateControl('cornerDotSize',v)} compact />
              <SliderControl label="Distance" value={controls.cornerDistance} min={0.0} max={2.0} onChange={(v:any)=>updateControl('cornerDistance',v)} compact />
            </div>
            <SliderControl label="Depth Z" value={controls.depthZ} min={5} max={30} onChange={(v:any)=>updateControl('depthZ',v)} />
          </PanelGroup>

          <PanelGroup title="Colors">
            {/* 基础颜色区域：将 Grid Dot 放入网格中，并启用 compact */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-3 w-full">
              <ColorControl label="White" value={controls.colorWhite} onChange={(v:any)=>updateControl('colorWhite',v)} compact />
              <ColorControl label="Shadow" value={controls.colorShadow} onChange={(v:any)=>updateControl('colorShadow',v)} compact />
              <ColorControl label="Accent" value={controls.colorAccent} onChange={(v:any)=>updateControl('colorAccent',v)} compact />
              <ColorControl label="Grid" value={controls.colorGrid} onChange={(v:any)=>updateControl('colorGrid',v)} compact />
              <ColorControl label="Grid Dot" value={controls.colorGridDot} onChange={(v:any)=>updateControl('colorGridDot',v)} compact />
            </div>
            
            {/* 分隔线 */}
            <div className="w-full h-[1px] bg-[#8a8a8a] my-1"></div>
            
            {/* Glow 渐变颜色区域 */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-3 w-full">
              <ColorControl label="Color 1" value={controls.gradColor1} onChange={(v:any)=>updateControl('gradColor1',v)} compact />
              <ColorControl label="Color 2" value={controls.gradColor2} onChange={(v:any)=>updateControl('gradColor2',v)} compact />
              <ColorControl label="Color 3" value={controls.gradColor3} onChange={(v:any)=>updateControl('gradColor3',v)} compact />
              <ColorControl label="Color 4" value={controls.gradColor4} onChange={(v:any)=>updateControl('gradColor4',v)} compact />
            </div>
          </PanelGroup>
          
        </div>
      </div>
    </>
  );
}
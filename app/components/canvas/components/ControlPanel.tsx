'use client';

// --- 1. 导出初始状态，供父组件使用 ---
export const initialControls = {
  globalSpeed: 1.0, blockWaveX: 1.5, blockWaveY: 0.8, scaleAnimSpeed: 3.0, scaleAnimAmp: 0.8,
  gradColor1: '#ff2a6d', gradColor2: '#b100ff', gradColor3: '#05d9e8', gradColor4: '#010048', 
  gradRange: 50.0, gradNoiseScale: 0.06, gradNoiseAmp: 20.0, planeAlpha: 0.85, glowIntensity: 1.5,
  noiseScale: 0.05, noiseThreshold: 0.0, smoothEdge: 0.2, ringCount: 2.0, noiseOffsetAmp: 1.5, 
  noiseOffsetX: 15.0, noiseOffsetY: 20.0, ringRadius: 25.0, ringWidth: 12.0, ringThreshold: 0.1,
  spreadX: 80.0, spreadY: 60.0, depthZ: 15.0, gridDensity: 1.5, blockSize: 1.2, cornerDotSize: 0.15, cornerDistance: 0.2,
  colorWhite: '#ffffff', colorShadow: '#0a0d14', colorAccent: '#60e0ff', colorGrid: '#222233', colorGridDot: '#88aaff',
};

// --- 2. 基础 UI 控件 ---
const SliderControl = ({ label, value, min, max, step = 0.01, onChange }: any) => (
  <div className="flex items-center gap-2 w-full text-white">
    <span className="text-[10px] text-gray-400 w-16 truncate" title={label}>{label}</span>
    <input 
      type="range" min={min} max={max} step={step} value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="flex-1 accent-[#60e0ff] h-1 bg-white/10 appearance-none outline-none cursor-pointer"
    />
  </div>
);

const ColorControl = ({ label, value, onChange }: any) => (
  <div className="flex items-center gap-2 w-full text-white">
    <span className="text-[10px] text-gray-400 w-16 truncate" title={label}>{label}</span>
    <div className="h-3 w-8 overflow-hidden border border-white/20">
      <input 
        type="color" value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full p-0 border-0 cursor-pointer scale-150"
      />
    </div>
  </div>
);

const PanelGroup = ({ title, children }: any) => (
  <div className="flex-1 min-w-[150px] flex flex-col gap-2 p-3 bg-black/60 border border-[#222233]">
    <h3 className="text-[10px] font-bold text-[#b100ff] uppercase tracking-wider">{title}</h3>
    <div className="flex flex-col gap-1.5 overflow-y-auto pr-1 custom-scrollbar">
      {children}
    </div>
  </div>
);

// --- 3. 导出的主控制面板组件 ---
export default function ControlPanel({ controls, updateControl, isUiVisible }: any) {
  return (
    // 【核心动画机制】：利用 transition-[height] 和 overflow-hidden 实现推开效果
    <div 
      className="w-full bg-[#060608] border-b border-[#222233] overflow-hidden transition-[height] duration-300 ease-in-out flex-shrink-0"
      style={{ height: isUiVisible ? '240px' : '0px' }}
    >
      {/* 内部容器固定 240px 高度，保证在折叠过程中 UI 不会被挤压变形 */}
      <div className="h-[240px] w-full p-4 flex flex-nowrap gap-3 items-stretch overflow-x-auto custom-scrollbar">
        <PanelGroup title="Anim">
          <SliderControl label="Speed" value={controls.globalSpeed} min={0} max={3} onChange={(v:any)=>updateControl('globalSpeed',v)} />
          <SliderControl label="Wave X" value={controls.blockWaveX} min={0} max={5} onChange={(v:any)=>updateControl('blockWaveX',v)} />
          <SliderControl label="Wave Y" value={controls.blockWaveY} min={0} max={5} onChange={(v:any)=>updateControl('blockWaveY',v)} />
          <SliderControl label="Scl Spd" value={controls.scaleAnimSpeed} min={0} max={10} onChange={(v:any)=>updateControl('scaleAnimSpeed',v)} />
          <SliderControl label="Scl Amp" value={controls.scaleAnimAmp} min={0} max={3} onChange={(v:any)=>updateControl('scaleAnimAmp',v)} />
        </PanelGroup>

        <PanelGroup title="Glow">
          <ColorControl label="Color 1" value={controls.gradColor1} onChange={(v:any)=>updateControl('gradColor1',v)} />
          <ColorControl label="Color 2" value={controls.gradColor2} onChange={(v:any)=>updateControl('gradColor2',v)} />
          <ColorControl label="Color 3" value={controls.gradColor3} onChange={(v:any)=>updateControl('gradColor3',v)} />
          <ColorControl label="Color 4" value={controls.gradColor4} onChange={(v:any)=>updateControl('gradColor4',v)} />
          <SliderControl label="Range" value={controls.gradRange} min={10} max={150} step={1} onChange={(v:any)=>updateControl('gradRange',v)} />
          <SliderControl label="Noise Scl" value={controls.gradNoiseScale} min={0.01} max={0.3} onChange={(v:any)=>updateControl('gradNoiseScale',v)} />
          <SliderControl label="Noise Amp" value={controls.gradNoiseAmp} min={0} max={80} step={1} onChange={(v:any)=>updateControl('gradNoiseAmp',v)} />
          <SliderControl label="Alpha" value={controls.planeAlpha} min={0.1} max={1.0} step={0.05} onChange={(v:any)=>updateControl('planeAlpha',v)} />
          <SliderControl label="Intensity" value={controls.glowIntensity} min={1.0} max={10.0} step={0.1} onChange={(v:any)=>updateControl('glowIntensity',v)} />
        </PanelGroup>

        <PanelGroup title="Noise">
          <SliderControl label="Scale" value={controls.noiseScale} min={0.01} max={0.2} onChange={(v:any)=>updateControl('noiseScale',v)} />
          <SliderControl label="Thresh" value={controls.noiseThreshold} min={-1.0} max={1.0} step={0.05} onChange={(v:any)=>updateControl('noiseThreshold',v)} />
          <SliderControl label="Smooth" value={controls.smoothEdge} min={0.01} max={1.0} onChange={(v:any)=>updateControl('smoothEdge',v)} />
          <SliderControl label="Rings" value={controls.ringCount} min={1} max={5} step={1} onChange={(v:any)=>updateControl('ringCount',v)} />
          <SliderControl label="Offset A" value={controls.noiseOffsetAmp} min={0} max={5} step={0.1} onChange={(v:any)=>updateControl('noiseOffsetAmp',v)} />
          <SliderControl label="Offset X" value={controls.noiseOffsetX} min={-50} max={50} onChange={(v:any)=>updateControl('noiseOffsetX',v)} />
          <SliderControl label="Offset Y" value={controls.noiseOffsetY} min={-50} max={50} onChange={(v:any)=>updateControl('noiseOffsetY',v)} />
          <SliderControl label="Radius" value={controls.ringRadius} min={10} max={60} onChange={(v:any)=>updateControl('ringRadius',v)} />
          <SliderControl label="Width" value={controls.ringWidth} min={1} max={30} onChange={(v:any)=>updateControl('ringWidth',v)} />
          <SliderControl label="R Thresh" value={controls.ringThreshold} min={-1.0} max={1.0} step={0.05} onChange={(v:any)=>updateControl('ringThreshold',v)} />
        </PanelGroup>

        <PanelGroup title="Struct">
          <SliderControl label="Spread X" value={controls.spreadX} min={20} max={150} onChange={(v:any)=>updateControl('spreadX',v)} />
          <SliderControl label="Spread Y" value={controls.spreadY} min={20} max={120} onChange={(v:any)=>updateControl('spreadY',v)} />
          <SliderControl label="Depth Z" value={controls.depthZ} min={5} max={30} onChange={(v:any)=>updateControl('depthZ',v)} />
          <SliderControl label="Density" value={controls.gridDensity} min={0.5} max={3.0} onChange={(v:any)=>updateControl('gridDensity',v)} />
          <SliderControl label="Size" value={controls.blockSize} min={0.5} max={3.0} onChange={(v:any)=>updateControl('blockSize',v)} />
          <SliderControl label="Dot Size" value={controls.cornerDotSize} min={0.01} max={0.8} onChange={(v:any)=>updateControl('cornerDotSize',v)} />
          <SliderControl label="Distance" value={controls.cornerDistance} min={0.0} max={2.0} onChange={(v:any)=>updateControl('cornerDistance',v)} />
        </PanelGroup>

        <PanelGroup title="Colors">
          <ColorControl label="White" value={controls.colorWhite} onChange={(v:any)=>updateControl('colorWhite',v)} />
          <ColorControl label="Shadow" value={controls.colorShadow} onChange={(v:any)=>updateControl('colorShadow',v)} />
          <ColorControl label="Accent" value={controls.colorAccent} onChange={(v:any)=>updateControl('colorAccent',v)} />
          <ColorControl label="Grid" value={controls.colorGrid} onChange={(v:any)=>updateControl('colorGrid',v)} />
          <ColorControl label="Grid Dot" value={controls.colorGridDot} onChange={(v:any)=>updateControl('colorGridDot',v)} />
        </PanelGroup>
      </div>
    </div>
  );
}
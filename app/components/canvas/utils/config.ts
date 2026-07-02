// config.ts

// 🟢 原本的桌面端配置
export const desktopControls = {
  globalSpeed: 1.0, blockWaveX: 1.5, blockWaveY: 0.8, scaleAnimSpeed: 3.0, scaleAnimAmp: 0.8,
  gradColor1: '#ff2a6d', gradColor2: '#b100ff', gradColor3: '#05d9e8', gradColor4: '#010048', 
  gradRange: 50.0, gradNoiseScale: 0.06, gradNoiseAmp: 20.0, planeAlpha: 0.85, glowIntensity: 1.5,
  noiseScale: 0.05, noiseThreshold: 0.0, smoothEdge: 0.2, ringCount: 2.0, noiseOffsetAmp: 1.5, 
  noiseOffsetX: 15.0, noiseOffsetY: 20.0, ringRadius: 25.0, ringWidth: 12.0, ringThreshold: 0.1,
  // 桌面端横屏：X轴扩散范围大，Y轴相对小
  spreadX: 80.0, spreadY: 60.0, depthZ: 15.0, gridDensity: 1.5, blockSize: 1.2, cornerDotSize: 0.075, cornerDistance: 0.2,
  colorWhite: '#ffffff', colorShadow: '#0a0d14', colorAccent: '#767676', colorGrid: '#222233', colorGridDot: '#88aaff',
};

// 🔴 移动端配置 (继承桌面端并覆盖特定参数)
export const mobileControls = {
  ...desktopControls,
  // 手机端竖屏：大幅缩减X轴，增加Y轴延伸，稍微放大 block 尺寸以便在手机上看清
  spreadX: 15.0, 
  // 可以适当降低网格密度节省手机性能
  gridDensity: 5.0, 
  ringWidth: 1.0, 
  gradRange: 20.0
};
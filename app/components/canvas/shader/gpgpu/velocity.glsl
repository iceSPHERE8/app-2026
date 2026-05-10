uniform float uTime;
  uniform float uDelta;
  uniform float uForceStrength;
  uniform vec3 uMouse;
  uniform float uHasMouse; // 1.0 为追随鼠标，0.0 为自由游走

  // Simplex 3D Noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    vec4 j = p - 49.0 * floor(p * (1.0/49.0));
    vec4 x_ = floor(j * (1.0/7.0));
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * (1.0/7.0) + 0.5/7.0 - 0.5;
    vec4 y = y_ * (1.0/7.0) + 0.5/7.0 - 0.5;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 pos = texture2D(texturePosition, uv);
    vec4 vel = texture2D(textureVelocity, uv);
    float idOffset = pos.w;

    // --- 卷曲噪声计算核心 ---
    float eps = 0.1; // 采样步长：越小细节越密，越大越平滑
    float noiseScale = 0.05; // 噪声频率
    
    // 采样当前点及相邻点的噪声值 (使用 pos.z 或 uTime 作为第三维度)
    vec3 p = vec3(pos.xy * noiseScale, uTime * 0.1 + idOffset);
    
    // 在 x 和 y 方向做差分计算近似导数
    float n1 = snoise(p + vec3(0.0, eps, 0.0));
    float n2 = snoise(p - vec3(0.0, eps, 0.0));
    float n3 = snoise(p + vec3(eps, 0.0, 0.0));
    float n4 = snoise(p - vec3(eps, 0.0, 0.0));

    // 计算卷曲向量：(dy, -dx)
    vec2 curlForce = vec2(n1 - n2, n4 - n3) / (2.0 * eps) * 0.5;

    // *** 核心：凝聚力 (Attractor) ***
    // 定义一个随时间缓慢移动的群体目标中心
    vec3 attractorPos = vec3(
      sin(uTime * 1.0) * 10.0,
      cos(uTime * 0.5) * 5.0,
      0.0
    );

    vec3 toCenter = attractorPos - pos.xyz;
    float distToCenter = length(toCenter);

    // 凝聚力：距离越远引力越强（但有上限，防止过度塌陷）
    vec3 cohesionForce = normalize(toCenter) * min(distToCenter * 0.1, 2.0);

    // *** 核心：鱼群/鸟群噪声 (Scattering Field) ***
    // 基础核心流噪声 (Core Flow) - 低频，大范围移动
    float noiseScaleCore = 0.15;
    vec3 nCorePos = vec3(pos.x * noiseScaleCore + uTime * 0.05, pos.y * noiseScaleCore, uTime * 0.1 + idOffset * 0.01);
    float n1_core = snoise(nCorePos);
    float n2_core = snoise(nCorePos + vec3(17.4, 25.8, 11.9));
    vec2 coreFlowForce = vec2(n2_core, -n1_core) * uForceStrength;

    // *** 分散/尾部噪声 (Tail Scattering) ***
    // 边缘分散噪声 - 高频，产生杂乱感
    float noiseScaleTail = 0.8; // 频率高
    vec3 nTailPos = vec3(pos.x * noiseScaleTail, pos.y * noiseScaleTail, uTime * 0.2 + idOffset);
    float n1_tail = snoise(nTailPos);
    float n2_tail = snoise(nTailPos + vec3(31.4, 15.8, 7.9));
    vec2 tailScatteringForce = vec2(n1_tail, n2_tail) * uForceStrength * 1.0;

    // *** 力场混合：越靠近中心越整齐，越在边缘越分散 ***
    // 计算分散因子：在中心 2.0 距离内几乎不分散，10.0 以外完全分散
    float scatteringFactor = smoothstep(0.1, 10.0, distToCenter);

    // 2. 引入“防聚集”噪声 (Anti-Clumping Noise)
    // 使用极高频的噪声，让每个粒子即便在同一位置也有不同的逃逸方向
    float antiClumpScale = 5.0; 
    vec3 nAntiPos = vec3(pos.x * antiClumpScale, pos.y * antiClumpScale, idOffset);
    vec2 antiClumpForce = vec2(snoise(nAntiPos), snoise(nAntiPos + 123.4)) * 0.5;

    // 3. 动态距离排斥
    // 如果粒子离中心太近，强行施加一个向外的推力
    vec3 repelCenterForce = vec3(0.0);
    if(distToCenter < 2.0) {
        repelCenterForce = normalize(pos.xyz - attractorPos) * (1.0 / (distToCenter + 0.1));
    }

    // --- 1. 获取鼠标引力参数 ---
    // uMouse 已经在你的 JS 中通过 viewport 映射到了世界坐标
    vec3 mousePos = uMouse; 
    vec3 toMouse = mousePos - pos.xyz;
    float distToMouse = length(toMouse);

    // --- 2. 计算吸引力 (仅当鼠标在画布内时) ---
    vec3 mouseForce = vec3(0.0);
    
    if (uHasMouse > 0.5) {
        // 设定吸引范围，例如 20.0 单位以内产生感应
        float mouseRadius = 20.0;
        if (distToMouse < mouseRadius) {
            // 距离越近，力越强
            // 使用 smoothstep 让边缘过渡自然
            float forceIdx = 1.0 - smoothstep(0.0, mouseRadius, distToMouse);
            
            // 吸引力公式：强度 * 方向 * 衰减因子
            // 强度可以设为 2.0，你可以根据需要调整
            mouseForce = normalize(toMouse) * forceIdx * 1.0; 
        }
    }

    // 应用力
    vel.xy += mouseForce.xy * uDelta;
    vel.xy += cohesionForce.xy * uDelta * 0.25; // 应用凝聚力
    vel.xy += (curlForce * uForceStrength + cohesionForce.xy) * uDelta * 0.15;
    vel.xy += antiClumpForce * uDelta;
    // vel.xy += repelCenterForce.xy * uDelta * 2.0;
    vel.xy += coreFlowForce * uDelta * (1.0 - scatteringFactor); // 核心粒子受整齐流影响
    vel.xy += tailScatteringForce * uDelta * scatteringFactor; // 尾部粒子受随机力影响

    // 动态阻尼：核心区域阻尼大（模拟水的粘性），外围阻尼小（更活跃）
    float currentDamping = mix(0.94, 0.97, scatteringFactor);
    vel.xyz *= currentDamping;

    // 软边界排斥 (保持不变，但增加一个强制性)
    float rangeX = 50.0;
    float rangeY = 36.0;
    if (abs(pos.x) > rangeX) {
      vel.x -= sign(pos.x) * uDelta * 10.0;
      vel.x *= 0.9; // 强制减速
    }
    if (abs(pos.y) > rangeY) {
      vel.y -= sign(pos.y) * uDelta * 10.0;
      vel.y *= 0.9; // 强制减速
    }
    gl_FragColor = vec4(vel.xyz, 1.0);
  }
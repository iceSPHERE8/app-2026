uniform float uTime;
uniform vec3 uColorWhite;
uniform vec3 uColorShadow;
uniform vec3 uColorAccent;
uniform float uDepthMin;
uniform float uDepthMax;

uniform float uCornerDotSize;
uniform float uCornerDistance;

uniform vec3 uGradColor1;
uniform vec3 uGradColor2;
uniform vec3 uGradColor3;
uniform vec3 uGradColor4;
uniform float uGradRange;
uniform float uGradNoiseScale;
uniform float uGradNoiseAmp;

uniform float uPlaneAlpha;
uniform float uGlowIntensity;

varying vec2 vUv;
varying vec3 vWorldPos;
varying float vSeed;
varying float vType;
varying vec2 vFinalScale;
varying float vLayerType;
varying float vVisibility;
varying vec3 vOffset;

vec4 permute(vec4 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
}
vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}
float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0 / 7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

void main() {
    float currentDotSize = uCornerDotSize * smoothstep(0.0, 0.5, vVisibility);

    float margin = uCornerDistance + uCornerDotSize + 0.1;
    vec2 expandedScale = vFinalScale + vec2(margin * 2.0);
    vec2 absPhysicalPos = abs(vUv - 0.5) * expandedScale;

    vec2 blockHalfSize = vFinalScale * 0.5;
    bool inBlock = (absPhysicalPos.x <= blockHalfSize.x) && (absPhysicalPos.y <= blockHalfSize.y);

    vec2 dotCenter = blockHalfSize + vec2(uCornerDistance);
    float cornerDist = length(absPhysicalPos - dotCenter);
    float isCorner = smoothstep(currentDotSize + 0.02, currentDotSize, cornerDist);

    vec3 symPos = abs(vOffset);

    float gradNoise = snoise(vec3(symPos.xy * uGradNoiseScale, uTime * 0.15));
    float organicDist = length(symPos.xy) + gradNoise * uGradNoiseAmp;
    float t = clamp(organicDist / uGradRange, 0.0, 1.0);

    vec3 gradColor;
    if(t < 0.333) {
        gradColor = mix(uGradColor1, uGradColor2, smoothstep(0.0, 0.333, t));
    } else if(t < 0.666) {
        gradColor = mix(uGradColor2, uGradColor3, smoothstep(0.333, 0.666, t));
    } else {
        gradColor = mix(uGradColor3, uGradColor4, smoothstep(0.666, 1.0, t));
    }

    // 给渐变色乘以发光强度 (产生过曝/高亮效果)
    gradColor *= uGlowIntensity;

    vec3 currentThemeWhite = mix(gradColor, uColorWhite, smoothstep(0.8, 1.0, t));

    float depthNorm = clamp((vWorldPos.z - uDepthMin) / (uDepthMax - uDepthMin), 0.0, 1.0);
    float shadowFactor = depthNorm - fract(sin(dot(vWorldPos.xy, vec2(12.9898, 78.233))) * 43758.5453) * 0.1;

    vec3 baseColor = mix(uColorShadow, currentThemeWhite, smoothstep(0.0, 1.0, shadowFactor));

    if(vLayerType > 1.0) {
        float colorIntensity = min(0.1 + vLayerType * 0.15, 0.8);
        baseColor = mix(baseColor, uColorAccent * uGlowIntensity, colorIntensity);
    }

    vec4 finalColor = vec4(0.0);

    if(vType == 0.0) {
        if(isCorner > 0.5) {
        // 顶点粒子增加发光
            finalColor = vec4(uColorAccent * uGlowIntensity * 1.5, 1.0);
        } else if(inBlock) {
        // 【核心修改】：平面的最终颜色输出使用 uPlaneAlpha 作为透明度
            finalColor = vec4(baseColor, uPlaneAlpha);
            if(vSeed > 0.9 && absPhysicalPos.x < blockHalfSize.x * 0.8 && absPhysicalPos.y < blockHalfSize.y * 0.8)
                discard;
        } else {
            discard;
        }
    } else if(vType == 1.0) {
        if(isCorner > 0.5) {
            finalColor = vec4(uColorWhite * uGlowIntensity, 1.0);
        } else {
            discard;
        }
    }

    gl_FragColor = finalColor;
}
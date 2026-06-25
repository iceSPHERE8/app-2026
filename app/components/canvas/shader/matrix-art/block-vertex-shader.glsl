uniform float uTime;
uniform float uAnimSpeed;
uniform float uAnimAmpX;
uniform float uAnimAmpY;

uniform float uScaleAnimSpeed;
uniform float uScaleAnimAmp;

uniform float uCornerDotSize;
uniform float uCornerDistance;

uniform float uRingCount;
uniform float uNoiseOffsetAmp;

uniform float uNoiseScale;
uniform float uNoiseThreshold;
uniform vec3 uNoiseOffset;
uniform float uRingRadius;
uniform float uRingWidth;
uniform float uRingThreshold;

uniform float uSmoothEdge;

attribute vec3 aOffset;
attribute vec4 aData;
attribute vec2 aScale;

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
    vUv = uv;
    vSeed = aData.x;
    float phaseX = aData.y;
    float phaseY = aData.z;
    vType = aData.w;

    vOffset = aOffset;

    float time = uTime * uAnimSpeed;
    vec3 pos = position;

    vec3 symPos = abs(aOffset);

    float n0 = snoise(symPos * uNoiseScale + time * 0.2);
    float mask0 = smoothstep(uNoiseThreshold - uSmoothEdge, uNoiseThreshold + uSmoothEdge, n0);

    float finalMask = mask0;
    vLayerType = 1.0;

    float distToCenter = length(symPos.xy);

    for(int i = 1; i < 5; i++) {
        float fi = float(i);
        if(fi < uRingCount) {
            vec3 currentOffset = uNoiseOffset * (fi * uNoiseOffsetAmp);
            vec3 offsetPos = symPos + currentOffset;
            float n_i = snoise(offsetPos * uNoiseScale * (1.0 + fi * 0.1) - time * 0.15);

            float currentRadius = uRingRadius * fi;
            float ringMask = smoothstep(currentRadius + uRingWidth, currentRadius, distToCenter) * smoothstep(currentRadius - uRingWidth, currentRadius, distToCenter);

            float ringStep = smoothstep(uRingThreshold - uSmoothEdge, uRingThreshold + uSmoothEdge, n_i);
            float currentLayerMask = ringStep * ringMask;

            if(currentLayerMask > finalMask) {
                vLayerType = fi + 1.0;
            }
            finalMask = max(finalMask, currentLayerMask);
        }
    }

    if(finalMask <= 0.001) {
        gl_Position = vec4(0.0);
        return;
    }

    vVisibility = finalMask;

    float scaleCycle = sin(time * uScaleAnimSpeed + phaseX);
    float animScaleX = 1.0 + max(0.0, scaleCycle) * uScaleAnimAmp;
    float animScaleY = 1.0 + max(0.0, -scaleCycle) * uScaleAnimAmp;

    float squashX = mix(1.0, finalMask, step(0.5, vSeed));
    float squashY = mix(finalMask, 1.0, step(0.5, vSeed));

    animScaleX *= squashX;
    animScaleY *= squashY;

    vec2 finalScale = aScale * vec2(animScaleX, animScaleY);
    vFinalScale = finalScale;

    float margin = uCornerDistance + uCornerDotSize + 0.1;
    vec2 expandedScale = finalScale + vec2(margin * 2.0);

    pos.x *= expandedScale.x;
    pos.y *= expandedScale.y;

    vec3 offset = aOffset;
    float signX = aOffset.x >= 0.0 ? 1.0 : -1.0;
    float signY = aOffset.y >= 0.0 ? 1.0 : -1.0;

    float moveX = sin(time + phaseX) * uAnimAmpX;
    float moveY = cos(time * 0.8 + phaseY) * uAnimAmpY;

    offset.x += moveX * signX;
    offset.y += moveY * signY;

    vec4 worldPos = modelMatrix * instanceMatrix * vec4(pos + offset, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
}
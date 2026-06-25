uniform vec3 uColorGrid;
  uniform vec3 uColorDot;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    float lineDist = abs(vUv.x - 0.5);
    float line = smoothstep(0.05, 0.0, lineDist) * 0.3;
    float dotTop = smoothstep(0.1, 0.05, length(vUv - vec2(0.5, 1.0)));
    float dotBottom = smoothstep(0.1, 0.05, length(vUv - vec2(0.5, 0.0)));
    float dots = max(dotTop, dotBottom);
    
    float alpha = max(line, dots);
    if (alpha < 0.01) discard;

    vec3 finalColor = mix(uColorGrid, uColorDot, dots);
    float depthAlpha = smoothstep(-30.0, 10.0, vWorldPos.z);
    gl_FragColor = vec4(finalColor, alpha * depthAlpha);
  }
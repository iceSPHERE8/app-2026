uniform float uTime;
  uniform float uSpeed;
  uniform float uWaveFreq;
  uniform float uWaveAmp;
  uniform float uStretchAmp;
  
  attribute vec3 aOffset;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float time = uTime * uSpeed;
    float wave = sin(abs(aOffset.x) * uWaveFreq - time);
    pos.y *= 1.0 + wave * uStretchAmp;
    
    vec3 offset = aOffset;
    float signY = aOffset.y >= 0.0 ? 1.0 : -1.0;
    offset.y += wave * uWaveAmp * signY;

    vec4 worldPos = modelMatrix * instanceMatrix * vec4(pos + offset, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
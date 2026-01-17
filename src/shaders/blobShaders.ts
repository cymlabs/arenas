// Perlin Noise Organic Blob Shader
// Creates pulsing, breathing organic forms like the reference image

export const blobVertexShader = `
  uniform float uTime;
  uniform float uNoiseScale;
  uniform float uNoiseStrength;
  uniform float uPulseSpeed;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;
  varying vec2 vUv;
  
  // 3D Simplex Noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
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
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 4; i++) {
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    
    return value;
  }
  
  void main() {
    vUv = uv;
    vNormal = normal;
    
    // Animated noise displacement
    vec3 noisePos = position * uNoiseScale + uTime * 0.15;
    float noise = fbm(noisePos);
    
    // Add pulse breathing effect
    float pulse = sin(uTime * uPulseSpeed) * 0.1 + 1.0;
    
    // Apply displacement
    float displacement = noise * uNoiseStrength * pulse;
    vec3 newPosition = position + normal * displacement;
    
    vDisplacement = displacement;
    vPosition = newPosition;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

export const blobFragmentShader = `
  uniform float uTime;
  uniform vec3 uColorCold;
  uniform vec3 uColorWarm;
  uniform vec3 uColorHot;
  uniform float uIntensity;
  uniform float uGlowStrength;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;
  varying vec2 vUv;
  
  void main() {
    // Calculate view-dependent lighting
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - dot(viewDirection, vNormal), 2.0);
    
    // Map displacement to color temperature
    float colorMix = smoothstep(-0.3, 0.5, vDisplacement);
    vec3 baseColor = mix(uColorCold, uColorWarm, colorMix);
    
    // Add hot spots for high intensity
    if (uIntensity > 0.7) {
      baseColor = mix(baseColor, uColorHot, (uIntensity - 0.7) * 2.0);
    }
    
    // Fresnel rim glow
    vec3 rimColor = mix(uColorCold, uColorWarm, 0.5);
    vec3 finalColor = mix(baseColor, rimColor, fresnel * uGlowStrength);
    
    // Add subtle pulsing emission
    float emission = sin(uTime * 2.0 + vDisplacement * 10.0) * 0.1 + 0.9;
    finalColor *= emission;
    
    // Edge glow effect
    float edgeGlow = fresnel * uGlowStrength * 1.5;
    finalColor += rimColor * edgeGlow;
    
    gl_FragColor = vec4(finalColor, 0.95);
  }
`;

// Ambient particle shader for background
export const particleVertexShader = `
  uniform float uTime;
  uniform float uPixelRatio;
  
  attribute float aScale;
  attribute float aRandomness;
  
  varying float vAlpha;
  
  void main() {
    vec3 pos = position;
    
    // Slow drift motion
    pos.x += sin(uTime * 0.1 + aRandomness * 6.28) * 0.3;
    pos.y += cos(uTime * 0.08 + aRandomness * 6.28) * 0.3;
    pos.z += sin(uTime * 0.12 + aRandomness * 3.14) * 0.2;
    
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
    
    // Size attenuation
    gl_PointSize = aScale * uPixelRatio * (200.0 / -viewPosition.z);
    gl_PointSize = max(gl_PointSize, 1.0);
    
    // Distance-based alpha
    float distance = length(viewPosition.xyz);
    vAlpha = smoothstep(50.0, 10.0, distance) * 0.4;
  }
`;

export const particleFragmentShader = `
  uniform vec3 uColor;
  
  varying float vAlpha;
  
  void main() {
    // Circular particle with soft edge
    float distanceToCenter = length(gl_PointCoord - vec2(0.5));
    float alpha = smoothstep(0.5, 0.2, distanceToCenter) * vAlpha;
    
    gl_FragColor = vec4(uColor, alpha);
  }
`;

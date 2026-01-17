// Attention Ecology - Fluid Dynamics Shaders
// Dark liquid surface with vortices, flow fields, and disturbances

// Main liquid surface vertex shader
export const fluidSurfaceVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Main liquid surface fragment shader with flow field visualization
export const fluidSurfaceFragmentShader = `
  precision highp float;
  
  uniform float uTime;
  uniform vec2 uResolution;
  uniform sampler2D uFlowMap;
  uniform float uTurbulence;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  
  // Simplex noise for organic variation
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  
  // FBM for layered noise
  float fbm(vec2 p) {
    float sum = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for(int i = 0; i < 5; i++) {
      sum += amp * snoise(p * freq);
      amp *= 0.5;
      freq *= 2.0;
    }
    return sum;
  }
  
  // Vortex flow field
  vec2 vortexField(vec2 p, vec2 center, float strength, float size) {
    vec2 d = p - center;
    float dist = length(d);
    float falloff = smoothstep(size, 0.0, dist);
    
    // Perpendicular vector for rotation
    vec2 perp = vec2(-d.y, d.x);
    
    // Inward spiral
    vec2 flow = normalize(perp) * falloff * strength;
    flow += normalize(-d) * falloff * strength * 0.3; // Inward pull
    
    return flow;
  }
  
  void main() {
    vec2 uv = vUv;
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 p = uv * aspect;
    
    // Base dark liquid color
    vec3 baseColor = vec3(0.01, 0.015, 0.025);
    
    // Subtle surface caustics
    float time = uTime * 0.15;
    float caustics = fbm(p * 3.0 + time) * 0.5 + 0.5;
    caustics = pow(caustics, 3.0) * 0.15;
    
    // Surface highlights
    float highlight = snoise(p * 8.0 + vec2(time * 0.5, time * 0.3));
    highlight = smoothstep(0.6, 0.8, highlight) * 0.1;
    
    // Flow distortion
    vec2 flow = vec2(
      snoise(p * 2.0 + time),
      snoise(p * 2.0 + vec2(100.0) + time)
    ) * 0.02 * uTurbulence;
    
    // Edge gradient for depth
    float edgeDist = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
    float edgeFade = smoothstep(0.0, 0.15, edgeDist);
    
    // Combine
    vec3 color = baseColor;
    color += vec3(0.02, 0.04, 0.08) * caustics;
    color += vec3(0.1, 0.15, 0.2) * highlight;
    color *= edgeFade;
    
    // Subtle blue tint in lighter areas
    color = mix(color, color * vec3(0.8, 0.9, 1.0), caustics);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Vortex overlay shader - renders individual vortices
export const vortexVertexShader = `
  uniform float uTime;
  uniform float uStrength;
  uniform float uSize;
  
  varying vec2 vUv;
  varying float vStrength;
  
  void main() {
    vUv = uv;
    vStrength = uStrength;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const vortexFragmentShader = `
  precision highp float;
  
  uniform float uTime;
  uniform float uStrength;
  uniform float uSize;
  uniform float uDepth;
  uniform float uSpinSpeed;
  uniform vec3 uColor;
  
  varying vec2 vUv;
  
  #define PI 3.14159265359
  
  void main() {
    vec2 center = vec2(0.5);
    vec2 uv = vUv - center;
    float dist = length(uv);
    float angle = atan(uv.y, uv.x);
    
    // Spiral pattern
    float spiral = sin(angle * 3.0 - dist * 20.0 + uTime * uSpinSpeed * 2.0);
    spiral = spiral * 0.5 + 0.5;
    
    // Radial falloff
    float falloff = 1.0 - smoothstep(0.0, 0.5, dist);
    falloff = pow(falloff, 1.5);
    
    // Depth creates darker center
    float depthDarkness = smoothstep(0.4, 0.0, dist) * uDepth;
    
    // Swirl intensity
    float swirl = spiral * falloff * uStrength;
    
    // Color with depth
    vec3 color = uColor * swirl;
    color -= vec3(0.02, 0.01, 0.0) * depthDarkness; // Darker center
    
    // Edge glow
    float edgeGlow = smoothstep(0.5, 0.3, dist) - smoothstep(0.3, 0.1, dist);
    color += uColor * edgeGlow * 0.3;
    
    float alpha = falloff * uStrength * 0.6;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// Floating artifact (person) shader
export const artifactVertexShader = `
  attribute float aScale;
  attribute float aInfluence;
  
  uniform float uTime;
  
  varying vec2 vUv;
  varying float vInfluence;
  
  void main() {
    vUv = uv;
    vInfluence = aInfluence;
    
    // Subtle bob animation
    vec3 pos = position;
    pos.y += sin(uTime * 2.0 + position.x * 10.0) * 0.02 * aInfluence;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Size based on scale attribute
    gl_PointSize = aScale * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const artifactFragmentShader = `
  precision highp float;
  
  uniform float uTime;
  uniform vec3 uColor;
  
  varying vec2 vUv;
  varying float vInfluence;
  
  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    
    // Soft glass bead shape
    float bead = 1.0 - smoothstep(0.3, 0.5, dist);
    
    // Inner highlight (glass refraction)
    float highlight = smoothstep(0.3, 0.1, length(center - vec2(-0.1, -0.1)));
    
    // Outer glow for influence
    float glow = (1.0 - smoothstep(0.2, 0.5, dist)) * vInfluence * 0.5;
    
    vec3 color = uColor * bead;
    color += vec3(1.0) * highlight * 0.3;
    color += uColor * glow;
    
    float alpha = bead + glow * 0.3;
    
    if (alpha < 0.01) discard;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// Shockwave/ripple shader
export const shockwaveVertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const shockwaveFragmentShader = `
  precision highp float;
  
  uniform float uTime;
  uniform float uProgress;
  uniform vec3 uColor;
  uniform float uIntensity;
  
  varying vec2 vUv;
  
  void main() {
    vec2 center = vec2(0.5);
    float dist = length(vUv - center) * 2.0;
    
    // Expanding ring
    float ringRadius = uProgress;
    float ringWidth = 0.08 * (1.0 - uProgress * 0.5);
    
    float ring = smoothstep(ringRadius - ringWidth, ringRadius, dist) 
               - smoothstep(ringRadius, ringRadius + ringWidth, dist);
    
    // Secondary rings (aftershocks)
    float ring2Radius = uProgress * 0.7;
    float ring2 = smoothstep(ring2Radius - ringWidth * 0.5, ring2Radius, dist) 
                - smoothstep(ring2Radius, ring2Radius + ringWidth * 0.5, dist);
    ring2 *= 0.4;
    
    // Fade out
    float fade = 1.0 - uProgress;
    
    vec3 color = uColor * (ring + ring2) * uIntensity;
    float alpha = (ring + ring2) * fade;
    
    gl_FragColor = vec4(color, alpha * 0.8);
  }
`;

// Flow lines shader (subtle current visualization)
export const flowLinesVertexShader = `
  attribute float aProgress;
  attribute float aSpeed;
  
  uniform float uTime;
  
  varying float vProgress;
  varying float vAlpha;
  
  void main() {
    float t = fract(aProgress + uTime * aSpeed * 0.1);
    vProgress = t;
    vAlpha = sin(t * 3.14159);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 2.0;
  }
`;

export const flowLinesFragmentShader = `
  precision highp float;
  
  uniform vec3 uColor;
  
  varying float vProgress;
  varying float vAlpha;
  
  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    float alpha = (1.0 - smoothstep(0.0, 0.5, dist)) * vAlpha * 0.3;
    
    gl_FragColor = vec4(uColor, alpha);
  }
`;

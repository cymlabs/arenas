// Flowing Ribbon Shader - Energy flow between entities
// Creates organic tube connections with animated flow

export const ribbonVertexShader = `
  uniform float uTime;
  uniform float uFlowSpeed;
  uniform float uThickness;
  
  varying vec2 vUv;
  varying float vProgress;
  varying vec3 vNormal;
  
  void main() {
    vUv = uv;
    vProgress = uv.x; // Progress along the ribbon
    vNormal = normal;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const ribbonFragmentShader = `
  uniform float uTime;
  uniform float uFlowSpeed;
  uniform vec3 uColorStart;
  uniform vec3 uColorEnd;
  uniform float uOpacity;
  uniform float uGlowIntensity;
  
  varying vec2 vUv;
  varying float vProgress;
  varying vec3 vNormal;
  
  void main() {
    // Animated flow pattern
    float flow = fract(vProgress * 3.0 - uTime * uFlowSpeed);
    float pulse = smoothstep(0.0, 0.3, flow) * smoothstep(1.0, 0.7, flow);
    
    // Color gradient along ribbon
    vec3 color = mix(uColorStart, uColorEnd, vProgress);
    
    // Add glow at edges
    float edge = 1.0 - abs(vUv.y - 0.5) * 2.0;
    float glow = pow(edge, 2.0) * uGlowIntensity;
    
    // Combine with flow animation
    vec3 finalColor = color + color * pulse * 0.5;
    finalColor += color * glow * 0.3;
    
    // Fade at ends
    float fadeStart = smoothstep(0.0, 0.1, vProgress);
    float fadeEnd = smoothstep(1.0, 0.9, vProgress);
    float alpha = fadeStart * fadeEnd * uOpacity * (0.5 + pulse * 0.5);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// Merge pulse effect shader
export const mergePulseVertexShader = `
  uniform float uTime;
  uniform float uScale;
  
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    
    vec3 pos = position * uScale;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const mergePulseFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uProgress; // 0 to 1, controls the pulse lifecycle
  
  varying vec2 vUv;
  
  void main() {
    vec2 center = vUv - 0.5;
    float dist = length(center);
    
    // Expanding ring
    float ringRadius = uProgress * 0.5;
    float ringThickness = 0.05 * (1.0 - uProgress);
    float ring = smoothstep(ringRadius - ringThickness, ringRadius, dist) 
               - smoothstep(ringRadius, ringRadius + ringThickness, dist);
    
    // Fade out as it expands
    float alpha = ring * (1.0 - uProgress) * 2.0;
    
    // Inner glow
    float innerGlow = smoothstep(0.5, 0.0, dist) * (1.0 - uProgress);
    
    vec3 color = uColor + uColor * innerGlow;
    
    gl_FragColor = vec4(color, alpha + innerGlow * 0.5);
  }
`;

// Surge shockwave shader
export const surgeVertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const surgeFragmentShader = `
  uniform float uTime;
  uniform float uProgress;
  uniform vec3 uColor;
  
  varying vec2 vUv;
  
  void main() {
    vec2 center = vUv - 0.5;
    float dist = length(center);
    
    // Multiple expanding rings
    float ring1 = smoothstep(uProgress * 0.5 - 0.02, uProgress * 0.5, dist) 
                - smoothstep(uProgress * 0.5, uProgress * 0.5 + 0.02, dist);
    float ring2 = smoothstep(uProgress * 0.4 - 0.015, uProgress * 0.4, dist) 
                - smoothstep(uProgress * 0.4, uProgress * 0.4 + 0.015, dist);
    float ring3 = smoothstep(uProgress * 0.3 - 0.01, uProgress * 0.3, dist) 
                - smoothstep(uProgress * 0.3, uProgress * 0.3 + 0.01, dist);
    
    float rings = ring1 + ring2 * 0.6 + ring3 * 0.3;
    
    // Fade out
    float fade = 1.0 - uProgress;
    
    gl_FragColor = vec4(uColor, rings * fade);
  }
`;

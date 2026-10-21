// Aldring og glans i verdensrom. De malte kartene er fortsatt grunnlaget.
export const SURFACE = { value: 1 };

export function shaderLayer(mat, key, fn) {
  const prev = mat.onBeforeCompile, prevKey = mat.customProgramCacheKey.bind(mat);
  mat.onBeforeCompile = (sh, renderer) => { prev.call(mat, sh, renderer); fn(sh); };
  mat.customProgramCacheKey = () => prevKey() + '|' + key;
}

export const SURFACE_NOISE = `
float surfaceHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float surfaceNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(surfaceHash(i), surfaceHash(i + vec2(1.0, 0.0)), f.x),
    mix(surfaceHash(i + vec2(0.0, 1.0)), surfaceHash(i + vec2(1.0)), f.x), f.y);
}`;

export function surfacePosition(sh) {
  sh.vertexShader = sh.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vSurfacePosition;')
    .replace('#include <project_vertex>', `{
      vec4 surfaceP = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        surfaceP = instanceMatrix * surfaceP;
      #endif
      vSurfacePosition = (modelMatrix * surfaceP).xyz;
    }
    #include <project_vertex>`);
  sh.fragmentShader = sh.fragmentShader.replace('#include <common>',
    '#include <common>\nvarying vec3 vSurfacePosition;\n' + SURFACE_NOISE);
}

export function addSurfaceDetail(mat, kind = 'stone') {
  if (mat.userData.surface) return mat;
  mat.userData.surface = kind;
  shaderLayer(mat, 'surface-1-' + kind, sh => {
    sh.uniforms.uSurfaceDetail = SURFACE;
    surfacePosition(sh);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uSurfaceDetail;')
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        vec3 surfaceP = vSurfacePosition;
        float surfaceLarge = surfaceNoise(surfaceP.xz * 0.28 + surfaceP.y * 0.12);
        float surfaceFine = surfaceNoise(surfaceP.xz * 2.4 + vec2(surfaceP.y * 1.7));
        float surfaceAge = surfaceLarge * 0.65 + surfaceFine * 0.35;
        diffuseColor.rgb *= mix(1.0, 0.83 + surfaceAge * 0.29, uSurfaceDetail);
        roughnessFactor = clamp(roughnessFactor + (surfaceAge - 0.5) * 0.22 * uSurfaceDetail, 0.08, 1.0);
        ${kind === 'stone' ? `
          float surfaceMoss = (1.0 - smoothstep(0.15, 1.5, surfaceP.y)) * smoothstep(0.33, 0.73, surfaceLarge);
          diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.66, 0.85, 0.51), surfaceMoss * 0.65 * uSurfaceDetail);
        ` : kind === 'roof' ? `
          float surfaceStreak = surfaceNoise(surfaceP.xz * 1.9 + vec2(0.0, surfaceP.y * 0.12));
          diffuseColor.rgb *= mix(1.0, 0.84 + surfaceStreak * 0.2, uSurfaceDetail);
        ` : kind === 'wood' ? `
          float surfaceFoot = 1.0 - smoothstep(0.0, 0.85, surfaceP.y);
          diffuseColor.rgb *= 1.0 - surfaceFoot * (0.08 + surfaceLarge * 0.1) * uSurfaceDetail;
        ` : ''}`);
  });
  return mat;
}

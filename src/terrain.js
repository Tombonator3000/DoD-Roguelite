// Blander også normalkart, så overgangen ikke skifter brått i regn og sidelys.
import * as THREE from 'three';
import { T } from './state.js';
import { addWetness } from './wet.js';
import { shaderLayer, surfacePosition } from './surfaces.js';
import { terrainField, terrainWeights } from './terrainfield.js';

export function terrainMaterial(TX) {
  const mat = new THREE.MeshStandardMaterial({ ...TX.grass, roughness: 0.94, vertexColors: true });
  const blend = { value: 1 };
  mat.userData.terrainBlend = blend;
  addWetness(mat, { terrain: true });
  shaderLayer(mat, 'terrain-1', sh => {
    surfacePosition(sh);
    Object.assign(sh.uniforms, {
      uTerrainBlend: blend,
      uDirt: { value: TX.dirt.map }, uDirtN: { value: TX.dirt.normalMap },
      uCobble: { value: TX.cobble.map }, uCobbleN: { value: TX.cobble.normalMap },
      uForest: { value: TX.forest.map }, uForestN: { value: TX.forest.normalMap },
    });
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec4 terrainWeights; varying vec4 vTerrainWeights;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvTerrainWeights = terrainWeights;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec4 vTerrainWeights;
        uniform float uTerrainBlend;
        uniform sampler2D uDirt, uDirtN, uCobble, uCobbleN, uForest, uForestN;`)
      .replace('#include <map_fragment>', `
        vec4 terrainW = max(vTerrainWeights, vec4(0.0));
        vec4 terrainHard = step(vec4(max(max(terrainW.x, terrainW.y), max(terrainW.z, terrainW.w)) - 0.0001), terrainW);
        terrainHard /= max(dot(terrainHard, vec4(1.0)), 0.001);
        float terrainNoise = surfaceNoise(vSurfacePosition.xz * 2.1) * 0.6 + surfaceNoise(vSurfacePosition.xz * 5.3) * 0.4;
        terrainW = smoothstep(vec4(0.16), vec4(0.84), terrainW + (terrainNoise - 0.5) * 0.22);
        terrainW /= max(dot(terrainW, vec4(1.0)), 0.001);
        terrainW = mix(terrainHard, terrainW, uTerrainBlend);
        vec2 terrainUV = vec2(vSurfacePosition.x, -vSurfacePosition.z);
        vec4 terrainColor = texture2D(map, terrainUV * 0.2) * terrainW.x
          + texture2D(uDirt, terrainUV * 0.34) * terrainW.y
          + texture2D(uCobble, terrainUV * 0.34) * terrainW.z
          + texture2D(uForest, terrainUV * 0.2) * terrainW.w;
        float terrainPatch = surfaceNoise(vSurfacePosition.xz * 0.22);
        diffuseColor *= terrainColor;
        diffuseColor.rgb *= mix(vec3(0.86, 0.88, 0.78), vec3(1.08, 1.03, 0.96), terrainPatch);
      `)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor = mix(0.99, 0.82, terrainW.z) + (terrainPatch - 0.5) * 0.08;`)
      .replace('#include <normal_fragment_maps>', `
        #ifdef USE_NORMALMAP_TANGENTSPACE
          vec3 mapN = (texture2D(normalMap, terrainUV * 0.2).xyz * terrainW.x
            + texture2D(uDirtN, terrainUV * 0.34).xyz * terrainW.y
            + texture2D(uCobbleN, terrainUV * 0.34).xyz * terrainW.z
            + texture2D(uForestN, terrainUV * 0.2).xyz * terrainW.w) * 2.0 - 1.0;
          mapN.xy *= normalScale;
          normal = normalize(tbn * normalize(mapN));
        #endif`);
  });
  // Shaderkroken setter grunnruheten før wetness og normalene før pyttene glatter dem.
  return mat;
}

export function terrainGeometry(geometry, D) {
  const field = D.terrainField ||= terrainField(D);
  const p = geometry.getAttribute('position'), weights = [];
  for (let i = 0; i < p.count; i++) weights.push(...terrainWeights(field, p.getX(i), p.getZ(i), T));
  geometry.setAttribute('terrainWeights', new THREE.Float32BufferAttribute(weights, 4));
  return geometry;
}

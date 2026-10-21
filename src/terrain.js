// Blander også normalkart, så overgangen ikke skifter brått i regn og sidelys.
import * as THREE from 'three';
import { T } from './state.js';
import { addWetness } from './wet.js';
import { shaderLayer, surfacePosition } from './surfaces.js';
import { terrainField, terrainSample, surfaceWeights } from './terrainfield.js';

export function terrainMaterial(TX) {
  const mat = new THREE.MeshStandardMaterial({ ...TX.grass, roughness: 0.94, vertexColors: true });
  const blend = { value: 1 };
  mat.userData.terrainBlend = blend;
  addWetness(mat, { terrain: true });
  shaderLayer(mat, 'terrain-2', sh => {
    surfacePosition(sh);
    Object.assign(sh.uniforms, {
      uTerrainBlend: blend,
      uDirt: { value: TX.roadSoil.map }, uDirtN: { value: TX.roadSoil.normalMap },
      uCobble: { value: TX.cobble.map }, uCobbleN: { value: TX.cobble.normalMap },
      uForest: { value: TX.forest.map }, uForestN: { value: TX.forest.normalMap },
    });
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec4 terrainDistances; attribute float terrainTraffic; varying vec4 vTerrainDistances; varying float vTerrainTraffic;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvTerrainDistances = terrainDistances; vTerrainTraffic = terrainTraffic;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec4 vTerrainDistances;
        varying float vTerrainTraffic;
        uniform float uTerrainBlend;
        uniform sampler2D uDirt, uDirtN, uCobble, uCobbleN, uForest, uForestN;`)
      .replace('#include <map_fragment>', `
        vec2 terrainUV = vec2(vSurfacePosition.x, -vSurfacePosition.z);
        vec4 terrainStoneColor = texture2D(uCobble, terrainUV * 0.55);
        float terrainNoise = surfaceNoise(vSurfacePosition.xz * 2.1) * 0.6 + surfaceNoise(vSurfacePosition.xz * 5.3) * 0.4 - 0.5;
        float terrainStoneEdge = vTerrainDistances.z + terrainNoise * 0.18
          - (dot(terrainStoneColor.rgb, vec3(0.3333)) - 0.3) * 0.15;
        float terrainStone = 1.0 - smoothstep(-0.18, 0.22, terrainStoneEdge);
        float terrainEarth = 1.0 - smoothstep(-0.12, 0.72, min(vTerrainDistances.y, vTerrainDistances.z) + terrainNoise * 0.24);
        float terrainForest = 1.0 - smoothstep(-0.3, 0.8, vTerrainDistances.w + terrainNoise * 0.32);
        float terrainVegetation = (1.0 - terrainStone) * (1.0 - terrainEarth);
        vec4 terrainW = vec4(terrainVegetation * (1.0 - terrainForest), (1.0 - terrainStone) * terrainEarth, terrainStone, terrainVegetation * terrainForest);
        vec4 terrainHard = vTerrainDistances.z < 0.0 ? vec4(0,0,1,0) : vTerrainDistances.y < 0.0 ? vec4(0,1,0,0) : vTerrainDistances.w < 0.0 ? vec4(0,0,0,1) : vec4(1,0,0,0);
        terrainW = mix(terrainHard, terrainW, uTerrainBlend);
        vec4 terrainColor = texture2D(map, terrainUV * 0.3) * terrainW.x
          + texture2D(uDirt, terrainUV * 0.5) * terrainW.y
          + terrainStoneColor * terrainW.z
          + texture2D(uForest, terrainUV * 0.2) * terrainW.w;
        float terrainPatch = surfaceNoise(vSurfacePosition.xz * 0.22);
        diffuseColor *= terrainColor;
        diffuseColor.rgb *= 1.0 - vTerrainTraffic * terrainW.y * 0.09;
        diffuseColor.rgb *= mix(vec3(0.86, 0.88, 0.78), vec3(1.08, 1.03, 0.96), terrainPatch);
      `)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor = mix(0.99, 0.82, terrainW.z) + (terrainPatch - 0.5) * 0.08;`)
      .replace('#include <normal_fragment_maps>', `
        #ifdef USE_NORMALMAP_TANGENTSPACE
          vec3 mapN = (texture2D(normalMap, terrainUV * 0.3).xyz * terrainW.x
            + texture2D(uDirtN, terrainUV * 0.5).xyz * terrainW.y
            + texture2D(uCobbleN, terrainUV * 0.55).xyz * terrainW.z
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
  const p = geometry.getAttribute('position'), weights = [], distances = [], traffic = [], cache = new Map();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), key = x + ':' + z;
    let sample = cache.get(key);
    if (!sample) { sample = terrainSample(field, x, z, T); cache.set(key, sample); }
    weights.push(...surfaceWeights(sample.distances)); distances.push(...sample.distances); traffic.push(sample.traffic);
  }
  geometry.setAttribute('terrainWeights', new THREE.Float32BufferAttribute(weights, 4));
  geometry.setAttribute('terrainDistances', new THREE.Float32BufferAttribute(distances, 4));
  geometry.setAttribute('terrainTraffic', new THREE.Float32BufferAttribute(traffic, 1));
  return geometry;
}

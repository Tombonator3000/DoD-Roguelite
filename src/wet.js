import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Tillegg til MeshStandardMaterial i byen:
// - addWetness: flatene blir mørkere og blanke når det regner, og det samler
//   seg sølepytter (støy i verdensrommet) som speiler himmelen og lyktene.
//   Regndråpene lager små ringer i pyttene.
// - addSway: gress, blader og blomster beveger seg med vinden.
// Uniformene deles, så været setter dem én gang per bilde.
// ---------------------------------------------------------------------------

export const WET = {
  uWet: { value: 0 },
  uWetRain: { value: 0 },
  uWetTime: { value: 0 },
  uWetSky: { value: new THREE.Color(0.4, 0.45, 0.55) },
  uWetSkyH: { value: new THREE.Color(0.3, 0.32, 0.36) },
};

export const SWAY = {
  uSwayTime: { value: 0 },
  uWind: { value: new THREE.Vector2(0.3, 0.1) },
};

function chain(mat, key, fn) {
  const prev = mat.onBeforeCompile;
  const prevKey = mat.customProgramCacheKey ? mat.customProgramCacheKey.bind(mat) : null;
  mat.onBeforeCompile = (sh, r) => {
    if (prev) prev.call(mat, sh, r);
    fn(sh);
  };
  mat.customProgramCacheKey = () => (prevKey ? prevKey() : '') + '|' + key;
}

const WET_PARS = `
uniform float uWet, uWetRain, uWetTime;
uniform vec3 uWetSky, uWetSkyH;
varying vec3 vWetW;
float wh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float wn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(wh(i), wh(i + vec2(1.0, 0.0)), f.x), mix(wh(i + vec2(0.0, 1.0)), wh(i + vec2(1.0, 1.0)), f.x), f.y); }
float wetRing(vec2 p){
  vec2 c = floor(p / 0.55);
  vec2 f = p - (c + 0.5) * 0.55;
  float r = wh(c);
  float ph = fract(uWetTime * (0.9 + r * 0.7) + r * 9.0);
  float d = length(f - (vec2(wh(c + 2.3), wh(c + 5.1)) - 0.5) * 0.25);
  return smoothstep(0.025, 0.0, abs(d - ph * 0.24)) * (1.0 - ph) * step(r, uWetRain * 1.1);
}
`;

export function addWetness(mat, o = {}) {
  const puddles = o.puddles === false ? 0 : 1;
  const k = o.k ?? 1;
  chain(mat, `wet${puddles}${k}`, sh => {
    Object.assign(sh.uniforms, WET);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWetW;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWetW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\n' + WET_PARS)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        float wetN = wn(vWetW.xz * 0.45) * 0.6 + wn(vWetW.xz * 1.6 + 3.1) * 0.4;
        float puddle = ${puddles.toFixed(1)} * smoothstep(0.68 - uWet * 0.2, 0.74 - uWet * 0.18, wetN) * uWet;
        float damp = uWet * ${k.toFixed(2)};
        roughnessFactor = mix(roughnessFactor, 0.36, damp * 0.75);
        roughnessFactor = mix(roughnessFactor, 0.04, puddle);
        diffuseColor.rgb *= 1.0 - 0.4 * damp - 0.3 * puddle;`)
      .replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\nvec3 wetGeoN = normal;')
      .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\nnormal = normalize(mix(normal, wetGeoN, puddle * 0.9));')
      .replace('#include <opaque_fragment>', `{
          vec3 wV = normalize(cameraPosition - vWetW);
          float fr = 0.02 + 0.98 * pow(1.0 - clamp(wV.y, 0.0, 1.0), 5.0);
          vec3 sky = mix(uWetSkyH, uWetSky, 0.55);
          float ring = uWetRain > 0.05 ? wetRing(vWetW.xz) : 0.0;
          outgoingLight += sky * (0.2 + fr) * (puddle * (1.0 + ring * 2.5) + damp * 0.1);
        }
        #include <opaque_fragment>`);
  });
}

// mode: 'grass' (høyde 0 til 0,5 i modellen), 'leaf' (kule med radius 1), 'flower' (fast høyde)
export function addSway(mat, mode = 'grass') {
  const H = mode === 'grass' ? 'clamp(position.y * 2.0, 0.0, 1.0)' : mode === 'leaf' ? 'clamp((position.y + 1.0) * 0.5, 0.0, 1.0)' : '0.64';
  const K = mode === 'leaf' ? '0.09' : '0.32';
  chain(mat, 'sway-' + mode, sh => {
    Object.assign(sh.uniforms, SWAY);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uSwayTime; uniform vec2 uWind;')
      .replace('#include <project_vertex>', `vec4 mvPosition = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          mvPosition = instanceMatrix * mvPosition;
        #endif
        {
          vec3 swW = (modelMatrix * mvPosition).xyz;
          float swH = ${H};
          float swP = swW.x * 0.37 + swW.z * 0.29;
          float swG = 0.55 + 0.45 * sin(uSwayTime * 1.9 + swP) + 0.2 * sin(uSwayTime * 4.3 + swP * 2.1);
          mvPosition.xz += uWind * swG * swH * swH * ${K};
          ${mode === 'leaf' ? 'mvPosition.y += sin(uSwayTime * 2.6 + swP * 3.0) * length(uWind) * 0.02 * swH;' : ''}
        }
        mvPosition = modelViewMatrix * mvPosition;
        gl_Position = projectionMatrix * mvPosition;`);
  });
}

// Settes av været hvert bilde.
export function updateWet(weather, time, sky) {
  WET.uWet.value = weather.wet;
  WET.uWetRain.value = weather.rain;
  WET.uWetTime.value = time;
  if (sky?.sky) {
    WET.uWetSky.value.copy(sky.sky).multiplyScalar(1 - weather.cloud * 0.4);
    WET.uWetSkyH.value.copy(sky.fog);
  }
  SWAY.uSwayTime.value = time;
  SWAY.uWind.value.copy(weather.wind);
}

// Innebygde bilder. Dekodes én gang før materialer og tittelscene lages.
import * as THREE from 'three';

const images = new Map();
const textures = new Map();

export async function loadTextureImages(source = window.TEX || {}) {
  await Promise.all(Object.entries(source).map(async ([name, uri]) => {
    if (!/^data:image\/(jpeg|png);base64,/.test(uri)) return;
    const img = new Image();
    img.src = uri;
    try {
      await img.decode();
      images.set(name, img);
    } catch {
      console.warn('Kunne ikke dekode tekstur, bruker reserve:', name);
    }
  }));
  const paper = source.pergament_c;
  if (images.has('pergament_c')) {
    document.documentElement.style.setProperty('--pergament', `url("${paper}")`);
    document.body.classList.add('malt-pergament');
  }
}

export function textureImage(name) {
  return images.get(name);
}

export function imageTexture(name, repeat = true) {
  const key = name + (repeat ? ':repeat' : ':clamp');
  if (textures.has(key)) return textures.get(key);
  const img = images.get(name);
  if (!img) return null;
  const t = new THREE.Texture(img);
  t.wrapS = t.wrapT = repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  t.anisotropy = 4;
  if (!name.endsWith('_n') && !name.endsWith('_r')) t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  textures.set(key, t);
  return t;
}

// Hele paret må finnes, ellers brukes den gamle fabrikken uten blandede kart.
export function paintedTexture(name) {
  if (!images.has(name + '_c') || !images.has(name + '_n')) return null;
  return { map: imageTexture(name + '_c'), normalMap: imageTexture(name + '_n') };
}

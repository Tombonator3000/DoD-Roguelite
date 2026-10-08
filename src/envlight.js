// Miljøkart for byen og områdene: en himmelkule med farger fra skyAt, gjort om til PMREM.
// Det gir glans på våt stein, metall og vann, og litt mykt lys fra himmelen. Styrken holdes lav
// (scene.environmentIntensity), så sola og halvkulelyset fortsatt bærer bildet. Etter
// docs/grafikk-weatherglass.md, der miljøkartet står på 0,17 om dagen og 0,05 om natta.
// Kloakken får ikke noe miljøkart: der skal det være mørkt utenfor lykta.
import * as THREE from 'three';

const VERT = `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const FRAG = `
uniform vec3 uTop, uHorizon, uGround, uSun, uSunDir;
varying vec3 vDir;
void main() {
  vec3 d = normalize(vDir);
  float y = d.y;
  vec3 col = y > 0.0 ? mix(uHorizon, uTop, pow(clamp(y, 0.0, 1.0), 0.6)) : mix(uHorizon, uGround, smoothstep(0.0, 0.35, -y));
  // sola som en myk flekk, så blanke flater får et høylys fra samme kant som skyggene
  float s = max(dot(d, normalize(uSunDir)), 0.0);
  col += uSun * (pow(s, 64.0) * 6.0 + pow(s, 8.0) * 0.35);
  gl_FragColor = vec4(col, 1.0);
}`;

export class EnvLight {
  constructor(renderer) {
    this.pmrem = new THREE.PMREMGenerator(renderer);
    this.scene = new THREE.Scene();
    this.u = {
      uTop: { value: new THREE.Color() }, uHorizon: { value: new THREE.Color() }, uGround: { value: new THREE.Color() },
      uSun: { value: new THREE.Color() }, uSunDir: { value: new THREE.Vector3(0, 1, 0) },
    };
    const mat = new THREE.ShaderMaterial({ uniforms: this.u, vertexShader: VERT, fragmentShader: FRAG, side: THREE.BackSide, depthWrite: false });
    this.scene.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), mat));
    this.rt = null;
    this.key = '';
    this.t = 0;
  }

  // Bygges bare når himmelen har endret seg merkbart (og høyst hvert sjette sekund), fordi
  // PMREM tegner seks sider og glatter dem ut. Det tar noen millisekunder.
  update(dt, sky, cloud = 0) {
    this.t -= dt;
    const q = v => Math.round(v * 12);
    const key = [sky.sky.r, sky.sky.g, sky.sky.b, sky.fog.r, sky.fog.g, sky.ground.r, sky.sun.r * sky.sunI, cloud, sky.dir.x / 8, sky.dir.y / 8].map(q).join(',');
    if (key === this.key || (this.t > 0 && this.rt)) return this.rt?.texture || null;
    this.key = key;
    this.t = 6;
    const u = this.u;
    u.uTop.value.copy(sky.sky).multiplyScalar(0.9);
    u.uHorizon.value.copy(sky.fog).lerp(sky.sky, 0.35);
    u.uGround.value.copy(sky.ground).multiplyScalar(0.8);
    u.uSun.value.copy(sky.sun).multiplyScalar(sky.sunI * (1 - cloud * 0.8) * 0.5);
    u.uSunDir.value.copy(sky.dir).normalize();
    const old = this.rt;
    this.rt = this.pmrem.fromScene(this.scene, 0.03, 0.1, 50);
    old?.dispose();
    return this.rt.texture;
  }
}

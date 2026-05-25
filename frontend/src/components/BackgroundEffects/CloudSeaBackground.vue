<template>
  <div ref="container" class="cloudsea-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import * as THREE from 'three';

const container = ref<HTMLElement | null>(null);
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let cloudMeshes: THREE.Mesh[] = [];
let particles: THREE.Points | null = null;
let animationId: number;

/**
 * 生成单朵云的纹理 — 圆形径向渐变，边缘完全透明
 */
function createCloudTexture(texSize: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = texSize;
  canvas.height = texSize;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, texSize, texSize);

  const cx = texSize / 2;
  const cy = texSize / 2;
  const maxR = texSize * 0.48;

  // 主云体
  const mainGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
  mainGrd.addColorStop(0, 'rgba(255, 255, 255, 1)');
  mainGrd.addColorStop(0.12, 'rgba(255, 255, 255, 0.95)');
  mainGrd.addColorStop(0.3, 'rgba(255, 255, 255, 0.75)');
  mainGrd.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
  mainGrd.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
  mainGrd.addColorStop(0.85, 'rgba(255, 255, 255, 0.06)');
  mainGrd.addColorStop(0.95, 'rgba(255, 255, 255, 0.01)');
  mainGrd.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = mainGrd;
  ctx.beginPath();
  ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
  ctx.fill();

  // 内部蓬松 blob
  const blobCount = 5 + Math.floor(Math.random() * 5);
  for (let i = 0; i < blobCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = maxR * (0.05 + Math.random() * 0.4);
    const bx = cx + Math.cos(angle) * dist;
    const by = cy + Math.sin(angle) * dist;
    const br = maxR * (0.12 + Math.random() * 0.28);

    const bGrd = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    bGrd.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    bGrd.addColorStop(0.35, 'rgba(255, 255, 255, 0.55)');
    bGrd.addColorStop(0.65, 'rgba(255, 255, 255, 0.2)');
    bGrd.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = bGrd;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }

  // 外围薄云丝
  const strandCount = 3 + Math.floor(Math.random() * 4);
  for (let i = 0; i < strandCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = maxR * (0.45 + Math.random() * 0.4);
    const sx = cx + Math.cos(angle) * dist;
    const sy = cy + Math.sin(angle) * dist;
    const sr = maxR * (0.08 + Math.random() * 0.18);

    const sGrd = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
    sGrd.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    sGrd.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
    sGrd.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = sGrd;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * 生成云海铺底纹理 — 使用可无缝平铺的噪声方式
 * 关键：blob 只生成在中心区域，边缘保持透明，避免 RepeatWrapping 接缝
 */
function createSeaTexture(width: number, height: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, width, height);

  // 安全区域：只在纹理中心 80% 区域内生成 blob
  // 边缘 10% 保持透明，这样 RepeatWrapping 时接缝处是渐变的，不会有硬边
  const marginX = width * 0.1;
  const marginY = height * 0.1;
  const safeW = width - marginX * 2;
  const safeH = height - marginY * 2;

  // 大量随机分布的圆形 blob
  const blobCount = 100 + Math.floor(Math.random() * 60);
  for (let i = 0; i < blobCount; i++) {
    const bx = marginX + Math.random() * safeW;
    const by = marginY + Math.random() * safeH;
    const br = width * (0.03 + Math.random() * 0.07);

    const opacity = 0.2 + Math.random() * 0.3;
    const g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    g.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
    g.addColorStop(0.35, `rgba(255, 255, 255, ${opacity * 0.7})`);
    g.addColorStop(0.65, `rgba(255, 255, 255, ${opacity * 0.3})`);
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }

  // 更大的云团区域
  const clusterCount = 15 + Math.floor(Math.random() * 10);
  for (let i = 0; i < clusterCount; i++) {
    const cx = marginX + Math.random() * safeW;
    const cy = marginY + Math.random() * safeH;
    const cr = width * (0.05 + Math.random() * 0.09);

    const opacity = 0.25 + Math.random() * 0.3;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
    g.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
    g.addColorStop(0.25, `rgba(255, 255, 255, ${opacity * 0.8})`);
    g.addColorStop(0.55, `rgba(255, 255, 255, ${opacity * 0.4})`);
    g.addColorStop(0.8, `rgba(255, 255, 255, ${opacity * 0.1})`);
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

function createGradientBackground(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, '#3D6B99');     // 穹顶深天蓝
  gradient.addColorStop(0.2, '#5B8CC9');   // 天蓝
  gradient.addColorStop(0.45, '#7FB3D8');  // 明亮天蓝
  gradient.addColorStop(0.65, '#B8D8EE');  // 浅蓝白
  gradient.addColorStop(0.85, '#E8D5B7');  // 暖金白（靠近地平线）
  gradient.addColorStop(1, '#F5E6D0');     // 地平线暖金色

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 2, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function init() {
  scene = new THREE.Scene();

  const bgTexture = createGradientBackground();
  scene.background = bgTexture;

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1, 10);
  camera.lookAt(0, 1, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.value?.appendChild(renderer.domElement);

  // 预生成云朵纹理
  const cloudTextures: THREE.CanvasTexture[] = [];
  for (let i = 0; i < 16; i++) {
    const size = 256 + Math.floor(Math.random() * 384);
    cloudTextures.push(createCloudTexture(size));
  }

  // 预生成云海铺底纹理
  const seaTextures: THREE.CanvasTexture[] = [];
  for (let i = 0; i < 4; i++) {
    seaTextures.push(createSeaTexture(2048, 1024));
  }

  // ===== 云海铺底：使用不重复的大纹理，直接覆盖整个视口 =====
  // 不用 RepeatWrapping，而是用足够大的单张纹理，避免接缝
  const seaLayerConfigs = [
    { z: -18, opacity: 0.45, scaleX: 1.8, scaleY: 1.2 },
    { z: -15, opacity: 0.4, scaleX: 1.5, scaleY: 1.0 },
    { z: -12, opacity: 0.35, scaleX: 1.3, scaleY: 0.9 },
  ];

  seaLayerConfigs.forEach((sl, idx) => {
    const tex = seaTextures[Math.floor(Math.random() * seaTextures.length)];
    // 不使用 repeat，直接用大尺寸平面
    const baseW = 28;
    const baseH = 14;
    const w = baseW * sl.scaleX;
    const h = baseH * sl.scaleY;
    const geo = new THREE.PlaneGeometry(w, h);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: sl.opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, 1.5, sl.z);
    mesh.renderOrder = idx; // 固定渲染顺序，避免 z-fighting
    mesh.userData = { isSea: true, speedX: 0.0003 + Math.random() * 0.0005 };
    scene.add(mesh);
    cloudMeshes.push(mesh);
  });

  // ===== 远景云 — 小而多 =====
  for (let i = 0; i < 40; i++) {
    const tex = cloudTextures[Math.floor(Math.random() * cloudTextures.length)];
    const size = 0.6 + Math.random() * 1.2;
    const geo = new THREE.PlaneGeometry(size, size);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.45 + Math.random() * 0.3,
      side: THREE.DoubleSide,
      depthWrite: false,
      alphaTest: 0.01,
    });
    const cloud = new THREE.Mesh(geo, mat);
    cloud.position.set(
      (Math.random() - 0.5) * 34,
      0.5 + Math.random() * 3,
      -10 - Math.random() * 4
    );
    cloud.rotation.z = Math.random() * Math.PI * 2;
    cloud.renderOrder = 10;
    cloud.userData = {
      speedX: 0.001 + Math.random() * 0.003,
      phase: Math.random() * Math.PI * 2,
      isSea: false,
    };
    scene.add(cloud);
    cloudMeshes.push(cloud);
  }

  // ===== 中景云 =====
  for (let i = 0; i < 35; i++) {
    const tex = cloudTextures[Math.floor(Math.random() * cloudTextures.length)];
    const size = 1.0 + Math.random() * 2.0;
    const geo = new THREE.PlaneGeometry(size, size);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.55 + Math.random() * 0.3,
      side: THREE.DoubleSide,
      depthWrite: false,
      alphaTest: 0.01,
    });
    const cloud = new THREE.Mesh(geo, mat);
    cloud.position.set(
      (Math.random() - 0.5) * 32,
      0.3 + Math.random() * 3.5,
      -7 - Math.random() * 4
    );
    cloud.rotation.z = Math.random() * Math.PI * 2;
    cloud.renderOrder = 20;
    cloud.userData = {
      speedX: 0.002 + Math.random() * 0.004,
      phase: Math.random() * Math.PI * 2,
      isSea: false,
    };
    scene.add(cloud);
    cloudMeshes.push(cloud);
  }

  // ===== 近景云 =====
  for (let i = 0; i < 20; i++) {
    const tex = cloudTextures[Math.floor(Math.random() * cloudTextures.length)];
    const size = 1.5 + Math.random() * 2.5;
    const geo = new THREE.PlaneGeometry(size, size);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.65 + Math.random() * 0.3,
      side: THREE.DoubleSide,
      depthWrite: false,
      alphaTest: 0.01,
    });
    const cloud = new THREE.Mesh(geo, mat);
    cloud.position.set(
      (Math.random() - 0.5) * 30,
      0.2 + Math.random() * 3,
      -3 - Math.random() * 3
    );
    cloud.rotation.z = Math.random() * Math.PI * 2;
    cloud.renderOrder = 30;
    cloud.userData = {
      speedX: 0.003 + Math.random() * 0.005,
      phase: Math.random() * Math.PI * 2,
      isSea: false,
    };
    scene.add(cloud);
    cloudMeshes.push(cloud);
  }

  // ===== 薄云丝 =====
  for (let i = 0; i < 15; i++) {
    const tex = cloudTextures[Math.floor(Math.random() * cloudTextures.length)];
    const size = 1.2 + Math.random() * 1.5;
    const geo = new THREE.PlaneGeometry(size, size * 0.5);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.3 + Math.random() * 0.25,
      side: THREE.DoubleSide,
      depthWrite: false,
      alphaTest: 0.01,
    });
    const cloud = new THREE.Mesh(geo, mat);
    cloud.position.set(
      (Math.random() - 0.5) * 34,
      0.5 + Math.random() * 3.5,
      -9 - Math.random() * 5
    );
    cloud.rotation.z = Math.random() * Math.PI;
    cloud.renderOrder = 15;
    cloud.userData = {
      speedX: 0.004 + Math.random() * 0.006,
      phase: Math.random() * Math.PI * 2,
      isSea: false,
    };
    scene.add(cloud);
    cloudMeshes.push(cloud);
  }

  // 粒子
  const particleCount = 60;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = Math.random() * 6 - 0.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 15 - 8;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.06,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending,
  });
  particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  window.addEventListener('resize', onResize);
}

function animate() {
  animationId = requestAnimationFrame(animate);
  const time = Date.now() * 0.001;

  cloudMeshes.forEach((cloud) => {
    const ud = cloud.userData;

    if (ud.isSea) {
      cloud.position.x += ud.speedX;
      // 铺底循环范围更大，因为纹理不重复了
      if (cloud.position.x > 10) cloud.position.x = -10;
    } else {
      cloud.position.x += ud.speedX;
      cloud.position.y += Math.sin(time * 0.4 + ud.phase) * 0.0004;
      if (cloud.position.x > 18) cloud.position.x = -18;
      if (cloud.position.x < -18) cloud.position.x = 18;
    }
  });

  if (particles) {
    particles.position.x += 0.001;
    particles.position.y += Math.sin(time * 0.8) * 0.0005;
    if (particles.position.x > 15) particles.position.x = -15;
    if (particles.position.x < -15) particles.position.x = 15;
  }

  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function dispose() {
  cancelAnimationFrame(animationId);
  window.removeEventListener('resize', onResize);
  renderer.dispose();
  cloudMeshes.forEach((cloud) => {
    cloud.geometry.dispose();
    const mat = cloud.material as THREE.MeshBasicMaterial;
    if (mat.map) mat.map.dispose();
    mat.dispose();
  });
  if (particles) {
    particles.geometry.dispose();
    (particles.material as THREE.Material).dispose();
  }
  scene.clear();
}

onMounted(() => {
  init();
  animate();
});

onBeforeUnmount(() => {
  dispose();
});
</script>

<style scoped>
.cloudsea-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
</style>

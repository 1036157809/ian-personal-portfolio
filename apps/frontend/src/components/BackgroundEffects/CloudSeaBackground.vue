<template>
  <div ref="container" class="cloudsea-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import * as THREE from 'three';
import {
  rendererConfig,
  layerConfig,
  createCloudTexture,
  createSeaTexture,
  createGradientBackground,
} from './CloudSeaBackground.utils';

const container = ref<HTMLElement | null>(null);
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let cloudMeshes: THREE.Mesh[] = [];
let particles: THREE.Points | null = null;
let animationId: number;

function init() {
  scene = new THREE.Scene();
  scene.background = createGradientBackground();

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1, 10);
  camera.lookAt(0, 1, 0);

  renderer = new THREE.WebGLRenderer({ antialias: rendererConfig.antialias });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(rendererConfig.pixelRatio);
  container.value?.appendChild(renderer.domElement);

  // 预生成纹理
  const cloudTextures: THREE.CanvasTexture[] = [];
  for (let i = 0; i < 16; i++) {
    cloudTextures.push(createCloudTexture(256 + Math.floor(Math.random() * 384)));
  }
  const seaTextures: THREE.CanvasTexture[] = [];
  for (let i = 0; i < 4; i++) {
    seaTextures.push(createSeaTexture(2048, 1024));
  }

  // ===== 云海铺底 =====
  const seaLayerConfigs = [
    { z: -18, opacity: 0.45, scaleX: 1.8, scaleY: 1.2 },
    { z: -15, opacity: 0.4, scaleX: 1.5, scaleY: 1.0 },
    { z: -12, opacity: 0.35, scaleX: 1.3, scaleY: 0.9 },
  ].slice(0, layerConfig.seaLayerCount);

  seaLayerConfigs.forEach((sl, idx) => {
    const tex = seaTextures[Math.floor(Math.random() * seaTextures.length)];
    const baseW = 28;
    const baseH = 14;
    const geo = new THREE.PlaneGeometry(baseW * sl.scaleX, baseH * sl.scaleY);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: sl.opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, 1.5, sl.z);
    mesh.renderOrder = idx;
    mesh.userData = { isSea: true, speedX: 0.0003 + Math.random() * 0.0005 };
    scene.add(mesh);
    cloudMeshes.push(mesh);
  });

  // ===== 远景云 =====
  for (let i = 0; i < layerConfig.farCount; i++) {
    const tex = cloudTextures[Math.floor(Math.random() * cloudTextures.length)];
    const size = 1.0 + Math.random() * 2.0;
    const geo = new THREE.PlaneGeometry(size, size);
    const mat = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, opacity: 0.45 + Math.random() * 0.3,
      side: THREE.DoubleSide, depthWrite: false, alphaTest: 0.01,
    });
    const cloud = new THREE.Mesh(geo, mat);
    cloud.position.set((Math.random() - 0.5) * 40, 0.5 + Math.random() * 3, -10 - Math.random() * 4);
    cloud.rotation.z = Math.random() * Math.PI * 2;
    cloud.renderOrder = 10;
    cloud.userData = { speedX: 0.001 + Math.random() * 0.003, phase: Math.random() * Math.PI * 2, isSea: false };
    scene.add(cloud);
    cloudMeshes.push(cloud);
  }

  // ===== 中景云 =====
  for (let i = 0; i < layerConfig.midCount; i++) {
    const tex = cloudTextures[Math.floor(Math.random() * cloudTextures.length)];
    const size = 1.8 + Math.random() * 3.0;
    const geo = new THREE.PlaneGeometry(size, size);
    const mat = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, opacity: 0.55 + Math.random() * 0.3,
      side: THREE.DoubleSide, depthWrite: false, alphaTest: 0.01,
    });
    const cloud = new THREE.Mesh(geo, mat);
    cloud.position.set((Math.random() - 0.5) * 38, 0.3 + Math.random() * 3.5, -7 - Math.random() * 4);
    cloud.rotation.z = Math.random() * Math.PI * 2;
    cloud.renderOrder = 20;
    cloud.userData = { speedX: 0.002 + Math.random() * 0.004, phase: Math.random() * Math.PI * 2, isSea: false };
    scene.add(cloud);
    cloudMeshes.push(cloud);
  }

  // ===== 近景云 =====
  for (let i = 0; i < layerConfig.nearCount; i++) {
    const tex = cloudTextures[Math.floor(Math.random() * cloudTextures.length)];
    const size = 2.5 + Math.random() * 3.5;
    const geo = new THREE.PlaneGeometry(size, size);
    const mat = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, opacity: 0.65 + Math.random() * 0.3,
      side: THREE.DoubleSide, depthWrite: false, alphaTest: 0.01,
    });
    const cloud = new THREE.Mesh(geo, mat);
    cloud.position.set((Math.random() - 0.5) * 36, 0.2 + Math.random() * 3, -3 - Math.random() * 3);
    cloud.rotation.z = Math.random() * Math.PI * 2;
    cloud.renderOrder = 30;
    cloud.userData = { speedX: 0.003 + Math.random() * 0.005, phase: Math.random() * Math.PI * 2, isSea: false };
    scene.add(cloud);
    cloudMeshes.push(cloud);
  }

  // ===== 薄云丝 =====
  for (let i = 0; i < layerConfig.strandCount; i++) {
    const tex = cloudTextures[Math.floor(Math.random() * cloudTextures.length)];
    const size = 1.8 + Math.random() * 2.0;
    const geo = new THREE.PlaneGeometry(size, size * 0.5);
    const mat = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, opacity: 0.3 + Math.random() * 0.25,
      side: THREE.DoubleSide, depthWrite: false, alphaTest: 0.01,
    });
    const cloud = new THREE.Mesh(geo, mat);
    cloud.position.set((Math.random() - 0.5) * 40, 0.5 + Math.random() * 3.5, -9 - Math.random() * 5);
    cloud.rotation.z = Math.random() * Math.PI;
    cloud.renderOrder = 15;
    cloud.userData = { speedX: 0.004 + Math.random() * 0.006, phase: Math.random() * Math.PI * 2, isSea: false };
    scene.add(cloud);
    cloudMeshes.push(cloud);
  }

  // ===== 粒子 =====
  if (layerConfig.particleCount > 0) {
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(layerConfig.particleCount * 3);
    for (let i = 0; i < layerConfig.particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = Math.random() * 6 - 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15 - 8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff, size: 0.06, transparent: true, opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
  }

  window.addEventListener('resize', onResize);
}

function animate() {
  animationId = requestAnimationFrame(animate);
  const time = Date.now() * 0.001;

  cloudMeshes.forEach((cloud) => {
    const ud = cloud.userData;
    if (ud.isSea) {
      cloud.position.x += ud.speedX;
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

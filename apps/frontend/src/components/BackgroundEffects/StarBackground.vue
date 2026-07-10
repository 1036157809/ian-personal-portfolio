<template>
  <div ref="container" class="star-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import * as THREE from 'three';

const container = ref<HTMLElement | null>(null);
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let points: THREE.Points;
let geometry: THREE.BufferGeometry;
let material: THREE.PointsMaterial;
let animationId: number;
let particleCount = window.innerWidth < 768 ? 800 : 1500;
let baseBrightness: number[] = [];
let colorAttribute: THREE.BufferAttribute;

let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

// 生成球形分布粒子位置（均匀分布在球体内）
const generateSpherePositions = (count: number, radius: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * Math.cbrt(Math.random());
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    positions[i*3] = x;
    positions[i*3+1] = y;
    positions[i*3+2] = z;
  }
  return positions;
}

// 生成每个粒子的基准亮度系数（用于闪烁频率）
const generateBrightnessFactors = (count: number): number[] => {
  const factors = [];
  for (let i = 0; i < count; i++) {
    factors.push(0.3 + Math.random() * 0.7);
  }
  return factors;
}

// 根据当前时间和系数计算亮度值（0.1~1.0）
const computeCurrentBrightness = (time: number, factors: number[]): number[] => {
  const brightness = [];
  for (let i = 0; i < factors.length; i++) {
    const value = 0.3 + 0.7 * Math.sin(time * 0.6 * factors[i]);
    brightness.push(Math.max(0.1, Math.min(1.0, value)));
  }
  return brightness;
}

// 更新粒子颜色（闪烁）- 偏蓝白的星辉色
const updateColors = (brightness: number[]) => {
  const colors = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const b = brightness[i];
    // 偏蓝白的星辉色：B最高，G次之，R稍低
    const r = 0.75 + b * 0.25;  // 0.75-1.0
    const g = 0.82 + b * 0.18;  // 0.82-1.0
    const bl = 0.92 + b * 0.08; // 0.92-1.0 (偏蓝)

    colors[i*3] = r;
    colors[i*3+1] = g;
    colors[i*3+2] = bl;
  }
  colorAttribute.array.set(colors);
  colorAttribute.needsUpdate = true;
}

const init = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070B14);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 18);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.value?.appendChild(renderer.domElement);

  const positions = generateSpherePositions(particleCount, 10);
  geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const initialColors = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    // 初始偏蓝白的星辉色
    initialColors[i*3] = 0.88;   // R
    initialColors[i*3+1] = 0.92; // G
    initialColors[i*3+2] = 1.0;  // B
  }
  colorAttribute = new THREE.BufferAttribute(initialColors, 3);
  geometry.setAttribute('color', colorAttribute);

  // 创建圆形纹理 — 偏蓝白的星辉色
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(230, 235, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(200, 215, 250, 0.85)');
  gradient.addColorStop(0.6, 'rgba(170, 195, 240, 0.45)');
  gradient.addColorStop(1, 'rgba(140, 180, 230, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  const particleTexture = new THREE.CanvasTexture(canvas);

  material = new THREE.PointsMaterial({
    size: 0.25,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    map: particleTexture
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);

  baseBrightness = generateBrightnessFactors(particleCount);

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('resize', onResize);
}

let time = 0;
const animate = () => {
  animationId = requestAnimationFrame(animate);
  time += 0.016;

  const currentBrightness = computeCurrentBrightness(time, baseBrightness);
  updateColors(currentBrightness);

  points.rotation.y += 0.0008;
  points.rotation.x += 0.0004;

  targetX = (mouseX / window.innerWidth) * 0.4 - 0.2;
  targetY = (mouseY / window.innerHeight) * 0.4 - 0.2;
  points.position.x += (targetX - points.position.x) * 0.05;
  points.position.y += (targetY - points.position.y) * 0.05;

  renderer.render(scene, camera);
}

const onMouseMove = (event: MouseEvent) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
}

const onResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

const dispose = () => {
  cancelAnimationFrame(animationId);
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('resize', onResize);
  renderer.dispose();
  geometry.dispose();
  material.dispose();
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
.star-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
</style>
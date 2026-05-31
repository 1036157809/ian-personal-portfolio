import * as THREE from 'three';

// ============================================================
// 设备 & 浏览器检测
// ============================================================
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

/** Safari 浏览器检测（包括 iOS Safari 和 macOS Safari） */
export const isSafari = (() => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  // Safari 的 UA 包含 Safari 但不包含 Chrome/Edge/OPR/Firefox
  return /Safari/i.test(ua) && !/Chrome|Chromium|Edg|OPR|Firefox|FxiOS/i.test(ua);
})();

// ============================================================
// Renderer 配置
// ============================================================
export const rendererConfig = {
  antialias: !isMobile,
  pixelRatio: Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2),
};

// ============================================================
// 云层数量配置
// ============================================================
export const layerConfig = {
  seaLayerCount: 3,
  farCount: isMobile ? 25 : 50,
  midCount: isMobile ? 20 : 45,
  nearCount: isMobile ? 12 : 25,
  strandCount: isMobile ? 8 : 18,
  // 移动端完全禁用粒子，避免 AdditiveBlending 在低精度 GPU 上闪烁
  particleCount: isMobile ? 0 : 60,
};

// ============================================================
// 纹理颜色配置
// 移动端 & Safari 使用带蓝调白色，避免 GPU 多层叠加后颜色溢出
// 其他桌面端浏览器保持纯白高亮
// ============================================================
const isSafariOrMobile = isMobile || isSafari;

const cloudMainColors = isSafariOrMobile
  ? [
      'rgba(245, 248, 252, 0.85)',
      'rgba(240, 245, 250, 0.78)',
      'rgba(235, 242, 248, 0.62)',
      'rgba(230, 238, 245, 0.38)',
      'rgba(225, 235, 242, 0.18)',
      'rgba(220, 232, 240, 0.06)',
      'rgba(218, 230, 238, 0.01)',
      'rgba(215, 228, 236, 0)',
    ]
  : [
      'rgba(255, 255, 255, 1)',
      'rgba(255, 255, 255, 0.95)',
      'rgba(255, 255, 255, 0.75)',
      'rgba(255, 255, 255, 0.45)',
      'rgba(255, 255, 255, 0.2)',
      'rgba(255, 255, 255, 0.06)',
      'rgba(255, 255, 255, 0.01)',
      'rgba(255, 255, 255, 0)',
    ];

const cloudBlobColors = isSafariOrMobile
  ? [
      'rgba(242, 246, 250, 0.72)',
      'rgba(235, 242, 248, 0.48)',
      'rgba(228, 238, 245, 0.18)',
      'rgba(225, 235, 242, 0)',
    ]
  : [
      'rgba(255, 255, 255, 0.85)',
      'rgba(255, 255, 255, 0.55)',
      'rgba(255, 255, 255, 0.2)',
      'rgba(255, 255, 255, 0)',
    ];

const cloudStrandColors = isSafariOrMobile
  ? [
      'rgba(240, 245, 250, 0.42)',
      'rgba(232, 240, 246, 0.16)',
      'rgba(228, 238, 244, 0)',
    ]
  : [
      'rgba(255, 255, 255, 0.5)',
      'rgba(255, 255, 255, 0.2)',
      'rgba(255, 255, 255, 0)',
    ];

// 铺底 blob/cluster 的 alpha 范围
const seaBlobOpacity = isSafariOrMobile
  ? { min: 0.15, max: 0.25 }
  : { min: 0.2, max: 0.3 };

const seaClusterOpacity = isSafariOrMobile
  ? { min: 0.18, max: 0.25 }
  : { min: 0.25, max: 0.3 };

const seaBlobColor = isSafariOrMobile
  ? { r: 245, g: 248, b: 252 }
  : { r: 255, g: 255, b: 255 };

// ============================================================
// 纹理生成函数
// ============================================================

/**
 * 生成单朵云的纹理 — 圆形径向渐变，边缘完全透明
 */
export function createCloudTexture(texSize: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = texSize;
  canvas.height = texSize;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, texSize, texSize);

  const cx = texSize / 2;
  const cy = texSize / 2;
  const maxR = texSize * 0.48;

  // 主云体 — 非均匀 stop 位置，中心密实边缘飘逸
  const mainGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
  const mainStops = [0, 0.12, 0.3, 0.5, 0.7, 0.85, 0.95, 1];
  cloudMainColors.forEach((color, i) => {
    mainGrd.addColorStop(mainStops[i], color);
  });
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
    const blobStops = [0, 0.35, 0.65, 1];
    cloudBlobColors.forEach((color, j) => {
      bGrd.addColorStop(blobStops[j], color);
    });
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
    const strandStops = [0, 0.5, 1];
    cloudStrandColors.forEach((color, j) => {
      sGrd.addColorStop(strandStops[j], color);
    });
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
 * 生成云海铺底纹理
 */
export function createSeaTexture(width: number, height: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, width, height);

  const marginX = width * 0.1;
  const marginY = height * 0.1;
  const safeW = width - marginX * 2;
  const safeH = height - marginY * 2;
  const { r, g, b } = seaBlobColor;

  // 大量随机分布的圆形 blob
  const blobCount = 100 + Math.floor(Math.random() * 60);
  for (let i = 0; i < blobCount; i++) {
    const bx = marginX + Math.random() * safeW;
    const by = marginY + Math.random() * safeH;
    const br = width * (0.03 + Math.random() * 0.07);
    const opacity = seaBlobOpacity.min + Math.random() * (seaBlobOpacity.max - seaBlobOpacity.min);

    const grad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity})`);
    grad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${opacity * 0.7})`);
    grad.addColorStop(0.65, `rgba(${r}, ${g}, ${b}, ${opacity * 0.3})`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    ctx.fillStyle = grad;
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
    const opacity = seaClusterOpacity.min + Math.random() * (seaClusterOpacity.max - seaClusterOpacity.min);

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity})`);
    grad.addColorStop(0.25, `rgba(${r}, ${g}, ${b}, ${opacity * 0.8})`);
    grad.addColorStop(0.55, `rgba(${r}, ${g}, ${b}, ${opacity * 0.4})`);
    grad.addColorStop(0.8, `rgba(${r}, ${g}, ${b}, ${opacity * 0.1})`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    ctx.fillStyle = grad;
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

/**
 * 生成天空渐变背景纹理
 */
export function createGradientBackground(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, '#3D6B99');
  gradient.addColorStop(0.2, '#5B8CC9');
  gradient.addColorStop(0.45, '#7FB3D8');
  gradient.addColorStop(0.65, '#B8D8EE');
  gradient.addColorStop(0.85, '#E8D5B7');
  gradient.addColorStop(1, '#F5E6D0');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 2, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

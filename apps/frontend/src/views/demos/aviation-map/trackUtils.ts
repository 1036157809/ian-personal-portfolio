import { fromLonLat, toLonLat } from "ol/proj";
import { degToRad } from "src/utils/geo";

/**
 * 根据飞机当前状态生成模拟历史轨迹（从远到近，末端衔接飞机当前位置）
 * 用于 cache 模式下调速本地数据模拟飞行轨迹
 *
 * @param curX 当前投影坐标 X
 * @param curY 当前投影坐标 Y
 * @param heading 朝向（角度制，0=北）
 * @param velocity 速度（m/s）
 * @param numPoints 轨迹点数
 * @returns 投影坐标数组，从最早位置到 [curX, curY]
 */
export const generateSyntheticTrack = (
  curX: number,
  curY: number,
  heading: number,
  velocity: number,
  numPoints = 60,
): number[][] => {
  if (!velocity || !heading) return [[curX, curY]];

  // 反推当前位置对应的地理坐标，用于计算该纬度下米→度的转换系数
  const [curLon, curLat] = toLonLat([curX, curY]);
  const headingRad = degToRad(heading);
  const SECONDS_PER_STEP = 30;
  const METERS_PER_STEP = velocity * SECONDS_PER_STEP;

  // 该纬度下每度对应的米数
  const metersPerDegLon = 111_320 * Math.cos((curLat * Math.PI) / 180) || 1;
  const metersPerDegLat = 111_320;

  const stepLonDeg = (METERS_PER_STEP * Math.sin(headingRad)) / metersPerDegLon;
  const stepLatDeg = (METERS_PER_STEP * Math.cos(headingRad)) / metersPerDegLat;

  // 从最早位置（最远）到最近位置
  const points: number[][] = [];
  for (let i = numPoints - 1; i >= 0; i--) {
    const lon = curLon - stepLonDeg * i;
    const lat = curLat - stepLatDeg * i;
    points.push(fromLonLat([lon, lat]));
  }
  // 末端衔接飞机当前位置（确保轨迹终点=飞机图标位置）
  points.push([curX, curY]);

  return points;
};

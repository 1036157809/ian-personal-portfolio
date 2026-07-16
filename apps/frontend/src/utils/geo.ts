/**
 * 地理/航向计算工具函数
 */

/**
 * 角度制 → 弧度制
 * @param degrees 角度值（0-360）
 * @returns 弧度值
 */
export const degToRad = (degrees: number): number => degrees * Math.PI / 180;

/**
 * 弧度制 → 角度制
 * @param radians 弧度值
 * @returns 角度值（0-360）
 */
export const radToDeg = (radians: number): number => radians * 180 / Math.PI;

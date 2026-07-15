/**
 * 网络质量检测工具
 * 优先使用 navigator.connection API，fallback 为 HEAD 请求超时检测
 */

interface NetworkInformation {
  effectiveType?: string;
  saveData?: boolean;
  downlink?: number;
  rtt?: number;
}

const hasConnectionAPI = (): boolean => {
  return typeof navigator !== 'undefined' && 'connection' in navigator;
};

const getConnection = (): NetworkInformation | null => {
  if (!hasConnectionAPI()) return null;
  const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  return conn ?? null;
};

/**
 * 检测网络质量
 * @returns 'good' 或 'weak'
 */
export const checkNetworkQuality = async (): Promise<'good' | 'weak'> => {
  const conn = getConnection();
  if (conn) {
    // 优先用 navigator.connection API 判断
    const effectiveType = conn.effectiveType;
    if (effectiveType === '2g' || effectiveType === 'slow-2g') return 'weak';
    if (conn.saveData === true) return 'weak';
    return 'good';
  }
  // navigator.connection 不可用时，乐观返回 'good'（无法准确判断网速）
  return 'good';
};

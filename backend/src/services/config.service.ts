import SystemConfig from '../models/system-config.model';

let cache: Record<string, string> | null = null;

/**
 * 加载所有配置到内存缓存
 */
export async function loadConfig(): Promise<Record<string, string>> {
  const rows = await SystemConfig.findAll();
  const config: Record<string, string> = {};
  for (const row of rows) {
    config[row.key] = row.value;
  }
  cache = config;
  return config;
}

/**
 * 获取单个配置项（优先从缓存读取）
 */
export async function getConfig(key: string): Promise<string | undefined> {
  if (!cache) {
    await loadConfig();
  }
  return cache![key];
}

/**
 * 获取所有配置
 */
export async function getAllConfig(): Promise<Record<string, string>> {
  if (!cache) {
    await loadConfig();
  }
  return { ...cache! };
}

/**
 * 设置配置项（写入数据库并更新缓存）
 */
export async function setConfig(key: string, value: string): Promise<void> {
  await SystemConfig.upsert({ key, value });
  if (!cache) {
    cache = {};
  }
  cache[key] = value;
}

/**
 * 批量设置配置
 */
export async function setConfigs(entries: Array<{ key: string; value: string }>): Promise<void> {
  for (const { key, value } of entries) {
    await SystemConfig.upsert({ key, value });
  }
  await loadConfig();
}

/**
 * 初始化默认配置（仅当表中无记录时写入）
 */
export async function initDefaultConfig(defaults: Record<string, string>): Promise<void> {
  const count = await SystemConfig.count();
  if (count > 0) return;

  const entries = Object.entries(defaults).map(([key, value]) => ({ key, value }));
  await SystemConfig.bulkCreate(entries as any);
  await loadConfig();
}

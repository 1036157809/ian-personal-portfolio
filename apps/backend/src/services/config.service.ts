import SystemConfig from '../models/system-config.model';

let cache: Record<string, string> | null = null;

export const loadConfig = async (): Promise<Record<string, string>> => {
  const rows = await SystemConfig.findAll();
  cache = {};
  for (const row of rows) cache[row.key] = row.value;
  return cache;
};

export const getConfig = (key: string): string | undefined => {
  return cache?.[key];
};

export const getAllConfig = (): Record<string, string> => {
  return { ...(cache ?? {}) };
};

export const setConfig = async (key: string, value: string): Promise<void> => {
  await SystemConfig.upsert({ key, value });
  if (!cache) cache = {};
  cache[key] = value;
};

export const setConfigs = async (entries: Array<{ key: string; value: string }>): Promise<void> => {
  for (const { key, value } of entries) await SystemConfig.upsert({ key, value });
  await loadConfig();
};

export const refreshCache = loadConfig;

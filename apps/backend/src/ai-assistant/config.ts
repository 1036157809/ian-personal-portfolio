import { getConfig } from 'src/services/config.service';
import { ConfigKeys } from './constants';

const requireConfig = async (key: string): Promise<string> => {
  const value = await getConfig(key);
  if (!value) throw new Error(`Missing required config: ${key}`);
  return value;
};

export const getChromaApiKey = async () => requireConfig(ConfigKeys.CHROMADB_API_KEY);
export const getChromaHost = async () => requireConfig(ConfigKeys.CHROMADB_HOST);
export const getChromaTenant = async () => requireConfig(ConfigKeys.CHROMADB_TENANT);
export const getChromaDatabase = async () => requireConfig(ConfigKeys.CHROMADB_DATABASE);
export const getChromaCollection = async () => requireConfig(ConfigKeys.CHROMADB_COLLECTION);

export const getLlmApiKey = async () => requireConfig(ConfigKeys.LLM_API_KEY);
export const getLlmBaseUrl = async () => requireConfig(ConfigKeys.LLM_BASE_URL);
export const getLlmModel = async () => requireConfig(ConfigKeys.LLM_MODEL);
export const getLlmMaxTokens = async () => parseInt(await requireConfig(ConfigKeys.LLM_MAX_TOKENS), 10);

export const getChunkMaxSize = async () => parseInt(await requireConfig(ConfigKeys.CHUNK_MAX_SIZE), 10);
export const getChunkOverlap = async () => parseInt(await requireConfig(ConfigKeys.CHUNK_OVERLAP), 10);
export const getRetrieveTopK = async () => parseInt(await requireConfig(ConfigKeys.RETRIEVE_TOP_K), 10);

export const getOpenSkyClientId = async () => requireConfig(ConfigKeys.OPENSKY_CLIENT_ID);
export const getOpenSkyClientSecret = async () => requireConfig(ConfigKeys.OPENSKY_CLIENT_SECRET);

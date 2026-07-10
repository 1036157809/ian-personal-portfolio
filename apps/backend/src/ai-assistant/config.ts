import { getConfig } from 'src/services/config.service';
import { ConfigKeys } from './constants';

const requireConfig = (key: string): string => {
  const value = getConfig(key);
  if (!value) throw new Error(`Missing required config: ${key}`);
  return value;
};

export const getChromaApiKey = () => requireConfig(ConfigKeys.CHROMADB_API_KEY);
export const getChromaHost = () => requireConfig(ConfigKeys.CHROMADB_HOST);
export const getChromaTenant = () => requireConfig(ConfigKeys.CHROMADB_TENANT);
export const getChromaDatabase = () => requireConfig(ConfigKeys.CHROMADB_DATABASE);
export const getChromaCollection = () => requireConfig(ConfigKeys.CHROMADB_COLLECTION);

export const getLlmApiKey = () => requireConfig(ConfigKeys.LLM_API_KEY);
export const getLlmBaseUrl = () => requireConfig(ConfigKeys.LLM_BASE_URL);
export const getLlmModel = () => requireConfig(ConfigKeys.LLM_MODEL);
export const getLlmMaxTokens = () => parseInt(requireConfig(ConfigKeys.LLM_MAX_TOKENS), 10);

export const getChunkMaxSize = () => parseInt(requireConfig(ConfigKeys.CHUNK_MAX_SIZE), 10);
export const getChunkOverlap = () => parseInt(requireConfig(ConfigKeys.CHUNK_OVERLAP), 10);
export const getRetrieveTopK = () => parseInt(requireConfig(ConfigKeys.RETRIEVE_TOP_K), 10);

export const getOpenSkyClientId = () => requireConfig(ConfigKeys.OPENSKY_CLIENT_ID);
export const getOpenSkyClientSecret = () => requireConfig(ConfigKeys.OPENSKY_CLIENT_SECRET);

export const ConfigKeys = {
  OPENSKY_CLIENT_ID: 'opensky_client_id',
  OPENSKY_CLIENT_SECRET: 'opensky_client_secret',
  LLM_API_KEY: 'llm_api_key',
  LLM_BASE_URL: 'llm_base_url',
  LLM_MODEL: 'llm_model',
  LLM_MAX_TOKENS: 'llm_max_tokens',
  CHROMADB_API_KEY: 'chromadb_api_key',
  CHROMADB_HOST: 'chromadb_host',
  CHROMADB_TENANT: 'chromadb_tenant',
  CHROMADB_DATABASE: 'chromadb_database',
  CHROMADB_COLLECTION: 'chromadb_collection',
  CHUNK_MAX_SIZE: 'chunk_max_size',
  CHUNK_OVERLAP: 'chunk_overlap',
  RETRIEVE_TOP_K: 'retrieve_top_k',
  EMBEDDING_BASE_URL: 'embedding_base_url',
  EMBEDDING_MODEL: 'embedding_model',
  EMBEDDING_API_KEY: 'embedding_api_key',
} as const;

export type ConfigKey = (typeof ConfigKeys)[keyof typeof ConfigKeys];

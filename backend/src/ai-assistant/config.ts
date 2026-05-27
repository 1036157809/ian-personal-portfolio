import dotenv from 'dotenv';
import path from 'path';

// 加载 .env（确保在最早时机执行一次）
dotenv.config({ path: path.join(__dirname, '../../.env') });

// ─── ChromaDB ───────────────────────────────────────────────
export const CHROMADB_API_KEY = required('CHROMADB_API_KEY');
export const CHROMADB_HOST = env('CHROMADB_HOST', 'api.trychroma.com');
export const CHROMADB_TENANT = env('CHROMADB_TENANT', '2a489883-3240-429b-aedf-24298871c022');
export const CHROMADB_DATABASE = env('CHROMADB_DATABASE', 'YFengCDB');
export const CHROMADB_COLLECTION = env('CHROMADB_COLLECTION', 'portfolio-knowledge');

// ─── LLM (LongCat, 兼容 OpenAI API 格式) ────────────────────
export const LLM_API_KEY = required('ANTHROPIC_AUTH_TOKEN');
export const LLM_BASE_URL = env('LLM_BASE_URL', 'https://api.longcat.chat/openai/v1');
export const LLM_MODEL = env('LLM_MODEL', 'LongCat-2.0-Preview');
export const LLM_MAX_TOKENS = parseInt(env('LLM_MAX_TOKENS', '1024'), 10) || 1024;

// ─── 切片 ───────────────────────────────────────────────────
export const CHUNK_MAX_SIZE = parseInt(env('CHUNK_MAX_SIZE', '400'), 10) || 400;
export const CHUNK_OVERLAP = parseInt(env('CHUNK_OVERLAP', '50'), 10) || 50;
export const RETRIEVE_TOP_K = parseInt(env('RETRIEVE_TOP_K', '5'), 10) || 5;

// ─── 工具函数 ───────────────────────────────────────────────
function env(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

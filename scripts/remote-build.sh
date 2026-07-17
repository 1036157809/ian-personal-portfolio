#!/bin/bash
set -euo pipefail

GIT_BRANCH="${GIT_BRANCH:-master}"
BUILD_TARGET="${BUILD_TARGET:-both}"
DEPLOY_ENV="${DEPLOY_ENV:-prod}"
TIANDITU_TOKEN="${VITE_TIANDITU_TOKEN:-}"
API_BASE_URL="${VITE_API_BASE_URL:-/api}"
REMOTE_DIR="/root/ian-personal-portfolio"

echo "=== Ian Portfolio 远程构建 ==="
echo "分支: ${GIT_BRANCH} | 目标: ${BUILD_TARGET} | 环境: ${DEPLOY_ENV}"

# 根据环境选择 docker-compose 配置
case "${DEPLOY_ENV}" in
  prod)    COMPOSE_FILE="docker-compose.yml" ;;
  staging) COMPOSE_FILE="docker-compose.staging.yml" ;;
  dev)     COMPOSE_FILE="docker-compose.dev.yml" ;;
  *)       echo "❌ 未知环境: ${DEPLOY_ENV}" >&2; exit 1 ;;
esac

if [ ! -f "${REMOTE_DIR}/${COMPOSE_FILE}" ]; then
  echo "❌ 环境配置文件不存在: ${COMPOSE_FILE}" >&2
  exit 1
fi

cd "${REMOTE_DIR}"

echo "--- [1/6] 拉取代码 ---"

# 尝试 git fetch（带重试）
MAX_RETRIES=3
RETRY=0
GIT_SUCCESS=false

while [ $RETRY -lt $MAX_RETRIES ]; do
  RETRY=$((RETRY + 1))
  echo "尝试 git fetch (${RETRY}/${MAX_RETRIES})..."
  
  if git fetch --depth 1 origin "${GIT_BRANCH}" 2>&1; then
    git checkout "${GIT_BRANCH}" 2>/dev/null || git checkout -b "${GIT_BRANCH}" "origin/${GIT_BRANCH}"
    GIT_SUCCESS=true
    break
  fi
  
  echo "git fetch 失败，等待 5 秒后重试..."
  sleep 5
done

if [ "$GIT_SUCCESS" = false ]; then
  echo "git fetch 多次失败，尝试 zip 下载兜底..."
  
  # 用 zip 下载（单次 HTTP GET，更可靠）
  TMP_ZIP="/tmp/repo-${GIT_BRANCH}.zip"
  curl -L --connect-timeout 10 --max-time 120 \
    "https://gitee.com/zyf-zed/ian-personal-portfolio/repository/archive/${GIT_BRANCH}.zip" \
    -o "${TMP_ZIP}"
  
  # 解压并同步到工作目录
  TMP_EXTRACT="/tmp/repo-extract"
  rm -rf "${TMP_EXTRACT}"
  mkdir -p "${TMP_EXTRACT}"
  unzip -q "${TMP_ZIP}" -d "${TMP_EXTRACT}"
  
  # 找到解压后的目录名
  EXTRACTED_DIR=$(find "${TMP_EXTRACT}" -maxdepth 1 -type d | tail -1)
  
  # 同步到工作目录（保留 .git 如果存在）
  rsync -a --delete --exclude='.git' "${EXTRACTED_DIR}/" "${REMOTE_DIR}/"
  rm -f "${TMP_ZIP}"
fi

echo "当前 commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"

echo "--- [2/6] 安装依赖 ---"
export NPM_CONFIG_REGISTRY=https://registry.npmmirror.com
pnpm install --frozen-lockfile

# 根据构建目标决定 turbo filter
case "${BUILD_TARGET}" in
  frontend)
    FILTER="--filter=@ianportfolio/frontend"
    COMPOSE_SERVICES="frontend"
    ;;
  backend)
    FILTER="--filter=@ianportfolio/backend"
    COMPOSE_SERVICES="backend"
    ;;
  both)
    FILTER=""
    COMPOSE_SERVICES=""
    ;;
  *)
    echo "❌ 未知构建目标: ${BUILD_TARGET}" >&2
    exit 1
    ;;
esac

echo "--- [3/6] 代码检查 ---"
if [ -n "${FILTER}" ]; then
  pnpm turbo run lint ${FILTER}
else
  pnpm turbo run lint
fi

echo "--- [4/6] 运行测试 ---"
if [ -n "${FILTER}" ]; then
  pnpm turbo run test ${FILTER}
else
  pnpm turbo run test
fi

echo "--- [5/6] 构建应用 ---"
if [ -n "${FILTER}" ]; then
  pnpm turbo run build ${FILTER}
else
  pnpm turbo run build
fi

echo "--- [6/6] 重启 Docker 服务 (${DEPLOY_ENV}) ---"
export VITE_TIANDITU_TOKEN="${TIANDITU_TOKEN}"
export VITE_API_BASE_URL="${API_BASE_URL}"

if [ -n "${COMPOSE_SERVICES}" ]; then
  docker compose -f "${COMPOSE_FILE}" build ${COMPOSE_SERVICES}
  docker compose -f "${COMPOSE_FILE}" up -d ${COMPOSE_SERVICES}
else
  docker compose -f "${COMPOSE_FILE}" down
  docker compose -f "${COMPOSE_FILE}" up --build -d
fi

echo "--- 健康检查 ---"
if [ "${BUILD_TARGET}" = "backend" ] || [ "${BUILD_TARGET}" = "both" ]; then
  echo "后端检查..."
  for i in $(seq 1 30); do
    if curl -sf http://localhost:3001/api/health >/dev/null 2>&1; then
      echo "✅ 后端就绪"; break
    fi
    [ $i -eq 30 ] && { echo "❌ 后端超时"; docker compose -f "${COMPOSE_FILE}" logs --tail=30 backend; exit 1; }
    sleep 2
  done
fi

if [ "${BUILD_TARGET}" = "frontend" ] || [ "${BUILD_TARGET}" = "both" ]; then
  echo "前端检查..."
  for i in $(seq 1 30); do
    if curl -sf http://localhost:80 >/dev/null 2>&1; then
      echo "✅ 前端就绪"; break
    fi
    [ $i -eq 30 ] && { echo "❌ 前端超时"; docker compose -f "${COMPOSE_FILE}" logs --tail=30 frontend; exit 1; }
    sleep 2
  done
fi

docker image prune -f
echo "✅ 部署完成 [${BUILD_TARGET}] → ${DEPLOY_ENV}"

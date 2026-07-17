#!/bin/bash
set -euo pipefail

GIT_BRANCH="${1:-master}"
BUILD_TARGET="${2:-both}"
DEPLOY_ENV="${3:-prod}"
TIANDITU_TOKEN="${VITE_TIANDITU_TOKEN:-}"
API_BASE_URL="${VITE_API_BASE_URL:-/api}"
REMOTE_DIR="/root/ian-personal-portfolio"

echo "=== Ian Portfolio 远程构建 ==="
echo "分支: ${GIT_BRANCH} | 目标: ${BUILD_TARGET} | 环境: ${DEPLOY_ENV}"
cd "${REMOTE_DIR}"

# 根据环境选择 docker-compose 配置
# 当前只有 prod，未来可扩展 staging/dev
case "${DEPLOY_ENV}" in
  prod)
    COMPOSE_FILE="docker-compose.yml"
    ;;
  staging)
    COMPOSE_FILE="docker-compose.staging.yml"
    ;;
  dev)
    COMPOSE_FILE="docker-compose.dev.yml"
    ;;
  *)
    echo "❌ 未知环境: ${DEPLOY_ENV}" >&2
    exit 1
    ;;
esac

# 检查 compose 文件是否存在
if [ ! -f "${COMPOSE_FILE}" ]; then
  echo "❌ 环境配置文件不存在: ${COMPOSE_FILE}" >&2
  echo "提示: ${DEPLOY_ENV} 环境尚未配置，请先在服务器创建 ${COMPOSE_FILE}" >&2
  exit 1
fi

echo "--- [1/6] 拉取代码 ---"
git fetch origin
git checkout "${GIT_BRANCH}"
git pull origin "${GIT_BRANCH}"
echo "当前 commit: $(git rev-parse --short HEAD)"

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
export COMPOSE_FILE="${COMPOSE_FILE}"

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

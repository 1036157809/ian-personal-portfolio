#!/bin/bash
set -euo pipefail

# 参数
GIT_BRANCH="${GIT_BRANCH:-master}"
BUILD_TARGET="${BUILD_TARGET:-both}"
DEPLOY_ENV="${DEPLOY_ENV:-prod}"
TIANDITU_TOKEN="${VITE_TIANDITU_TOKEN:-}"
API_BASE_URL="${VITE_API_BASE_URL:-/api}"

echo "=== Ian Portfolio 部署 ==="
echo "分支: ${GIT_BRANCH} | 目标: ${BUILD_TARGET} | 环境: ${DEPLOY_ENV}"

# 进入项目目录
cd /root/ian-personal-portfolio

# 拉取代码
echo "--- git pull ---"
git fetch origin
git checkout "${GIT_BRANCH}"
git pull origin "${GIT_BRANCH}"
echo "当前 commit: $(git rev-parse --short HEAD)"

# 根据构建目标执行不同操作
case "${BUILD_TARGET}" in
  frontend)
    echo "--- 构建前端 ---"
    export NPM_CONFIG_REGISTRY=https://registry.npmmirror.com
    pnpm install --frozen-lockfile
    pnpm turbo run build --filter=@ianportfolio/frontend
    docker compose build frontend
    docker compose up -d frontend
    ;;
  backend)
    echo "--- 构建后端 ---"
    export NPM_CONFIG_REGISTRY=https://registry.npmmirror.com
    pnpm install --frozen-lockfile
    pnpm turbo run build --filter=@ianportfolio/backend
    docker compose build backend
    docker compose up -d backend
    ;;
  both)
    echo "--- 全量构建 ---"
    export NPM_CONFIG_REGISTRY=https://registry.npmmirror.com
    pnpm install --frozen-lockfile
    pnpm turbo run build
    docker compose down
    docker compose up --build -d
    ;;
esac

# 健康检查
echo "--- 健康检查 ---"
for i in $(seq 1 30); do
  if curl -sf http://localhost:3001/api/health >/dev/null 2>&1; then
    echo "✅ 后端就绪"; break
  fi
  [ $i -eq 30 ] && { echo "❌ 后端超时"; exit 1; }
  sleep 2
done

for i in $(seq 1 30); do
  if curl -sf http://localhost:80 >/dev/null 2>&1; then
    echo "✅ 前端就绪"; break
  fi
  [ $i -eq 30 ] && { echo "❌ 前端超时"; exit 1; }
  sleep 2
done

echo "✅ 部署完成"

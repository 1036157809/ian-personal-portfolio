#!/bin/bash
set -euo pipefail

GIT_BRANCH="${1:-master}"
TIANDITU_TOKEN="${VITE_TIANDITU_TOKEN:-}"
API_BASE_URL="${VITE_API_BASE_URL:-/api}"
REMOTE_DIR="/root/ian-personal-portfolio"

echo "=== Ian Portfolio 远程构建 | 分支: ${GIT_BRANCH} ==="

cd "${REMOTE_DIR}"

echo "--- [1/6] 拉取代码 ---"
git fetch origin
git checkout "${GIT_BRANCH}"
git pull origin "${GIT_BRANCH}"
echo "当前 commit: $(git rev-parse --short HEAD)"

echo "--- [2/6] 安装依赖 ---"
export NPM_CONFIG_REGISTRY=https://registry.npmmirror.com
pnpm install --frozen-lockfile

echo "--- [3/6] 代码检查 ---"
pnpm -w lint

echo "--- [4/6] 运行测试 ---"
pnpm -w test

echo "--- [5/6] 构建应用 ---"
pnpm -w build

echo "--- [6/6] 重启 Docker 服务 ---"
export VITE_TIANDITU_TOKEN="${TIANDITU_TOKEN}"
export VITE_API_BASE_URL="${API_BASE_URL}"
docker compose down
docker compose up --build -d

echo "--- 健康检查: 后端 ---"
for i in $(seq 1 30); do
  if curl -sf http://localhost:3001/api/health >/dev/null 2>&1; then
    echo "✅ 后端服务就绪"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "❌ 后端健康检查失败"
    docker compose logs --tail=30 backend
    exit 1
  fi
  sleep 2
done

echo "--- 健康检查: 前端 ---"
for i in $(seq 1 30); do
  if curl -sf http://localhost:80 >/dev/null 2>&1; then
    echo "✅ 前端服务就绪"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "❌ 前端健康检查失败"
    docker compose logs --tail=30 frontend
    exit 1
  fi
  sleep 2
done

docker image prune -f
echo "✅ 部署完成"

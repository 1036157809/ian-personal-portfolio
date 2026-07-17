#!/bin/bash
set -euo pipefail

GIT_BRANCH="${GIT_BRANCH:-master}"
BUILD_TARGET="${BUILD_TARGET:-both}"
DEPLOY_ENV="${DEPLOY_ENV:-prod}"

cd /root/ian-personal-portfolio

echo "--- git pull ---"
git fetch origin
git checkout "${GIT_BRANCH}"
git pull origin "${GIT_BRANCH}"
echo "当前 commit: $(git rev-parse --short HEAD)"

# 脚本更新后重新执行最新版本（仅一次）
if [ "${_REEXEC:-}" != "true" ]; then
  echo "--- 检测到脚本更新，重新执行新版本 ---"
  export _REEXEC=true
  exec bash "$0"
fi

echo "=== Ian Portfolio 部署 ==="
echo "分支: ${GIT_BRANCH} | 目标: ${BUILD_TARGET} | 环境: ${DEPLOY_ENV}"

echo "--- docker compose 构建并启动 ---"
case "${BUILD_TARGET}" in
  frontend)
    docker compose build frontend
    docker compose up -d frontend
    ;;
  backend)
    docker compose build backend
    docker compose up -d backend
    ;;
  both)
    docker compose up --build -d
    ;;
esac

echo "--- 健康检查 ---"
sleep 5
for i in $(seq 1 30); do
  if curl -sf http://localhost:3001/ >/dev/null 2>&1; then
    echo "✅ 后端就绪"; break
  fi
  [ $i -eq 30 ] && { echo "❌ 后端超时"; docker compose logs --tail=30 backend; exit 1; }
  sleep 2
done

for i in $(seq 1 30); do
  if curl -sf http://localhost:80 >/dev/null 2>&1; then
    echo "✅ 前端就绪"; break
  fi
  [ $i -eq 30 ] && { echo "❌ 前端超时"; docker compose logs --tail=30 frontend; exit 1; }
  sleep 2
done

echo "✅ 部署完成"

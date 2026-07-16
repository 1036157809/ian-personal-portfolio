#!/bin/bash
set -euo pipefail

# 由 Jenkins 环境变量注入
REMOTE_HOST="${REMOTE_HOST:?必须设置 REMOTE_HOST}"
REMOTE_USER="${REMOTE_USER:?必须设置 REMOTE_USER}"
REMOTE_DIR="${REMOTE_DEPLOY_DIR:?必须设置 REMOTE_DEPLOY_DIR}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
SSH_KEY_PATH="${SSH_KEY_PATH:?必须设置 SSH_KEY_PATH}"
TIANDITU_TOKEN="${VITE_TIANDITU_TOKEN:-}"
API_BASE_URL="${VITE_API_BASE_URL:-/api}"

BACKEND_IMG="ianportfolio/backend:${IMAGE_TAG}"
FRONTEND_IMG="ianportfolio/frontend:${IMAGE_TAG}"

SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10"

echo "=== [1/5] 构建 Docker 镜像 (linux/amd64) ==="
docker buildx build \
  --platform linux/amd64 \
  -f apps/backend/Dockerfile \
  -t "${BACKEND_IMG}" \
  -t ianportfolio/backend:latest \
  --load \
  .

docker buildx build \
  --platform linux/amd64 \
  -f apps/frontend/Dockerfile \
  --build-arg VITE_TIANDITU_TOKEN="${TIANDITU_TOKEN}" \
  --build-arg VITE_API_BASE_URL="${API_BASE_URL}" \
  -t "${FRONTEND_IMG}" \
  -t ianportfolio/frontend:latest \
  --load \
  .

echo "=== [2/5] 导出镜像 ==="
docker save "${BACKEND_IMG}"  | gzip > /tmp/backend.tar.gz
docker save "${FRONTEND_IMG}" | gzip > /tmp/frontend.tar.gz
echo "backend:  $(du -h /tmp/backend.tar.gz | cut -f1)"
echo "frontend: $(du -h /tmp/frontend.tar.gz | cut -f1)"

echo "=== [3/5] SCP 传输到远程服务器 ==="
scp -i "${SSH_KEY_PATH}" ${SSH_OPTS} /tmp/backend.tar.gz  "${REMOTE_USER}@${REMOTE_HOST}:/tmp/"
scp -i "${SSH_KEY_PATH}" ${SSH_OPTS} /tmp/frontend.tar.gz "${REMOTE_USER}@${REMOTE_HOST}:/tmp/"

echo "=== [4/5] 远程加载 + 重启 + 健康检查 ==="
ssh -i "${SSH_KEY_PATH}" ${SSH_OPTS} "${REMOTE_USER}@${REMOTE_HOST}" << 'REMOTEEOF'
  set -euo pipefail

  echo "--- 加载镜像 ---"
  docker load < /tmp/backend.tar.gz
  docker load < /tmp/frontend.tar.gz
  rm -f /tmp/backend.tar.gz /tmp/frontend.tar.gz

  echo "--- 重启服务 ---"
  cd ${REMOTE_DIR}
  docker compose down
  docker compose up -d

  echo "--- 等待后端就绪 ---"
  for i in $(seq 1 30); do
    if curl -sf http://localhost:3001/api/health >/dev/null 2>&1; then
      echo "✅ 后端健康检查通过"
      break
    fi
    if [ $i -eq 30 ]; then
      echo "❌ 后端健康检查失败" >&2
      docker compose logs --tail=30 backend
      exit 1
    fi
    sleep 2
  done

  echo "--- 等待前端就绪 ---"
  for i in $(seq 1 30); do
    if curl -sf http://localhost:80 >/dev/null 2>&1; then
      echo "✅ 前端健康检查通过"
      break
    fi
    if [ $i -eq 30 ]; then
      echo "❌ 前端健康检查失败" >&2
      docker compose logs --tail=30 frontend
      exit 1
    fi
    sleep 2
  done

  echo "--- 清理悬空镜像 ---"
  docker image prune -f

  echo "✅ 远程部署完成"
REMOTEEOF

rm -f /tmp/backend.tar.gz /tmp/frontend.tar.gz
echo "=== [5/5] 本地临时文件清理完成 ==="

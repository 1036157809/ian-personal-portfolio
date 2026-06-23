#!/bin/bash
set -euo pipefail

echo "=== Ian Portfolio Jenkins 一键部署 ==="

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 0. 检查 Docker
if ! command -v docker &>/dev/null; then
    log_error "Docker 未安装"
    exit 1
fi

# 1. 创建项目目录
DEPLOY_DIR="/opt/ian-personal-portfolio"
mkdir -p "$DEPLOY_DIR"
cd "$DEPLOY_DIR"

# 2. 克隆/更新代码
if [ -d ".git" ]; then
    log_info "更新代码..."
    git fetch origin && git checkout master && git pull origin master
else
    log_info "克隆代码..."
    git clone https://gitee.com/zyf-zed/ian-personal-portfolio.git .
fi

# 3. 读取密码（从 .env.jenkins 或环境变量）
if [ -f ".env.jenkins" ]; then
    JENKINS_PASS=$(grep JENKINS_ADMIN_PASSWORD .env.jenkins | cut -d= -f2 | tr -d '\r')
    GITEE_USER=$(grep GITEE_USER .env.jenkins | cut -d= -f2 | tr -d '\r')
    log_info "已从 .env.jenkins 读取配置"
else
    log_warn ".env.jenkins 不存在，使用默认密码 admin123"
    JENKINS_PASS="admin123"
    GITEE_USER="zyf-zed"
fi

# 4. 检查 Jenkins 是否已在运行
if curl -sf http://localhost:8080/login >/dev/null 2>&1; then
    log_info "Jenkins 已在运行，跳过容器创建..."
else
    log_info "启动 Jenkins..."
    cd ci/jenkins
    docker compose -f docker-compose.jenkins.yml up -d
    
    log_info "等待 Jenkins 启动..."
    for i in $(seq 1 60); do
        if curl -sf http://localhost:8080/login >/dev/null 2>&1; then
            log_info "Jenkins 已启动！"
            break
        fi
        [ $i -eq 60 ] && { log_error "Jenkins 启动超时"; exit 1; }
        sleep 2
    done
fi

# 5. 安装插件（如果还没装）
PLUGIN_DIR="$DEPLOY_DIR/ci/jenkins/plugins"
if [ ! -f "$PLUGIN_DIR/workflow-multibranch.hpi" ]; then
    log_info "下载插件..."
    mkdir -p "$PLUGIN_DIR"
    UPDATE_JSON=$(curl -fsSL "https://updates.jenkins.io/current/update-center.json")
    for PLUGIN_NAME in workflow-multibranch branch-api git workflow-aggregator cloudbees-folder; do
        URL=$(echo "$UPDATE_JSON" | python3 -c "
import sys, json
text = sys.stdin.read()
start = text.index('{')
data = json.loads(text[start:])
print(data.get('plugins', {}).get('$PLUGIN_NAME', {}).get('url', ''))
" 2>/dev/null)
        if [ -n "$URL" ]; then
            EXT="${URL##*.}"
            curl -fsSL "$URL" -o "$PLUGIN_DIR/${PLUGIN_NAME}.${EXT}" 2>/dev/null && log_info "已下载: $PLUGIN_NAME" || log_warn "下载失败: $PLUGIN_NAME"
        fi
    done
fi

# 6. 复制插件到 Jenkins 容器
log_info "复制插件到 Jenkins 容器..."
cd "$DEPLOY_DIR"
docker cp "ci/jenkins/plugins/." ian-jenkins:/var/jenkins_home/plugins/

# 7. 创建 Multibranch Pipeline 配置
log_info "创建 Multibranch Pipeline..."
docker exec -i ian-jenkins mkdir -p /var/jenkins_home/jobs/ian-personal-portfolio
docker cp "ci/jenkins/multibranch-config.xml" ian-jenkins:/var/jenkins_home/jobs/ian-personal-portfolio/config.xml

# 8. 重启 Jenkins
log_info "重启 Jenkins..."
cd ci/jenkins
docker compose -f docker-compose.jenkins.yml restart jenkins

log_info "等待 Jenkins 启动..."
for i in $(seq 1 60); do
    if curl -sf http://localhost:8080/login >/dev/null 2>&1; then
        log_info "Jenkins 已启动！"
        break
    fi
    [ $i -eq 60 ] && { log_error "Jenkins 启动超时"; exit 1; }
    sleep 2
done

# 9. 验证
log_info "验证..."
JOBS=$(curl -s "http://localhost:8080/api/json" -u admin:$JENKINS_PASS 2>&1 | grep -o '"name":"ian-personal-portfolio"' | head -1)
if [ -n "$JOBS" ]; then
    log_info "✅ 部署完成！流水线已创建。"
else
    log_warn "⚠️  流水线未在 API 中出现，可能需要检查 Jenkins 日志。"
    log_info "请检查: docker logs ian-jenkins | grep -i 'ian-personal\|error\|exception'"
fi

log_info "========================================"
log_info "Jenkins URL: http://$(curl -s ifconfig.me 2>/dev/null || echo 'localhost'):8080"
log_info "用户名: admin"
log_info "密码: <REDACTED>
log_info "========================================"

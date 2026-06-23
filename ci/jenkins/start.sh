#!/bin/bash
set -euo pipefail

echo "=== Ian Portfolio Jenkins 一键部署 ==="

# 颜色
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

# 3. 确保 .env.jenkins 存在
if [ ! -f ".env.jenkins" ]; then
    log_warn "请创建 .env.jenkins 文件："
    cat << 'ENVEOF'
GITEE_USER=zyf-zed
GITEE_TOKEN=your_gitee_token
VITE_TIANDITU_TOKEN=your_tianditu_token
JENKINS_ADMIN_PASSWORD=your_password
ENVEOF
    exit 1
fi

# 4. 启动 Jenkins
log_info "启动 Jenkins..."
cd ci/jenkins
docker compose -f docker-compose.jenkins.yml up -d

# 5. 等待 Jenkins 启动
log_info "等待 Jenkins 启动..."
for i in $(seq 1 60); do
    if curl -sf http://localhost:8080/login >/dev/null 2>&1; then
        log_info "Jenkins 已启动！"
        break
    fi
    [ $i -eq 60 ] && { log_error "Jenkins 启动超时"; exit 1; }
    sleep 2
done

# 6. 安装插件
log_info "安装插件..."
CRUMB_RESP=$(curl -s 'http://localhost:8080/crumbIssuer/api/json' -u admin:$(grep JENKINS_ADMIN_PASSWORD /opt/ian-personal-portfolio/.env.jenkins | cut -d= -f2 | tr -d '\r'))
CRUMB=$(echo "$CRUMB_RESP" | grep -o '"crumb":"[^"]*"' | cut -d'"' -f4)
FIELD=$(echo "$CRUMB_RESP" | grep -o '"crumbRequestField":"[^"]*"' | cut -d'"' -f4)

if [ -z "$CRUMB" ]; then
    log_error "无法获取 Jenkins Crumb"
    exit 1
fi

# 下载插件
UPDATE_JSON=$(curl -fsSL "https://updates.jenkins.io/current/update-center.json")
PLUGIN_DIR="/opt/ian-personal-portfolio/ci/jenkins/plugins"
mkdir -p "$PLUGIN_DIR"

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
        curl -fsSL "$URL" -o "$PLUGIN_DIR/${PLUGIN_NAME}.${EXT}" && log_info "已下载: $PLUGIN_NAME" || log_warn "下载失败: $PLUGIN_NAME"
    else
        log_warn "未找到插件: $PLUGIN_NAME"
    fi
done

# 7. 将插件复制到 Jenkins 容器
log_info "复制插件到 Jenkins 容器..."
docker cp "$PLUGIN_DIR/." ian-jenkins:/var/jenkins_home/plugins/

# 8. 重启 Jenkins 加载插件
log_info "重启 Jenkins 加载插件..."
docker compose -f docker-compose.jenkins.yml restart jenkins
sleep 60

# 9. 创建 Multibranch Pipeline
log_info "创建 Multibranch Pipeline..."
JENKINS_PASS=$(grep JENKINS_ADMIN_PASSWORD /opt/ian-personal-portfolio/.env.jenkins | cut -d= -f2 | tr -d '\r')
CRUMB_RESP=$(curl -s 'http://localhost:8080/crumbIssuer/api/json' -u admin:$JENKINS_PASS)
CRUMB=$(echo "$CRUMB_RESP" | grep -o '"crumb":"[^"]*"' | cut -d'"' -f4)
FIELD=$(echo "$CRUMB_RESP" | grep -o '"crumbRequestField":"[^"]*"' | cut -d'"' -f4)

# 先尝试通过 API 创建
RESPONSE=$(curl -s -b /tmp/jcookies.txt -X POST "http://localhost:8080/createItem?name=ian-personal-portfolio" \
  -u admin:$JENKINS_PASS \
  -H "$FIELD:$CRUMB" \
  -H "Content-Type: application/xml" \
  -d '<org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject plugin="workflow-multibranch@latest"><description>Ian Portfolio</description><sources class="jenkins.branch.MultiBranchProject$BranchSourceList" plugin="branch-api@latest"><owner class="org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject" reference="../.."/><data><jenkins.branch.BranchSource plugin="branch-api@latest"><source class="plugins.git.GitSCMSource" plugin="git@latest"><id>ian-gitee</id><remote>https://gitee.com/zyf-zed/ian-personal-portfolio.git</remote><credentialsId>gitee-credentials</credentialsId><traits><jenkins.plugins.git.traits.BranchDiscoveryTrait plugin="git@latest"/></traits></source><strategy class="jenkins.branch.DefaultBranchPropertyStrategy" plugin="branch-api@latest"/></jenkins.branch.BranchSource></data></sources><factory class="org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProjectFactory" plugin="workflow-multibranch@latest"><scriptPath>Jenkinsfile</scriptPath></factory><triggers><com.cloudbees.hudson.plugins.folder.computed.PeriodicFolderTrigger plugin="cloudbees-folder@latest"><spec>H/5 * * * *</spec></com.cloudbees.hudson.plugins.folder.computed.PeriodicFolderTrigger></triggers></org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject>')

if echo "$RESPONSE" | grep -qi "error\|403\|404\|html"; then
    log_warn "API 创建失败，尝试直接写配置文件..."
    # 直接写 config.xml
    docker exec -i ian-jenkins mkdir -p /var/jenkins_home/jobs/ian-personal-portfolio
    docker cp /opt/ian-personal-portfolio/ci/jenkins/multibranch-config.xml ian-jenkins:/var/jenkins_home/jobs/ian-personal-portfolio/config.xml
    docker compose -f docker-compose.jenkins.yml restart jenkins
    sleep 60
fi

# 10. 验证
log_info "验证..."
JOBS=$(curl -s "http://localhost:8080/api/json" -u admin:$JENKINS_PASS 2>&1 | grep -o '"name":"ian-personal-portfolio"' | head -1)
if [ -n "$JOBS" ]; then
    log_info "✅ 部署完成！流水线已创建。"
else
    log_warn "⚠️  流水线未在 API 中出现，可能需要手动在 Jenkins UI 创建。"
    log_info "访问 http://$(curl -s ifconfig.me):8080 手动创建。"
fi

log_info "========================================"
log_info "Jenkins URL: http://$(curl -s ifconfig.me):8080"
log_info "用户名: admin"
log_info "密码: $JENKINS_PASS"
log_info "========================================"

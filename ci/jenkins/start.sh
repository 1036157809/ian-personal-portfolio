#!/bin/bash
set -euo pipefail

echo "=== Ian Portfolio CI/CD 一键部署 ==="

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
DEPLOY_DIR="/root/ian-personal-portfolio"
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

# 3. 读取密码
if [ -f ".env.jenkins" ]; then
    JENKINS_PASS=$(grep JENKINS_ADMIN_PASSWORD .env.jenkins | cut -d= -f2 | tr -d '\r')
    log_info "已从 .env.jenkins 读取配置"
else
    JENKINS_PASS="admin123"
    log_warn ".env.jenkins 不存在，使用默认密码"
fi

# 4. 启动 Jenkins（如果未运行）
if curl -sf http://localhost:8080/login >/dev/null 2>&1; then
    log_info "Jenkins 已在运行"
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

# 5. 创建 Jenkins Pipeline job
log_info "创建 Pipeline job..."

# 获取 crumb
CRUMB_RESP=$(curl -s "http://localhost:8080/crumbIssuer/api/json" -u admin:$JENKINS_PASS)
CRUMB=$(echo "$CRUMB_RESP" | grep -o '"crumb":"[^"]*"' | cut -d'"' -f4)
FIELD=$(echo "$CRUMB_RESP" | grep -o '"crumbRequestField":"[^"]*"' | cut -d'"' -f4)

if [ -z "$CRUMB" ]; then
    log_error "无法获取 Crumb"
    exit 1
fi

# 创建 Pipeline job（用 curl + config.xml）
JOB_DIR="/tmp/jenkins-job-config"
mkdir -p "$JOB_DIR"

cat > "$JOB_DIR/config.xml" << 'XMLEOF'
<?xml version="1.0" encoding="UTF-8"?>
<flow-definition plugin="workflow-job@latest">
  <description>Ian Portfolio Pipeline</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <hudson.model.ParametersDefinitionProperty>
      <parameterDefinitions>
        <hudson.model.StringParameterDefinition>
          <name>GIT_BRANCH</name>
          <description>Git branch to build</description>
          <defaultValue>master</defaultValue>
          <trim>true</trim>
        </hudson.model.StringParameterDefinition>
      </parameterDefinitions>
    </hudson.model.ParametersDefinitionProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps@latest">
    <scriptPath>Jenkinsfile</scriptPath>
    <scm class="hudson.plugins.git.GitSCM" plugin="git@latest">
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>https://gitee.com/zyf-zed/ian-personal-portfolio.git</url>
          <credentialsId>gitee-credentials</credentialsId>
        </hudson.plugins.git.UserRemoteConfig>
      </userRemoteConfigs>
      <branches>
        <hudson.plugins.git.BranchSpec>
          <name>*/master</name>
        </hudson.plugins.git.BranchSpec>
      </branches>
    </scm>
  </definition>
  <triggers>
    <hudson.triggers.SCMTrigger>
      <spec>H/5 * * * *</spec>
      <ignorePostCommitHooks>false</ignorePostCommitHooks>
    </hudson.triggers.SCMTrigger>
  </triggers>
  <disabled>false</disabled>
</flow-definition>
XMLEOF

# 通过 API 创建
RESPONSE=$(curl -s -X POST "http://localhost:8080/createItem?name=ian-portfolio-deploy" \
  -u admin:$JENKINS_PASS \
  -H "$FIELD:$CRUMB" \
  -H "Content-Type: application/xml" \
  -d @"$JOB_DIR/config.xml")

if echo "$RESPONSE" | grep -qi "error\|403\|404"; then
    log_error "创建 job 失败"
    echo "$RESPONSE" | head -5
    exit 1
else
    log_info "Pipeline job 创建成功！"
fi

# 6. 确保凭据存在
log_info "检查凭据..."
# 凭据已通过 docker-compose 的环境变量注入

# 7. 验证
log_info "验证..."
JOBS=$(curl -s "http://localhost:8080/api/json" -u admin:$JENKINS_PASS 2>&1 | grep -o '"name":"ian-portfolio-deploy"' | head -1)
if [ -n "$JOBS" ]; then
    log_info "✅ 部署完成！"
else
    log_warn "⚠️  需要手动在 Jenkins UI 创建 job"
fi

log_info "========================================"
log_info "Jenkins URL: http://$(curl -s ifconfig.me 2>/dev/null || echo 'localhost'):8080"
log_info "用户名: admin"
log_info "密码: <REDACTED>
log_info "========================================"

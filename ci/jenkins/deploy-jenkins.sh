#!/bin/bash
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，正在安装..."
        curl -fsSL https://get.docker.com | sh
        systemctl enable docker
        systemctl start docker
    fi
    log_info "Docker 版本: $(docker --version)"
}

check_compose() {
    if ! docker compose version &> /dev/null; then
        log_warn "Docker Compose 未安装，正在安装..."
        COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep tag_name | cut -d'"' -f4)
        curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
    log_info "Docker Compose 版本: $(docker compose version --short 2>/dev/null || docker-compose --version)"
}

setup_directories() {
    log_info "创建项目目录..."
    mkdir -p /opt/ian-personal-portfolio
    mkdir -p /var/jenkins_home
    chmod 777 /var/jenkins_home
}

setup_project() {
    if [ -d "/opt/ian-personal-portfolio/.git" ]; then
        log_info "更新项目代码..."
        cd /opt/ian-personal-portfolio
        git fetch origin
        git checkout master
        git pull origin master
    else
        log_info "克隆项目代码..."
        git clone https://gitee.com/${GITEE_USER}/ian-personal-portfolio.git /opt/ian-personal-portfolio
    fi
}

create_env_file() {
    if [ ! -f "/opt/ian-personal-portfolio/.env.jenkins" ]; then
        log_warn "请创建 .env.jenkins 文件，内容如下："
        cat << 'ENVEOF'
GITEE_USER=your_gitee_username
GITEE_TOKEN=your_gitee_personal_access_token
VITE_TIANDITU_TOKEN=your_tianditu_token
JENKINS_ADMIN_PASSWORD=your_admin_password
ENVEOF
    fi
}

start_jenkins() {
    log_info "启动 Jenkins..."
    cd /opt/ian-personal-portfolio/ci/jenkins

    if [ -f ../.env.jenkins ]; then
        set -a
        source ../.env.jenkins
        set +a
    fi

    docker compose -f docker-compose.jenkins.yml up -d

    log_info "等待 Jenkins 启动..."
    for i in $(seq 1 60); do
        if curl -sf http://localhost:8080/login > /dev/null 2>&1; then
            log_info "Jenkins 已启动！"
            break
        fi
        if [ $i -eq 60 ]; then
            log_error "Jenkins 启动超时"
            exit 1
        fi
        echo -n "."
        sleep 2
    done
    echo ""
}

show_admin_info() {
    log_info "========================================"
    log_info "Jenkins 部署完成！"
    log_info "访问地址: http://$(curl -s ifconfig.me):8080"
    log_info "管理员用户名: admin"

    if [ -f /var/jenkins_home/secrets/initialAdminPassword ]; then
        log_info "初始管理员密码: $(cat /var/jenkins_home/secrets/initialAdminPassword)"
    else
        log_info "管理员密码: 见 .env.jenkins 中配置的 JENKINS_ADMIN_PASSWORD"
    fi

    log_info ""
    log_info "下一步操作："
    log_info "1. 在 Gitee 仓库 Settings -> Webhooks 添加 webhook:"
    log_info "   URL: http://$(curl -s ifconfig.me):8080/github-webhook/"
    log_info "   Content type: application/json"
    log_info "   Trigger events: Push events"
    log_info ""
    log_info "2. 推送代码到 master 分支触发首次构建"
    log_info "========================================"
}

main() {
    log_info "开始部署 Jenkins CI/CD 环境..."

    check_docker
    check_compose
    setup_directories
    setup_project
    create_env_file
    start_jenkins
    show_admin_info

    log_info "部署完成！"
}

main "$@"

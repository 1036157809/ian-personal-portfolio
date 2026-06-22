pipeline {
    agent any

    environment {
        DEPLOY_DIR = '/opt/ian-personal-portfolio'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    triggers {
        githubPush()
    }

    stages {
        stage('检出代码') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                    env.GIT_BRANCH_NAME = env.BRANCH_NAME ?: sh(
                        script: 'git rev-parse --abbrev-ref HEAD',
                        returnStdout: true
                    ).trim()
                    env.IMAGE_TAG = "${env.GIT_COMMIT_SHORT}-${env.BUILD_NUMBER}"
                }
                echo "分支: ${env.GIT_BRANCH_NAME}, Commit: ${env.GIT_COMMIT_SHORT}, 标签: ${env.IMAGE_TAG}"
            }
        }

        stage('安装依赖') {
            steps {
                sh '''
                    export NPM_CONFIG_REGISTRY=https://registry.npmmirror.com
                    pnpm install --frozen-lockfile
                '''
            }
        }

        stage('代码检查') {
            steps {
                sh 'pnpm -w lint'
            }
        }

        stage('运行测试') {
            steps {
                sh 'pnpm -w test'
            }
        }

        stage('构建应用') {
            steps {
                sh 'pnpm -w build'
            }
        }

        stage('构建 Docker 镜像') {
            steps {
                script {
                    def backendImg = "ianportfolio/backend:${env.IMAGE_TAG}"
                    def frontendImg = "ianportfolio/frontend:${env.IMAGE_TAG}"

                    env.BACKEND_IMAGE = backendImg
                    env.FRONTEND_IMAGE = frontendImg

                    sh """
                        docker build \
                            -f apps/backend/Dockerfile \
                            -t ${backendImg} \
                            -t ianportfolio/backend:latest \
                            .

                        docker build \
                            -f apps/frontend/Dockerfile \
                            --build-arg VITE_TIANDITU_TOKEN=${VITE_TIANDITU_TOKEN} \
                            --build-arg VITE_API_BASE_URL=/api \
                            -t ${frontendImg} \
                            -t ianportfolio/frontend:latest \
                            .
                    """
                }
            }
        }

        stage('部署') {
            when {
                branch 'master'
            }
            steps {
                sh '''
                    cd ${DEPLOY_DIR}

                    export BACKEND_IMAGE=${BACKEND_IMAGE}
                    export FRONTEND_IMAGE=${FRONTEND_IMAGE}

                    docker compose down
                    docker compose up -d

                    echo "等待后端服务就绪..."
                    for i in $(seq 1 30); do
                        if curl -sf http://localhost:3001/api/health > /dev/null 2>&1; then
                            echo "后端服务已就绪"
                            break
                        fi
                        if [ $i -eq 30 ]; then
                            echo "后端服务启动超时"
                            exit 1
                        fi
                        sleep 2
                    done

                    echo "等待前端服务就绪..."
                    for i in $(seq 1 30); do
                        if curl -sf http://localhost:80 > /dev/null 2>&1; then
                            echo "前端服务已就绪"
                            break
                        fi
                        if [ $i -eq 30 ]; then
                            echo "前端服务启动超时"
                            exit 1
                        fi
                        sleep 2
                    done

                    echo "生产环境部署完成"
                '''
            }
        }

        stage('部署信息') {
            when {
                not { branch 'master' }
            }
            steps {
                echo "分支 ${env.GIT_BRANCH_NAME} 非 master 分支，跳过生产部署"
                echo "镜像已构建: ${env.BACKEND_IMAGE}"
                echo "镜像已构建: ${env.FRONTEND_IMAGE}"
                echo "如需部署请合并到 master 分支"
            }
        }

        stage('清理旧镜像') {
            steps {
                sh '''
                    docker images --format '{{.Repository}}:{{.Tag}}' | \
                        grep 'ianportfolio/' | \
                        grep -v latest | \
                        sort -t: -k2 -V | \
                        head -n -10 | \
                        xargs -r docker rmi || true

                    docker builder prune -f --filter "until=48h" || true
                '''
            }
        }
    }

    post {
        success {
            script {
                if (env.GIT_BRANCH_NAME == 'master') {
                    echo "✅ 生产环境部署成功！"
                } else {
                    echo "✅ 分支 ${env.GIT_BRANCH_NAME} 构建验证通过（未部署）"
                }
            }
            echo "后端镜像: ${env.BACKEND_IMAGE}"
            echo "前端镜像: ${env.FRONTEND_IMAGE}"
        }
        failure {
            echo "❌ 构建失败，请检查日志。"
            sh '''
                cd ${DEPLOY_DIR}
                docker compose logs --tail=50 backend 2>/dev/null || true
                docker compose logs --tail=50 frontend 2>/dev/null || true
            '''
        }
        always {
            cleanWs()
        }
    }
}

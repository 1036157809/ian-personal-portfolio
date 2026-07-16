pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {
        stage('检出代码') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.IMAGE_TAG         = "${env.GIT_COMMIT_SHORT}-${env.BUILD_NUMBER}"
                }
            }
        }

        stage('安装依赖') {
            steps { sh 'pnpm install --frozen-lockfile' }
        }

        stage('代码检查') {
            steps { sh 'pnpm -w lint' }
        }

        stage('运行测试') {
            steps { sh 'pnpm -w test' }
        }

        stage('构建应用') {
            steps { sh 'pnpm -w build' }
        }

        stage('构建镜像 + 远程部署') {
            when { branch 'master' }
            steps {
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'ssh-remote-deploy',
                    keyFileVariable: 'SSH_KEY'
                )]) {
                    sh '''
                        chmod +x scripts/deploy-remote.sh
                        SSH_KEY_PATH=$SSH_KEY \
                        REMOTE_HOST=$REMOTE_HOST \
                        REMOTE_USER=$REMOTE_USER \
                        REMOTE_DEPLOY_DIR=$REMOTE_DEPLOY_DIR \
                        IMAGE_TAG=$IMAGE_TAG \
                        VITE_TIANDITU_TOKEN=$VITE_TIANDITU_TOKEN \
                        VITE_API_BASE_URL=$VITE_API_BASE_URL \
                        scripts/deploy-remote.sh
                    '''
                }
            }
        }
    }

    post {
        success { echo "✅ 部署成功 (tag: ${env.IMAGE_TAG})" }
        failure { echo '❌ 构建/部署失败，请检查 Jenkins 日志' }
    }
}

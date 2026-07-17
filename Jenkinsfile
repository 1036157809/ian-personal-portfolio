pipeline {
    agent any

    parameters {
        string(name: 'GIT_BRANCH', defaultValue: 'master', description: '要构建的分支')
        choice(name: 'BUILD_TARGET', choices: ['both', 'frontend', 'backend'], description: '构建目标')
        choice(name: 'DEPLOY_ENV', choices: ['prod', 'staging', 'dev'], description: '部署环境')
    }

    stages {
        stage('SCP 脚本到服务器') {
            steps {
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'ssh-remote-deploy',
                    keyFileVariable: 'SSH_KEY'
                )]) {
                    sh '''
                        SCRIPT_PATH="/Users/zedzhang/Desktop/Zyf/ian-personal-portfolio/scripts/remote-build.sh"
                        scp -o StrictHostKeyChecking=no \
                            -o UserKnownHostsFile=/dev/null \
                            -i "$SSH_KEY" \
                            "$SCRIPT_PATH" \
                            root@106.12.54.57:/root/ian-personal-portfolio/scripts/remote-build.sh
                    '''
                }
            }
        }

        stage('SSH 远程部署') {
            steps {
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'ssh-remote-deploy',
                    keyFileVariable: 'SSH_KEY'
                )]) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no \
                            -o UserKnownHostsFile=/dev/null \
                            -i "$SSH_KEY" \
                            root@106.12.54.57 \
                            "cd /root/ian-personal-portfolio && \
                             chmod +x scripts/remote-build.sh && \
                             GIT_BRANCH=$GIT_BRANCH \
                             BUILD_TARGET=$BUILD_TARGET \
                             DEPLOY_ENV=$DEPLOY_ENV \
                             bash scripts/remote-build.sh"
                    '''
                }
            }
        }
    }

    post {
        success { echo "✅ 部署成功 [${params.BUILD_TARGET}] @ ${params.GIT_BRANCH} → ${params.DEPLOY_ENV}" }
        failure { echo "❌ 构建失败 [${params.BUILD_TARGET}] @ ${params.GIT_BRANCH} → ${params.DEPLOY_ENV}" }
    }
}

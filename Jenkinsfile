pipeline {
    agent any

    parameters {
        string(name: 'GIT_BRANCH', defaultValue: 'master', description: '要构建的分支')
        choice(name: 'BUILD_TARGET', choices: ['both', 'frontend', 'backend'], description: '构建目标')
        choice(name: 'DEPLOY_ENV', choices: ['prod', 'staging', 'dev'], description: '部署环境')
    }

    stages {
        stage('SSH 远程构建部署') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'ssh-remote-deploy',
                        keyFileVariable: 'SSH_KEY'
                    ),
                    string(credentialsId: 'tianditu-token', variable: 'VITE_TIANDITU_TOKEN'),
                    string(credentialsId: 'api-base-url', variable: 'VITE_API_BASE_URL')
                ]) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no \
                            -o UserKnownHostsFile=/dev/null \
                            -o ConnectTimeout=10 \
                            -i "$SSH_KEY" \
                            root@106.12.54.57 \
                            "VITE_TIANDITU_TOKEN=$VITE_TIANDITU_TOKEN VITE_API_BASE_URL=$VITE_API_BASE_URL DEPLOY_ENV=$DEPLOY_ENV bash -s" \
                            < scripts/remote-build.sh "$GIT_BRANCH" "$BUILD_TARGET" "$DEPLOY_ENV"
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

pipeline {
    agent any

    parameters {
        string(name: 'GIT_BRANCH', defaultValue: 'master', description: '要构建的分支')
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
                            "VITE_TIANDITU_TOKEN=$VITE_TIANDITU_TOKEN VITE_API_BASE_URL=$VITE_API_BASE_URL bash -s" \
                            < scripts/remote-build.sh "$GIT_BRANCH"
                    '''
                }
            }
        }
    }

    post {
        success { echo "✅ 部署成功" }
        failure { echo '❌ 构建失败，请检查 Jenkins Console Output' }
    }
}

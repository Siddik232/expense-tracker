pipeline {
    agent any

    environment {
        // Define environment variables if needed
        CI = 'true'
    }

    tools {
        // Assumes you have a NodeJS tool named 'node-20' configured in Jenkins Global Tool Configuration
        // If not, you can remove this block if node is already in the PATH
        nodejs 'node-20' 
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                // npm ci is faster and more reliable for CI environments
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                echo 'Running linting...'
                // utilizing the scripts we added to package.json
                sh 'npm run lint'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                // Using the build context from root (.)
                sh 'docker build -t expense-tracker:${BUILD_NUMBER} .'
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed.'
        }
        success {
            echo 'Build successful!'
        }
        failure {
            echo 'Build failed.'
        }
    }
}

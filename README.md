Expense Tracker
A beautiful, modern, and dynamic personal expense tracker web application.
This project demonstrates best practices in version control (Git/GitHub), CI/CD (GitHub Actions), containerization (Docker), orchestration (Kubernetes), and cloud deployment (GKE on GCP).

🌟 Features
Add, edit, delete and categorize transactions

Beautiful, responsive UI with animated gradient 3D background

Live balance, income, and expense summary

Category-wise statistics and interactive charts

Full version control, containerization, CI/CD, and cloud deployment

🚀 Project Structure
text
.
├── index.html
├── style.css
├── script.js
├── Dockerfile
├── compose.yaml
├── k8s-namespace.yaml
├── k8s-deployment.yaml
├── k8s-service.yaml
└── .github/
    └── workflows/
        └── ci.yaml
📦 Getting Started (Development)
Prerequisites
Node.js (for local http-server, optional)

Docker Desktop

Git

GitHub CLI

kubectl

minikube or GKE/GCP CLI

1. Clone the Repository
bash
git clone https://github.com/<your-username>/expense-tracker.git
cd expense-tracker
2. Launch Locally (Simple HTML)
Open index.html in your browser
Or use a dev server (optional):

bash
npx http-server .
Visit http://localhost:8080

🐋 Docker & Containerization
1. Build Docker Image
bash
docker build -t expense-tracker:latest .
2. Run Locally
bash
docker run -d -p 8080:80 expense-tracker:latest
Open http://localhost:8080

3. Push to Docker Hub
bash
docker login
docker tag expense-tracker:latest <your-dockerhub-username>/expense-tracker:latest
docker push <your-dockerhub-username>/expense-tracker:latest
🕹️ Docker Compose
bash
docker compose up -d
⚙️ GitHub Actions (CI/CD)
Automated build/test workflows on push via .github/workflows/ci.yaml

Add your own test steps as needed; example workflow runs on each push.

☸️ Kubernetes (K8s) Setup
1. Deploy on Minikube
bash
minikube start
kubectl apply -f k8s-namespace.yaml
kubectl apply -f k8s-deployment.yaml
kubectl apply -f k8s-service.yaml
kubectl get services -n expense-prod
2. Port Forward (if no LoadBalancer IP)
bash
kubectl port-forward service/expense-service 8080:80 -n expense-prod
Visit http://localhost:8080

☁️ Google Cloud (GKE)
Build and Push Image to Container Registry

bash
docker build -t gcr.io/<PROJECT-ID>/expense-tracker:v1 .
docker push gcr.io/<PROJECT-ID>/expense-tracker:v1
Create GKE Cluster & Deploy

bash
gcloud container clusters create expense-cluster --num-nodes=2 --zone=us-central1-a
gcloud container clusters get-credentials expense-cluster --zone=us-central1-a
kubectl apply -f k8s-namespace.yaml
kubectl apply -f k8s-deployment.yaml
kubectl apply -f k8s-service.yaml
kubectl get services -n expense-prod
Open the external IP in your browser.

🛠️ Tech Stack
HTML, CSS, JavaScript (Frontend)

Chart.js (Data visualization)

Docker, Docker Compose

Git, GitHub, GitHub Actions (CI)

Kubernetes (minikube, GKE)

🧩 Project Management
Use ZenHub (or Jira) integrated with your GitHub repo for agile task management

GitHub CLI used for issue and PR workflow

🤝 Contributing
Fork this repo

Create a new branch (git checkout -b feature/feature-name)

Commit your changes (git commit -am 'Add a feature')

Push to the branch (git push origin feature/feature-name)

Open a Pull Request

🙋 FAQ/Help
Docker not running:
Start Docker Desktop, and ensure WSL2 is installed on Windows

"No such image":
Run docker build -t expense-tracker:latest . first.

Kubernetes errors:
Make sure your kube context points to the right cluster (minikube or GKE).


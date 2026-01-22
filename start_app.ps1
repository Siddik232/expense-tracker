# Start Docker Compose
Write-Host "Starting Expense Tracker..."
docker compose up -d --build

# Wait for a moment to ensure Nginx is up
Write-Host "Waiting for services to be ready..."
Start-Sleep -Seconds 5

# Open the browser
Write-Host "Opening application at http://localhost:8080"
Start-Process "http://localhost:8080"

# Expense Tracker (Full Stack MERN)

A full-stack expense tracker application built with **MongoDB**, **Express**, **Node.js**, and an Nginx-served Frontend.

## Architecture

-   **Frontend**: Static HTML/CSS/JS served by Nginx.
-   **Backend**: Node.js + Express API.
-   **Database**: MongoDB.
-   **Reverse Proxy**: Nginx routes `/api` requests to the backend and `/` to the frontend.

## Prerequisites

-   [Docker](https://www.docker.com/) & Docker Compose (Essential for running the full stack)
-   [Node.js](https://nodejs.org/) (Use `npm` for local linting/dev)

## Getting Started

### Run with Docker Compose (Recommended)

This is the easiest way to run the full application (Frontend + Backend + Database).

1.  **Build and Start:**
    ```bash
    docker compose up -d --build
    ```

2.  **Access the App:**
    Open [http://localhost:8080](http://localhost:8080) in your browser.

    -   The frontend is served at `/`.
    -   The API is available at `/api`.

3.  **Stop:**
    ```bash
    docker compose down
    ```

### Quick Start (Windows)

To start the application and automatically open the browser:

```powershell
.\start_app.ps1
```

### Local Development (Manual)

If you want to run services individually without Docker (not recommended for DB/Backend connection unless configured):

1.  **Install Dependencies:**
    ```bash
    npm install         # Root (Frontend tools)
    cd backend && npm install  # Backend dependencies
    ```

2.  **Linting:**
    ```bash
    npm run lint
    ```

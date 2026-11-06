# GYMMAN --- Smart Gym & Fitness Tracking Platform

GYMMAN is a web-based fitness management platform designed to help
people organize workouts and keep track of key fitness information in
one place. It brings together workout management, an exercise library,
fitness calculations, diet-related tools, and user-specific records in a
single application.

**Live website:** https://gymman.in\
**Backend API:** https://gymman.onrender.com\
**Repository:** https://github.com/bilallukman/GYMMAN

## Table of contents

-   [Overview](#overview)
-   [Core features](#core-features)
-   [Technology stack](#technology-stack)
-   [Architecture](#architecture)
-   [Repository structure](#repository-structure)
-   [Local setup](#local-setup)
-   [Environment configuration](#environment-configuration)
-   [Deployment overview](#deployment-overview)
-   [Security notes](#security-notes)
-   [Future improvements](#future-improvements)

## Overview

Managing a fitness routine can involve several separate tools: one for
workouts, another for body measurements, and others for nutrition or
progress notes. GYMMAN aims to make that process more organized by
providing a single web application for common fitness-management
activities.

The application uses a browser-based frontend, a Node.js and Express
backend, and a MySQL database. Users can create and access an account
and use the available fitness features while their account-related
records are handled by the backend.

## Core features

-   **User accounts and authentication** --- registration, login, email
    verification, password recovery, and authenticated access.
-   **User profile** --- user-specific profile information and
    account-related functionality.
-   **Workout management** --- workout-related records and activity
    management.
-   **Exercise library** --- access to the application's
    exercise/library functionality.
-   **Favorites** --- save and manage favorite items where supported by
    the application.
-   **BMI tools** --- calculate and manage BMI-related records.
-   **Calorie tools** --- calorie-related calculations and records.
-   **Diet management** --- diet-related information and records.

> Feature availability and the exact actions available to a user depend
> on the current application implementation and account state.

## Technology stack

  Layer              Technology
  ------------------ -------------------------------
  Frontend           HTML5, CSS3, JavaScript
  Backend            Node.js, Express.js
  Database           MySQL
  API style          HTTP/REST-style API endpoints
  Frontend hosting   SiteGround
  Backend hosting    Render
  Source control     Git and GitHub

## Architecture

1.  **Frontend:** HTML, CSS, and JavaScript provide the pages, styling,
    and browser interactions.
2.  **Backend:** Node.js and Express handle API requests,
    authentication, application logic, and communication with the
    database.
3.  **Database:** MySQL stores account and application records.

The frontend communicates with the backend through API requests. The
backend validates requests and applies the relevant application logic
before reading or writing data in MySQL.

``` text
User's browser
      |
      v
Frontend (HTML, CSS, JavaScript)
      |
      | HTTP API requests
      v
Backend (Node.js + Express)
      |
      | Database queries
      v
MySQL database
```

## Repository structure

``` text
GYMMAN/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── css/
├── images/
├── js/
├── pages/
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

The exact files may evolve as the project is updated. The backend
folders separate configuration, database access, request controllers,
middleware, routes, and utility functions.

## Local setup

### Prerequisites

-   [Node.js](https://nodejs.org/) (use a version supported by the
    project's dependencies)
-   npm (included with Node.js)
-   Access to a MySQL database
-   Git

### 1. Clone the repository

``` bash
git clone https://github.com/bilallukman/GYMMAN.git
cd GYMMAN
```

### 2. Install backend dependencies

If the backend has its own `package.json`:

``` bash
cd backend
npm install
```

If dependency management is configured only at the repository root, run
`npm install` from the directory containing that `package.json` instead.

### 3. Configure environment variables

Create a local `.env` file in the backend directory if that is where the
server loads its environment configuration. Use the variable names
expected by the current backend configuration and database connection
code.

Example template --- **placeholders only, not real credentials**:

``` env
# Application
PORT=3000
APP_URL=http://127.0.0.1:5500
FRONTEND_ORIGIN=http://127.0.0.1:5500

# MySQL — illustrative names; check backend/config for exact names
DB_HOST=YOUR_DATABASE_HOST
DB_PORT=3306
DB_NAME=YOUR_DATABASE_NAME
DB_USER=YOUR_DATABASE_USERNAME
DB_PASSWORD=YOUR_DATABASE_PASSWORD

# Email provider — required for email verification/password recovery
RESEND_API_KEY=YOUR_RESEND_API_KEY
```

**Important:** The database variable names above are illustrative
placeholders. Before running the backend, check the existing database
configuration file and use its exact expected environment-variable
names. Do not rename working variables just to match this example.

### 4. Configure the frontend API URL

The frontend JavaScript files that call the backend must point to your
local backend during local development. For example, the authentication
module may use:

``` javascript
const API = "http://localhost:3000/api/auth";
```

Use the appropriate API base URL for each frontend module. Do not leave
production and local API URLs mixed unintentionally.

### 5. Start the backend

From the backend directory, use the start command defined in its
`package.json`. If the project is configured to start directly through
`server.js`, run:

``` bash
node server.js
```

The backend should report that it is listening on the configured port.

### 6. Serve the frontend

Serve the frontend directory using a local development server. For
example, with the VS Code Live Server extension, open the project and
choose **Open with Live Server**.

The local frontend origin must match the `APP_URL` and `FRONTEND_ORIGIN`
values used by the backend where those settings apply.

### 7. Verify the application

-   Open the local frontend URL in a browser.
-   Confirm that the backend is running.
-   Test registration, login, and authenticated pages.
-   Test email verification and password recovery only after configuring
    a valid email provider key and reachable frontend URL.
-   Confirm that the backend can connect to the configured MySQL
    database.

## Environment configuration

GYMMAN uses environment-based configuration for deployment-specific
values such as database access, application URLs, and email-provider
credentials.

Keep separate configuration values for local development and production:

-   **Local:** local frontend URL and local backend process; use the
    intended development database configuration.
-   **Production:** `https://gymman.in` for the frontend and
    `https://gymman.onrender.com` for the backend API, with production
    database and email-provider settings configured in the hosting
    provider's environment settings.

Never commit `.env` files or real credentials to GitHub. Keep `.env`
entries in `.gitignore`, and use the hosting provider's
environment-variable settings for production secrets.

## Deployment overview

The current deployment is split across services:

-   **Frontend:** hosted on SiteGround.
-   **Backend:** deployed on Render.
-   **Database:** MySQL hosted through SiteGround.
-   **Repository:** source code managed in GitHub.

A typical update workflow is:

1.  Make and test changes locally.
2.  Review the changed files and ensure secrets or local files are not
    included.
3.  Commit and push the intended source changes to GitHub.
4.  Allow the backend deployment on Render to complete when backend
    files change.
5.  Upload the relevant frontend files to SiteGround when frontend files
    change.
6.  Test the live website and the affected API functionality.

Deployment steps can vary depending on which files were changed.

## Security notes

-   Do not commit `.env` files, database passwords, API keys, access
    tokens, or other secrets.
-   Keep production secrets in Render's environment settings or the
    relevant hosting provider's secure configuration.
-   Use HTTPS for production traffic.
-   Keep authentication and authorization checks on the backend; hiding
    a frontend control is not a security boundary.
-   Do not publish database exports, private user records, session
    tokens, or test credentials.
-   Rotate any credential that may have been exposed.

## Future improvements

Potential areas for future development include:

-   A Progressive Web App (PWA) installation experience.
-   A more streamlined mobile workout-logging interface.
-   Expanded workout analytics and progress visualizations.
-   Additional routine-planning and personalization capabilities.
-   More comprehensive automated tests and deployment checks.

These are future enhancement ideas and should not be considered
implemented features unless they are added and verified in the
application.

------------------------------------------------------------------------

## Project

**GYMMAN --- Smart Gym & Fitness Tracking Platform**

Built as a web application to make everyday fitness management more
organized and accessible.

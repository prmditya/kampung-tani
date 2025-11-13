<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->

<a id="readme-top"></a>

<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/prmditya/kampung-tani">
    <img src="frontend/public/assets/kt-logo.webp" alt="Logo" height="80">
  </a>

<h3 align="center">Kampung Tani IoT Monitoring Dashboard</h3>

  <p align="center">
    A comprehensive IoT monitoring dashboard for agricultural sensor data management and gateway monitoring, built with modern web technologies and real-time MQTT integration.
    <br />
    <a href="https://github.com/prmditya/kampung-tani"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/prmditya/kampung-tani">View Demo</a>
    ·
    <a href="https://github.com/prmditya/kampung-tani/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/prmditya/kampung-tani/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
        <li><a href="#features">Features</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a>
          <ul>
            <li><a href="#option-1-docker-setup-recommended">Option 1: Docker Setup</a></li>
            <li><a href="#option-2-local-development-setup">Option 2: Local Development Setup</a></li>
          </ul>
        </li>
        <li><a href="#environment-setup">Environment Setup</a>
          <ul>
            <li><a href="#mqtt-broker-configuration">MQTT Broker Configuration</a></li>
            <li><a href="#troubleshooting-mqtt-connection">Troubleshooting MQTT Connection</a></li>
          </ul>
        </li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a>
      <ul>
        <li><a href="#starting-the-application">Starting the Application</a></li>
        <li><a href="#accessing-the-dashboard">Accessing the Dashboard</a></li>
        <li><a href="#testing-mqtt-integration">Testing MQTT Integration</a></li>
      </ul>
    </li>
    <li><a href="#architecture">Architecture</a></li>
    <li><a href="#api-documentation">API Documentation</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

[![Kampung Tani Dashboard Screenshot Dark Mode][product-screenshot-dark]](https://github.com/prmditya/kampung-tani)
[![Kampung Tani Dashboard Screenshot Light Mode][product-screenshot-light]](https://github.com/prmditya/kampung-tani)

Kampung Tani IoT Monitoring Dashboard is a comprehensive agricultural monitoring system that enables real-time tracking and management of IoT sensors in farming environments. The platform provides farmers and agricultural professionals with intuitive tools to monitor soil conditions, environmental parameters, and gateway status through a modern web interface.

### Key Capabilities:

- **Real-time IoT Data Monitoring**: Live sensor data from agricultural IoT gateways (SEM225, NPK sensors, weather stations)
- **Gateway Management**: Automatic gateway registration, status monitoring, and maintenance tracking
- **Farmer & Farm Management**: Complete management system for farmers and their farm assignments
- **Data Visualization**: Interactive charts and dashboards for sensor data analysis
- **MQTT Integration**: Real-time data streaming from IoT gateways via MQTT protocol
- **User Authentication**: Secure access control with JWT-based authentication
- **RESTful API**: Comprehensive API for data access and gateway management

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

#### Frontend Technologies

- [![Next.js][Next.js]][Next-url] - React framework for production (v15.5)
- [![React][React.js]][React-url] - UI library for building user interfaces (v19.1)
- [![TypeScript][TypeScript]][TypeScript-url] - Type-safe JavaScript development
- [![Tailwind CSS][TailwindCSS]][TailwindCSS-url] - Utility-first CSS framework (v4)
- [![Lucide React][Lucide]][Lucide-url] - Beautiful & consistent icon library
- [![TanStack Query][TanStack]][TanStack-url] - Data fetching & caching (v5.90)
- [![axios][Axios]][Axios-url] - Promise based HTTP client (v1.12)
- [![shadcn/ui][shadcn]][shadcn-url] - Unstyled UI components and primitives
- [![recharts][Recharts]][Recharts-url] - Composable charting library for data visualization
- [![zod][Zod]][zod-url] - TypeScript-first schema validation (v4.1)

#### Backend & Ingestion Technologies

- [![FastAPI][FastAPI]][FastAPI-url] - Modern, fast web framework for building APIs
- [![Python][Python]][Python-url] - Backend programming language
- [![PostgreSQL][PostgreSQL]][PostgreSQL-url] - Advanced open source database
- [![Pydantic][Pydantic]][Pydantic-url] - Data validation using Python type hints
- [![Paho MQTT][MQTT]][MQTT-url] - MQTT client library for IoT communication

#### Infrastructure & DevOps

- [![Docker][Docker]][Docker-url] - Containerization platform
- [![Docker Compose][DockerCompose]][DockerCompose-url] - Multi-container Docker applications

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Features

#### 🌱 **Agricultural IoT Monitoring**

- Real-time soil sensor data (Temperature, Moisture, pH, NPK levels)
- Environmental monitoring (Humidity, TDS, Salinity, Conductivity)
- Automatic sensor data scaling and unit conversion
- Gateway status tracking and health monitoring

#### 📊 **Dashboard & Analytics**

- Interactive sensor data visualization with recharts
- Historical data analysis and trends
- Gateway management and monitoring panels
- Real-time status indicators and aggregated dashboard data
- Advanced data tables with sorting, filtering, and pagination

#### 🔧 **Gateway Management**

- Automatic gateway registration via MQTT
- Gateway status history tracking
- Online/offline status monitoring
- Gateway maintenance scheduling
- Gateway assignment to farms and farmers

#### 👨‍🌾 **Farmer & Farm Management**

- Complete farmer profile management (CRUD operations)
- Farm registration and management
- Farm-to-farmer assignment tracking
- Gateway assignment to specific farms
- Farmer location and contact information management

#### 📋 **Assignment System**

- Assign gateways to specific farms
- Track assignment history
- Monitor gateway deployment status
- Manage multiple gateways per farm

#### 🔐 **Security & Authentication**

- JWT-based authentication system
- Role-based access control (Admin/User)
- Secure API endpoints
- Environment-based configuration management

#### 🚀 **Modern Architecture**

- Microservices architecture with Docker
- RESTful API design
- Real-time MQTT data streaming
- Responsive web design
- Type-safe development with TypeScript

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have the following software installed on your system:

- **Docker & Docker Compose** (for Docker setup)

  ```sh
  # Install Docker Desktop (includes Docker Compose)
  # Windows/Mac: Download from https://www.docker.com/products/docker-desktop
  # Linux: Follow installation guide for your distribution
  ```

- **Git**

  ```sh
  git --version
  ```

- **Mosquitto MQTT Broker** (required for IoT data ingestion)

  **Windows:**
  ```powershell
  # Download installer from https://mosquitto.org/download/
  # Or install via Chocolatey
  choco install mosquitto
  ```

  **Linux:**
  ```bash
  sudo apt-get update
  sudo apt-get install mosquitto mosquitto-clients
  ```

  **Mac:**
  ```bash
  brew install mosquitto
  ```

- **Node.js & pnpm** (for local frontend development)
  ```sh
  node --version  # v20.x or higher
  npm install -g pnpm
  ```

- **Python 3.11+** (for local backend/ingestion development)
  ```sh
  python --version
  ```

### Installation

There are two ways to run this application: using Docker (recommended) or running services locally.

#### Option 1: Docker Setup (Recommended)

1. **Clone the repository**

   ```sh
   git clone https://github.com/prmditya/kampung-tani.git
   cd kampung-tani
   ```

2. **Setup Mosquitto MQTT Broker**

   Start your local Mosquitto MQTT broker:

   **Windows:**
   ```powershell
   # Start Mosquitto as a service
   net start mosquitto

   # Or run manually
   mosquitto -v
   ```

   **Linux:**
   ```bash
   # Start Mosquitto service
   sudo systemctl start mosquitto
   sudo systemctl enable mosquitto  # Enable on boot

   # Check status
   sudo systemctl status mosquitto
   ```

   **Mac:**
   ```bash
   # Start Mosquitto
   brew services start mosquitto

   # Or run manually
   mosquitto -v
   ```

   **Verify MQTT Broker:**
   ```sh
   # Test connection (in a new terminal)
   mosquitto_sub -h localhost -t test/topic -v
   ```

3. **Environment Setup**
   Copy the example environment files and configure them:

   ```sh
   # Copy global environment file
   cp .env.example .env

   # Copy backend-specific environment file
   cp backend/.env.local.example backend/.env.local

   # Copy ingestion service environment file
   cp ingestion/.env.local.example ingestion/.env.local

   # Copy frontend-specific environment file (optional - currently empty)
   cp frontend/.env.local.example frontend/.env.local
   ```

4. **Configure Environment Variables**
   Edit the `.env`, `backend/.env.local`, and `ingestion/.env.local` files with your specific configuration:

   **Global (.env)**:
   ```env
   POSTGRES_USER=admin
   POSTGRES_PASSWORD=admin123
   POSTGRES_DB=kampoeng_tani_test
   JWT_SECRET_KEY=your-secret-key-min-32-chars
   MQTT_BROKER=localhost  # or your MQTT broker IP
   MQTT_PORT=1883
   ```

   **Backend (.env.local)**:
   ```env
   DATABASE_URL=postgresql://admin:admin123@db:5432/kampoeng_tani_test
   JWT_SECRET_KEY=your-secret-key-min-32-chars
   ALLOWED_ORIGINS=http://localhost:3001
   ```

   **Ingestion (.env.local)**:
   ```env
   DATABASE_URL=postgresql://admin:admin123@db:5432/kampoeng_tani_test
   MQTT_BROKER=host.docker.internal  # Use host.docker.internal to access host machine's MQTT broker
   MQTT_PORT=1883
   MQTT_TOPIC_PATTERN=kampoengtani/+/+/data
   ```

   **⚠️ Important**:
   - Never commit `.env` or `.env.local` files to version control
   - Use `host.docker.internal` as MQTT_BROKER in Docker to connect to your host machine's MQTT broker
   - If MQTT broker is on another machine, use its IP address

5. **Build and Start the Application**

   ```sh
   # Build and start all services
   docker-compose up --build

   # Or run in detached mode
   docker-compose up --build -d
   ```

6. **Verify Installation**
   After the containers are running, verify the services:
   - **Frontend**: http://localhost:3001
   - **Backend API**: http://localhost:5000
   - **API Documentation**: http://localhost:5000/api/v1/docs
   - **Database**: localhost:5433 (mapped from container's 5432)
   - **Ingestion Service**: Check logs with `docker logs kampungtani_ingestion`

#### Option 2: Local Development Setup

For local development without Docker:

1. **Clone the repository**

   ```sh
   git clone https://github.com/prmditya/kampung-tani.git
   cd kampung-tani
   ```

2. **Setup Mosquitto MQTT Broker** (same as Docker setup above)

3. **Setup PostgreSQL Database**

   Install PostgreSQL and create a database:
   ```sql
   CREATE DATABASE kampoeng_tani_test;
   CREATE USER admin WITH PASSWORD 'admin123';
   GRANT ALL PRIVILEGES ON DATABASE kampoeng_tani_test TO admin;
   ```

   Run the schema:
   ```sh
   psql -U admin -d kampoeng_tani_test -f db/schema.sql
   ```

4. **Environment Setup**

   Copy environment files:
   ```sh
   cp .env.example .env
   cp backend/.env.local.example backend/.env.local
   cp ingestion/.env.local.example ingestion/.env.local
   cp frontend/.env.local.example frontend/.env.local
   ```

   **Backend (.env.local)**:
   ```env
   DATABASE_URL=postgresql://admin:admin123@localhost:5432/kampoeng_tani_test
   JWT_SECRET_KEY=your-secret-key-min-32-chars
   ALLOWED_ORIGINS=http://localhost:3000
   ```

   **Ingestion (.env.local)**:
   ```env
   DATABASE_URL=postgresql://admin:admin123@localhost:5432/kampoeng_tani_test
   MQTT_BROKER=localhost
   MQTT_PORT=1883
   MQTT_TOPIC_PATTERN=kampoengtani/+/+/data
   ```

   **Frontend (.env.local)**:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   ```

5. **Start Backend Service**

   ```sh
   cd backend
   python -m venv venv

   # Windows
   venv\Scripts\activate

   # Linux/Mac
   source venv/bin/activate

   pip install -r requirements.txt
   python main.py
   ```

   Backend will run on http://localhost:5000

6. **Start Ingestion Service**

   In a new terminal:
   ```sh
   cd ingestion
   python -m venv venv

   # Windows
   venv\Scripts\activate

   # Linux/Mac
   source venv/bin/activate

   pip install -r requirements.txt
   python -m app.main
   ```

7. **Start Frontend Service**

   In a new terminal:
   ```sh
   cd frontend

   # Install pnpm if not already installed
   npm install -g pnpm

   # Install dependencies
   pnpm install

   # Start development server
   pnpm dev
   ```

   Frontend will run on http://localhost:3000

8. **Verify Installation**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000
   - **API Documentation**: http://localhost:5000/api/v1/docs
   - **Database**: localhost:5432

### Environment Setup

#### Configuration Requirements

The application requires environment configuration for:

- **Database Settings**: PostgreSQL connection parameters
- **Backend API**: FastAPI server configuration, JWT authentication
- **Ingestion Service**: MQTT broker connection, topic patterns, database connection
- **Frontend App**: Next.js application settings and API endpoints (optional)
- **Authentication**: JWT secret keys and token expiration
- **CORS Settings**: Allowed origins for development
- **MQTT Broker**: Connection details and credentials for IoT gateway communication

#### MQTT Broker Configuration

The ingestion service requires a running MQTT broker to receive data from IoT gateways.

**For Docker Setup:**
- The MQTT broker runs on your host machine (laptop/desktop)
- Use `host.docker.internal` as the MQTT_BROKER value in `ingestion/.env.local`
- This special DNS name allows Docker containers to connect to services on the host

**For Local Setup:**
- Use `localhost` or `127.0.0.1` as the MQTT_BROKER value
- Both the ingestion service and MQTT broker run on the same machine

**For External MQTT Broker:**
- If your MQTT broker is on another machine, use its IP address
- Ensure firewall allows connections on port 1883 (default MQTT port)
- Configure MQTT_USERNAME and MQTT_PASSWORD if authentication is enabled

#### Troubleshooting MQTT Connection

If the ingestion service cannot connect to MQTT broker:

1. **Verify MQTT broker is running:**
   ```sh
   # Windows
   netstat -an | findstr :1883

   # Linux/Mac
   netstat -an | grep 1883
   ```

2. **Test MQTT connection:**
   ```sh
   # Subscribe to test topic
   mosquitto_sub -h localhost -t test/topic -v

   # In another terminal, publish a message
   mosquitto_pub -h localhost -t test/topic -m "Hello MQTT"
   ```

3. **Check Docker container can reach host:**
   ```sh
   # From inside a container
   docker exec kampungtani_ingestion ping host.docker.internal
   ```

4. **Check ingestion service logs:**
   ```sh
   docker logs -f kampungtani_ingestion
   ```

#### Security Notes

- Create strong, unique passwords and secret keys
- Use different credentials for development and production
- Never commit `.env` or `.env.local` files to version control
- Refer to example files for required variables
- Use environment-specific configurations
- Secure your MQTT broker with authentication in production

#### Example Environment Files

The project includes example environment files:

- `.env.example` - Global application and infrastructure settings (database, ports, MQTT)
- `backend/.env.local.example` - Backend-specific configuration (API, JWT, CORS)
- `ingestion/.env.local.example` - Ingestion service configuration (MQTT, database, topics)
- `frontend/.env.local.example` - Frontend-specific configuration (currently empty)

Copy these files to their respective `.env.local` names and configure them according to your environment.

**Note**: The ingestion service is now included in `docker-compose.yml` and will start automatically with other services.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

### Starting the Application

**With Docker:**
```sh
# Start all services
docker-compose up

# Start in detached mode (background)
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f ingestion

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build

# Rebuild specific service
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

**Local Development:**
```sh
# Start each service in separate terminals

# Terminal 1 - Backend
cd backend && source venv/bin/activate && python main.py

# Terminal 2 - Ingestion
cd ingestion && source venv/bin/activate && python -m app.main

# Terminal 3 - Frontend
cd frontend && pnpm dev
```

### Accessing the Dashboard

**Docker Setup:**
1. **Open the web application**: Navigate to http://localhost:3001
2. **Login with default credentials** (change in production):
   - Username: `admin`
   - Password: `admin123`
3. **Explore the dashboard**: View real-time sensor data, gateway status, farmers, and farm management

**Local Setup:**
1. **Open the web application**: Navigate to http://localhost:3000
2. **Login with default credentials** (same as above)

**⚠️ Security Note**: Change default credentials immediately in production environments.

### Testing MQTT Integration

To test if your MQTT broker and ingestion service are working:

1. **Verify MQTT Broker is running:**
   ```sh
   # Check if port 1883 is listening
   netstat -an | grep 1883  # Linux/Mac
   netstat -an | findstr :1883  # Windows
   ```

2. **Subscribe to test topic:**
   ```sh
   mosquitto_sub -h localhost -t kampoengtani/+/+/data -v
   ```

3. **Publish test sensor data:**
   ```sh
   mosquitto_pub -h localhost -t kampoengtani/GW001/farm1/data -m '{
     "d": [
       {"tag": "SEM225:Temperature", "value": 250},
       {"tag": "SEM225:Moisture", "value": 350},
       {"tag": "SEM225:PH", "value": 65},
       {"tag": "SEM225:Nitrogen", "value": 120},
       {"tag": "SEM225:Phosphorus", "value": 45},
       {"tag": "SEM225:Potassium", "value": 180}
     ],
     "ts": "2025-01-13T10:30:00Z"
   }'
   ```

4. **Check ingestion service logs:**
   ```sh
   docker logs -f kampungtani_ingestion  # For Docker
   # Or check terminal output for local setup
   ```

5. **Verify data in dashboard:**
   - Login to dashboard at http://localhost:3001 (Docker) or http://localhost:3000 (Local)
   - Navigate to Data page
   - Check if sensor data appears for gateway GW001

### API Usage

The backend provides a comprehensive RESTful API. Access the interactive documentation at:

- **Swagger UI**: http://localhost:5000/api/v1/docs
- **ReDoc**: http://localhost:5000/api/v1/redoc

#### Example API Requests

```sh
# Get all gateways
curl -X GET "http://localhost:5000/api/v1/gateways" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get all farmers
curl -X GET "http://localhost:5000/api/v1/farmers" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get sensor data for a gateway
curl -X GET "http://localhost:5000/api/v1/sensors/gateway/1?limit=100" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get dashboard summary
curl -X GET "http://localhost:5000/api/v1/dashboard" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Health check (no auth required)
curl -X GET "http://localhost:5000/api/v1/health"
```

### MQTT Integration

The **Ingestion Service** (separate from the backend API) automatically subscribes to MQTT topics and processes incoming sensor data from IoT gateways. The ingestion service runs as a background worker and writes data directly to the database.

#### Default MQTT Topic Pattern

- `kampoengtani/+/+/data` - Default topic pattern (configurable in `ingestion/.env.local`)
- First wildcard (+): Gateway identifier
- Second wildcard (+): Sensor type or farm identifier
- `/data`: Message payload endpoint

#### Supported Legacy Topic Patterns

The ingestion service may also support:
- `sensor/sem225/data` - SEM225 soil sensor data
- `sensors/+/data` - Generic sensor data format
- `sensor/+/data` - Legacy sensor data format

(Check `ingestion/app/handlers/message_handler.py` for specific topic subscriptions)

#### Example MQTT Message Format

```json
{
  "d": [
    { "tag": "SEM225:Temperature", "value": 250 },
    { "tag": "SEM225:Moisture", "value": 350 },
    { "tag": "SEM225:PH", "value": 65 },
    { "tag": "SEM225:Nitrogen", "value": 120 },
    { "tag": "SEM225:Phosphorus", "value": 45 },
    { "tag": "SEM225:Potassium", "value": 180 }
  ],
  "ts": "2025-01-07T10:30:00Z"
}
```

**Architecture Note**: The ingestion service is completely separate from the backend API. The backend API provides REST endpoints for querying data, while the ingestion service handles real-time data ingestion from MQTT.

_For more examples and detailed API documentation, please refer to the [API Documentation](http://localhost:5000/api/v1/docs)_

## Ingestion Service

The repository includes a separate ingestion service that listens to an MQTT broker and parses incoming sensor messages into the database. This service is **not the HTTP API** — it runs as a background worker and connects to MQTT topics.

### Key Information

- **Service path**: `ingestion/`
- **Entrypoint**: `ingestion/app/main.py` (Dockerfile runs `python -m app.main`)
- **Configuration**: `ingestion/app/core/config.py` (reads `ingestion/.env.local`)
- **Default MQTT topic pattern**: `kampoengtani/+/+/data` (see `MQTT_TOPIC` in config)
- **No HTTP interface**: The ingestion service does not expose Swagger/OpenAPI docs; it's purely an MQTT consumer

### Running with Docker Compose (Recommended)

The ingestion service is **included in docker-compose.yml** and starts automatically with other services:

```sh
# Start all services including ingestion
docker-compose up --build

# View ingestion service logs
docker logs -f kampungtani_ingestion

# Check ingestion service status
docker ps | grep kampungtani_ingestion
```

### Running Locally for Development

If you need to run the ingestion service locally for development:

**PowerShell (Windows):**
```powershell
cd ingestion
# Copy example env (only once) and edit values
copy .env.local.example .env.local
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m app.main
```

**Bash (Linux/Mac):**
```bash
cd ingestion
# Copy example env (only once) and edit values
cp .env.local.example .env.local
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m app.main
```

### Configuration

Edit `ingestion/.env.local` to configure:
- **DATABASE_URL**: PostgreSQL connection string
- **MQTT_BROKER**: MQTT broker hostname/IP
- **MQTT_PORT**: MQTT broker port (default: 1883)
- **MQTT_USERNAME** and **MQTT_PASSWORD**: MQTT credentials
- **MQTT_TOPIC**: Topic pattern to subscribe to (default: `kampoengtani/+/+/data`)
- **LOG_LEVEL**: Logging level (INFO, DEBUG, WARNING, ERROR)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 5432    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └────────▲────────┘
                                                        │
                                                        │
                                              ┌─────────┴────────┐
                                              │   Ingestion      │
                                              │   Service        │
                                              │   (Python)       │
                                              └────────▲─────────┘
                                                       │
                                                       │ subscribes
                                                       │
                                              ┌────────┴─────────┐
                                              │   MQTT Broker    │
                                              │   (External)     │
                                              └────────▲─────────┘
                                                       │
                                                       │ publishes
                                                       │
                                              ┌────────┴─────────┐
                                              │  IoT Gateways    │
                                              │  (SEM225, etc)   │
                                              └──────────────────┘
```

**Architecture Overview:**
- **Frontend**: Next.js application for user interface and data visualization
- **Backend API**: FastAPI REST API for data access, user management, and business logic
- **Ingestion Service**: Separate Python service that subscribes to MQTT topics and processes incoming sensor data
- **Database**: PostgreSQL for persistent data storage
- **MQTT Broker**: External message broker for IoT gateway communication
- **IoT Gateways**: Physical devices that collect and transmit sensor data

### Frontend Architecture

```
frontend/src/
├── app/                          # Next.js App Router pages
│   ├── (auth)/
│   │   └── login/               # Login page
│   └── (dashboard)/
│       └── dashboard/           # Protected dashboard routes
│           ├── assignments/     # Gateway assignment management
│           ├── data/           # Sensor data viewer
│           ├── devices/        # Gateway device management
│           ├── farmers/        # Farmer management
│           └── settings/       # Application settings
├── components/
│   └── ui/                      # shadcn/ui components
├── features/                    # Feature-specific modules
│   ├── assignments/            # Assignment feature logic
│   ├── auth/                   # Authentication logic
│   ├── dashboard/              # Dashboard aggregation
│   ├── data/                   # Data management
│   ├── devices/                # Gateway management
│   ├── farmers/                # Farmer management
│   └── settings/               # Settings management
├── hooks/                       # Custom React hooks
├── lib/                         # Utilities & constants
└── types/                       # TypeScript type definitions
```

### Backend Architecture

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── repositories/      # Data access layer (Repository Pattern)
│   │       │   ├── user_repository.py
│   │       │   ├── farmer_repository.py
│   │       │   ├── gateway_repository.py
│   │       │   └── sensor_repository.py
│   │       ├── routers/          # API route handlers (51 endpoints)
│   │       │   ├── auth.py       # Authentication & authorization
│   │       │   ├── dashboard.py  # Dashboard aggregation API
│   │       │   ├── farmers.py    # Farmer CRUD operations
│   │       │   ├── farms.py      # Farm management
│   │       │   ├── gateways.py   # Gateway management (devices)
│   │       │   ├── gateway_assignments.py  # Gateway-to-farm assignments
│   │       │   ├── gateway_status_history.py  # Status tracking
│   │       │   ├── health.py     # Health check endpoints
│   │       │   ├── sensors.py    # Sensor data endpoints
│   │       │   └── users.py      # User management
│   │       └── schemas/          # Pydantic schemas for validation
│   │           ├── user_schema.py
│   │           ├── farmer_schema.py
│   │           ├── gateway_schema.py
│   │           └── sensor_schema.py
│   ├── core/                     # Core functionality
│   │   ├── config.py            # Configuration management
│   │   ├── database.py          # Database connection & session
│   │   └── security.py          # JWT authentication & security
│   └── models/                   # SQLAlchemy database models
│       ├── user.py
│       ├── farmer.py
│       ├── farm.py
│       ├── gateway.py
│       ├── gateway_assignment.py
│       ├── gateway_status_history.py
│       ├── sensor.py
│       └── sensor_data.py
└── main.py                       # FastAPI application entry
```

### Ingestion Service Architecture

```
ingestion/
├── app/
│   ├── core/
│   │   ├── config.py            # Configuration from environment
│   │   ├── database.py          # Database connection
│   │   └── mqtt_client.py       # MQTT client setup
│   ├── handlers/
│   │   └── message_handler.py   # MQTT message processing
│   ├── models/                   # SQLAlchemy models
│   ├── parsers/
│   │   └── sensor_data_parser.py  # Parse sensor data formats
│   ├── services/                 # Business logic
│   └── main.py                  # Application entry point
├── Dockerfile
└── requirements.txt
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### API Documentation

The backend provides a comprehensive RESTful API with 51 endpoints across 10 routers. Full interactive documentation is available at:
- **Swagger UI**: http://localhost:5000/api/v1/docs
- **ReDoc**: http://localhost:5000/api/v1/redoc

#### Key API Endpoints

### Authentication

**Login**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@kampungtani.com",
    "role": "admin"
  }
}
```

### Gateways (IoT Devices)

**Get All Gateways**
```http
GET /api/v1/gateways
Authorization: Bearer YOUR_JWT_TOKEN
```

**Get Gateway by ID**
```http
GET /api/v1/gateways/{gateway_id}
Authorization: Bearer YOUR_JWT_TOKEN
```

**Create New Gateway**
```http
POST /api/v1/gateways
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "gateway_id": "GW001",
  "name": "Gateway 1",
  "location": "Field A",
  "status": "online"
}
```

**Get Gateway Sensor Data**
```http
GET /api/v1/sensors/gateway/{gateway_id}?limit=100&hours=24
Authorization: Bearer YOUR_JWT_TOKEN
```

### Farmers

**Get All Farmers**
```http
GET /api/v1/farmers
Authorization: Bearer YOUR_JWT_TOKEN
```

**Create Farmer**
```http
POST /api/v1/farmers
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Farm Road"
}
```

**Update Farmer**
```http
PUT /api/v1/farmers/{farmer_id}
Authorization: Bearer YOUR_JWT_TOKEN
```

**Delete Farmer**
```http
DELETE /api/v1/farmers/{farmer_id}
Authorization: Bearer YOUR_JWT_TOKEN
```

### Farms

**Get All Farms**
```http
GET /api/v1/farms
Authorization: Bearer YOUR_JWT_TOKEN
```

**Create Farm**
```http
POST /api/v1/farms
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Green Valley Farm",
  "location": "North Region",
  "farmer_id": 1
}
```

### Gateway Assignments

**Get All Assignments**
```http
GET /api/v1/gateway-assignments
Authorization: Bearer YOUR_JWT_TOKEN
```

**Assign Gateway to Farm**
```http
POST /api/v1/gateway-assignments
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "gateway_id": 1,
  "farm_id": 1,
  "assigned_date": "2025-01-07"
}
```

**Get Assignments by Farm**
```http
GET /api/v1/gateway-assignments/farm/{farm_id}
Authorization: Bearer YOUR_JWT_TOKEN
```

### Dashboard

**Get Dashboard Summary**
```http
GET /api/v1/dashboard
Authorization: Bearer YOUR_JWT_TOKEN
```

Returns aggregated data including:
- Total gateways (online/offline counts)
- Total farmers
- Total farms
- Recent sensor data
- Gateway status distribution

### Health Check

**System Health**
```http
GET /api/v1/health
```

```json
{
  "status": "healthy",
  "timestamp": "2025-01-07T10:30:00Z",
  "database": "connected"
}
```

**Ping Endpoint**
```http
GET /api/v1/ping
```

For complete API documentation with all 51 endpoints, request/response schemas, and authentication details, visit the Swagger UI at http://localhost:5000/api/v1/docs when the backend is running.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

### Contributing Guidelines

1. **Fork the Project**
2. **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Follow the existing code style** and architecture patterns
4. **Add tests** for new functionality
5. **Update documentation** as needed
6. **Commit your Changes** using [Conventional Commits](https://www.conventionalcommits.org/)
   ```sh
   git commit -m 'feat: add amazing new feature'
   git commit -m 'fix: resolve gateway connection issue'
   git commit -m 'docs: update API documentation'
   ```
7. **Push to the Branch** (`git push origin feature/AmazingFeature`)
8. **Open a Pull Request**

### Development Setup

For local development without Docker:

```sh
# Backend development
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py

# Ingestion development
cd ingestion
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.main

# Frontend development
cd frontend
pnpm install
pnpm run dev
```

### Security Considerations

When deploying to production:

- **Change default credentials** immediately
- **Use strong, unique JWT secret keys** (minimum 32 characters)
- **Configure proper CORS origins** for your domain
- **Use HTTPS** for all communications
- **Set up proper firewall rules** for database and MQTT access
- **Regularly update dependencies** for security patches
- **Monitor logs** for suspicious activities
- **Use environment-specific configurations**

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT). You are free to use, modify, and distribute this software for both commercial and non-commercial purposes.

### What this means:

- ✅ **Commercial use** - You can use this project for commercial purposes
- ✅ **Modification** - You can modify the source code
- ✅ **Distribution** - You can distribute the original or modified versions
- ✅ **Private use** - You can use this project for private purposes
- ✅ **Patent use** - You can use any patents that may be present

### Requirements:

- 📄 **License and copyright notice** - Include the original license and copyright notice in any copy of the software/source

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

**Thoriq Kusuma** - [@prmditya](https://github.com/prmditya) - t.paramaditya@gmail.com

**Project Link**: [https://github.com/prmditya/kampung-tani](https://github.com/prmditya/kampung-tani)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

We would like to thank the following projects and resources that made this project possible:

- [FastAPI](https://fastapi.tiangolo.com/) - For the excellent Python web framework
- [Next.js](https://nextjs.org/) - For the powerful React framework
- [Tailwind CSS](https://tailwindcss.com/) - For the utility-first CSS framework
- [Lucide Icons](https://lucide.dev/) - For the beautiful icon library
- [PostgreSQL](https://www.postgresql.org/) - For the robust database system
- [Paho MQTT](https://www.eclipse.org/paho/) - For MQTT client implementation
- [Best README Template](https://github.com/othneildrew/Best-README-Template) - For this README template

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/prmditya/kampung-tani.svg?style=for-the-badge
[contributors-url]: https://github.com/prmditya/kampung-tani/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/prmditya/kampung-tani.svg?style=for-the-badge
[forks-url]: https://github.com/prmditya/kampung-tani/network/members
[stars-shield]: https://img.shields.io/github/stars/prmditya/kampung-tani.svg?style=for-the-badge
[stars-url]: https://github.com/prmditya/kampung-tani/stargazers
[issues-shield]: https://img.shields.io/github/issues/prmditya/kampung-tani.svg?style=for-the-badge
[issues-url]: https://github.com/prmditya/kampung-tani/issues
[license-shield]: https://img.shields.io/github/license/prmditya/kampung-tani.svg?style=for-the-badge
[license-url]: https://github.com/prmditya/kampung-tani/blob/main/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/prmdtya
[product-screenshot-dark]: images/screenshot-dark.png
[product-screenshot-light]: images/screenshot-light.png

<!-- Technology Badges -->

[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[TypeScript]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[TailwindCSS]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[TailwindCSS-url]: https://tailwindcss.com/
[FastAPI]: https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi
[FastAPI-url]: https://fastapi.tiangolo.com/
[Python]: https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white
[Python-url]: https://www.python.org/
[PostgreSQL]: https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white
[PostgreSQL-url]: https://www.postgresql.org/
[Docker]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[Docker-url]: https://www.docker.com/
[DockerCompose]: https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white
[DockerCompose-url]: https://docs.docker.com/compose/
[Pydantic]: https://img.shields.io/badge/Pydantic-E92063?style=for-the-badge&logo=pydantic&logoColor=white
[Pydantic-url]: https://pydantic.dev/
[MQTT]: https://img.shields.io/badge/MQTT-660066?style=for-the-badge&logo=eclipse-mosquitto&logoColor=white
[MQTT-url]: https://www.eclipse.org/paho/
[Lucide]: https://img.shields.io/badge/Lucide-F56565?style=for-the-badge&logo=lucide&logoColor=white
[Lucide-url]: https://lucide.dev/
[TanStack]: https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=tanstack&logoColor=white
[TanStack-url]: https://tanstack.com/query/v4
[Axios]: https://img.shields.io/badge/axios-000000?style=for-the-badge&logo=axios&logoColor=white
[Axios-url]: https://axios-http.com/
[shadcn]: https://img.shields.io/badge/shadcn_ui-111827?style=for-the-badge&logo=shadcn&logoColor=white
[shadcn-url]: https://ui.shadcn.com/
[recharts]: https://img.shields.io/badge/Recharts-22c0d9?style=for-the-badge&logo=recharts&logoColor=white
[Recharts-url]: https://recharts.github.io/
[zod]: https://img.shields.io/badge/Zod-3e8eff?style=for-the-badge&logo=zod&logoColor=white
[Zod-url]: https://zod.dev/
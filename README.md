<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->

<a id="readme-top"></a>

<!--
*** Thanks for checking out the Best-README-Template. If 4. **Build and Start the Application**
   ```sh
   # Build and start all services
   docker-compose up --build

   # Or run in detached mode
   docker-compose up --build -d
   ```

5. **Verify Installation** suggestion
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
    A comprehensive IoT monitoring dashboard for agricultural sensor data management and device monitoring, built with modern web technologies and real-time MQTT integration.
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
        <li><a href="#installation">Installation</a></li>
        <li><a href="#environment-setup">Environment Setup</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
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

[![Kampung Tani Dashboard Screenshot][product-screenshot]](https://github.com/prmditya/kampung-tani)

Kampung Tani IoT Monitoring Dashboard is a comprehensive agricultural monitoring system that enables real-time tracking and management of IoT sensors in farming environments. The platform provides farmers and agricultural professionals with intuitive tools to monitor soil conditions, environmental parameters, and device status through a modern web interface.

### Key Capabilities:

- **Real-time IoT Data Monitoring**: Live sensor data from agricultural devices (SEM225, NPK sensors, weather stations)
- **Device Management**: Automatic device registration, status monitoring, and maintenance tracking
- **Data Visualization**: Interactive charts and dashboards for sensor data analysis
- **MQTT Integration**: Real-time data streaming from IoT devices via MQTT protocol
- **User Authentication**: Secure access control with JWT-based authentication
- **RESTful API**: Comprehensive API for data access and device management

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

#### Frontend Technologies

- [![Next.js][Next.js]][Next-url] - React framework for production
- [![React][React.js]][React-url] - UI library for building user interfaces
- [![TypeScript][TypeScript]][TypeScript-url] - Type-safe JavaScript development
- [![Tailwind CSS][TailwindCSS]][TailwindCSS-url] - Utility-first CSS framework
- [![Lucide React][Lucide]][Lucide-url] - Beautiful & consistent icon library

#### Backend Technologies

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
- Device status tracking and health monitoring

#### 📊 **Dashboard & Analytics**

- Interactive sensor data visualization
- Historical data analysis and trends
- Device management and monitoring panels
- Real-time status indicators

#### 🔧 **Device Management**

- Automatic device registration via MQTT
- Device status history tracking
- Online/offline status monitoring
- Device maintenance scheduling

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

- **Docker & Docker Compose**

  ```sh
  # Install Docker Desktop (includes Docker Compose)
  # Windows/Mac: Download from https://www.docker.com/products/docker-desktop
  # Linux: Follow installation guide for your distribution
  ```

- **Git**

  ```sh
  git --version
  ```

- **Node.js (optional, for local development)**
  ```sh
  node --version
  npm --version
  ```

### Installation

1. **Clone the repository**

   ```sh
   git clone https://github.com/prmditya/kampung-tani.git
   cd kampung-tani
   ```

2. **Environment Setup**
   Copy the example environment files and configure them:

   ```sh
   # Copy global environment file
   cp .env.example .env

   # Copy backend-specific environment file
   cp backend/.env.local.example backend/.env.local

   # Copy frontend-specific environment file
   cp frontend/.env.local.example frontend/.env.local
   ```

3. **Configure Environment Variables**
   Edit the `.env`, `backend/.env.local`, and `frontend/.env.local` files with your specific configuration:

   - Database credentials and connection settings
   - Backend API and MQTT configuration
   - Frontend API endpoints and application settings
   - JWT secret keys (use strong, unique keys)
   - CORS origins for development

   **⚠️ Important**: Never commit `.env` or `.env.local` files to version control. They contain sensitive information.

4. **Build and Start the Application**

   ```sh
   # Build and start all services
   docker-compose up --build

   # Or run in detached mode
   docker-compose up --build -d
   ```

5. **Verify Installation**
   After the containers are running, verify the services:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000
   - **API Documentation**: http://localhost:5000/docs
   - **Database**: localhost:5432

### Environment Setup

#### Configuration Requirements

The application requires environment configuration for:

- **Database Settings**: PostgreSQL connection parameters
- **Backend API**: FastAPI server configuration and MQTT settings
- **Frontend App**: Next.js application settings and API endpoints
- **Authentication**: JWT secret keys and token expiration
- **CORS Settings**: Allowed origins for development

#### Security Notes

- Create strong, unique passwords and secret keys
- Use different credentials for development and production
- Never commit `.env` or `.env.local` files to version control
- Refer to example files for required variables
- Use environment-specific configurations

#### Example Environment Files

The project includes example environment files:

- `.env.example` - Global application and infrastructure settings
- `backend/.env.local.example` - Backend-specific configuration
- `frontend/.env.local.example` - Frontend-specific configuration

Copy these files and configure them according to your environment.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

### Starting the Application

```sh
# Start all services
docker-compose up

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Accessing the Dashboard

1. **Open the web application**: Navigate to http://localhost:3000
2. **Login with default credentials** (change in production):
   - Username: `admin`
   - Password: `admin123`
3. **Explore the dashboard**: View real-time sensor data and device status

**⚠️ Security Note**: Change default credentials immediately in production environments.

### API Usage

The backend provides a comprehensive RESTful API. Access the interactive documentation at:

- **Swagger UI**: http://localhost:5000/docs
- **ReDoc**: http://localhost:5000/redoc

#### Example API Endpoints

```sh
# Get all devices
curl -X GET "http://localhost:5000/api/devices" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get sensor data for a device
curl -X GET "http://localhost:5000/api/devices/1/sensor-data" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Health check
curl -X GET "http://localhost:5000/api/health"
```

### MQTT Integration

The system automatically listens for MQTT messages from IoT devices:

#### Supported MQTT Topics

- `sensor/sem225/data` - SEM225 soil sensor data
- `sensors/+/data` - Generic sensor data format
- `sensor/+/data` - Legacy sensor data format

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

_For more examples and detailed API documentation, please refer to the [API Documentation](http://localhost:5000/docs)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 5432    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │                 │
                       │   MQTT Broker   │
                       │   (External)    │
                       │                 │
                       └─────────────────┘
                              ▲
                              │
                       ┌─────────────────┐
                       │                 │
                       │   IoT Devices   │
                       │   (SEM225, etc) │
                       │                 │
                       └─────────────────┘
```

### Frontend Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   └── (dashboard)/       # Dashboard routes
├── features/              # Feature-specific components
│   ├── auth/              # Authentication features
│   ├── dashboard/         # Dashboard features
│   └── devices/           # Device management features
└── shared/                # Reusable components & utilities
    ├── components/        # UI components
    ├── hooks/             # Custom React hooks
    ├── lib/               # Utilities & constants
    └── types/             # TypeScript type definitions
```

### Backend Architecture

```
backend/
├── app/
│   ├── core/              # Core functionality
│   │   ├── config.py      # Configuration management
│   │   ├── database.py    # Database connection
│   │   └── security.py    # Authentication & security
│   ├── routers/           # API route handlers
│   │   ├── auth.py        # Authentication endpoints
│   │   ├── devices.py     # Device management
│   │   └── sensors.py     # Sensor data endpoints
│   └── services/          # Business logic services
├── mqtt_listener.py       # MQTT data processing
└── main.py               # FastAPI application entry
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## API Documentation

### Authentication

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### Response

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

### Devices

#### Get All Devices

```http
GET /api/devices
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Device Sensor Data

```http
GET /api/devices/{device_id}/sensor-data?limit=100&hours=24
Authorization: Bearer YOUR_JWT_TOKEN
```

### Health Check

#### System Health

```http
GET /api/health
```

```json
{
  "status": "healthy",
  "timestamp": "2025-01-07T10:30:00Z",
  "version": "1.0.0",
  "database": "connected",
  "services": {
    "mqtt_listener": "running",
    "api": "running"
  }
}
```

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
   git commit -m 'fix: resolve device connection issue'
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

# Frontend development
cd frontend
npm install
npm run dev
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
[product-screenshot]: images/screenshot.png

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

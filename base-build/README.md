# Sensor Management System

A full-stack application for managing and monitoring sensors built with Docker, Node.js, TypeScript, MongoDB, and Next.js.

## Features

- 🎛️ Full CRUD operations for sensors
- 📊 Real-time sensor monitoring
- 🐳 Fully containerized with Docker
- 🔄 RESTful API with TypeScript
- 💾 MongoDB database
- 🎨 Modern React/Next.js frontend
- 🧪 HTTP test file included

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- CORS enabled
- RESTful API

### Frontend
- Next.js 14
- TypeScript
- React 18
- Axios for API calls
- Modern CSS styling

### Infrastructure
- Docker & Docker Compose
- MongoDB container
- Hot-reload for development

## Project Structure

```
.
├── docker-compose.yml
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── models/
│   │   │   └── Sensor.ts
│   │   ├── controllers/
│   │   │   └── sensor.controller.ts
│   │   └── routes/
│   │       └── sensor.routes.ts
│   ├── api-test.http
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx
    │   │   ├── layout.tsx
    │   │   └── globals.css
    │   ├── components/
    │   │   ├── SensorCard.tsx
    │   │   └── SensorForm.tsx
    │   └── services/
    │       └── sensorService.ts
    ├── package.json
    ├── tsconfig.json
    ├── next.config.js
    └── Dockerfile
```

## Getting Started

### Prerequisites

- Docker Desktop installed
- Docker Compose installed

### Installation & Running

1. Clone the repository or navigate to the project directory

2. Start all services with Docker Compose:
```bash
docker-compose up --build
```

3. Access the applications:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:3001
   - **MongoDB**: localhost:27017

### Stopping the Application

```bash
docker-compose down
```

To remove volumes (database data):
```bash
docker-compose down -v
```

## API Endpoints

### Sensors

- `GET /api/sensors` - Get all sensors
- `GET /api/sensors/:id` - Get sensor by ID
- `POST /api/sensors` - Create new sensor
- `PUT /api/sensors/:id` - Update sensor
- `DELETE /api/sensors/:id` - Delete sensor

### Health Check

- `GET /health` - API health status

## Testing the API

Use the included `backend/api-test.http` file with VS Code's REST Client extension or similar tools.

Example requests:

### Create a sensor
```http
POST http://localhost:3001/api/sensors
Content-Type: application/json

{
  "name": "Temperature Sensor 1",
  "type": "temperature",
  "location": "Room A",
  "value": 22.5,
  "unit": "°C",
  "status": "active"
}
```

### Get all sensors
```http
GET http://localhost:3001/api/sensors
```

## Sensor Model

```typescript
{
  name: string;           // Sensor name
  type: string;           // temperature, humidity, pressure, motion, light, other
  location: string;       // Physical location
  value: number;          // Current reading
  unit: string;           // Measurement unit
  status: string;         // active, inactive, maintenance
  lastUpdated: Date;      // Last update timestamp
  createdAt: Date;        // Creation timestamp
  updatedAt: Date;        // Last modification timestamp
}
```

## Development

### Backend Development

To run backend locally without Docker:
```bash
cd backend
npm install
npm run dev
```

### Frontend Development

To run frontend locally without Docker:
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

**Backend (.env)**
```
PORT=3001
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/sensors_db?authSource=admin
NODE_ENV=development
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## MongoDB Access

Default credentials:
- Username: `admin`
- Password: `admin123`
- Database: `sensors_db`

## Troubleshooting

### MongoDB connection issues
- Ensure MongoDB container is running: `docker ps`
- Check logs: `docker logs sensor-mongo`

### Backend not starting
- Check logs: `docker logs sensor-backend`
- Verify MongoDB is accessible

### Frontend not loading
- Check logs: `docker logs sensor-frontend`
- Verify backend is running and accessible

### Port conflicts
- Ensure ports 3000, 3001, and 27017 are not in use
- Modify ports in `docker-compose.yml` if needed

## License

MIT

# Sensor Management System

A full-stack IoT application for managing and monitoring sensors using MQTT protocol. Built with Docker, Node.js, TypeScript, MongoDB, and Next.js. This system simulates Raspberry Pi devices sending sensor data via MQTT to a central backend.

## Features

- 📡 **MQTT-based IoT Architecture** - Real-time sensor data via MQTT protocol
- 🎛️ **Sensor Management** - Register and manage sensor metadata
- 📊 **Real-time Monitoring** - Live sensor value updates from Raspberry Pi devices
- 📈 **Historical Data Tracking** - Stores sensor readings history for up to 30 days
- 📉 **Interactive Graphs** - View sensor history with beautiful charts (Recharts)
- ⚡ **Server-Sent Events (SSE)** - Efficient real-time updates without polling
- 🔒 **Data Integrity** - Sensor values can only be updated via MQTT (not through API)
- 🐳 **Fully Containerized** - All services run in Docker
- 🤖 **Raspberry Pi Simulator** - Simulates Pi devices sending sensor data every 2 minutes
- 🔄 **RESTful API** - TypeScript-based backend with Express
- 💾 **MongoDB Database** - Persistent sensor data storage with TTL indexes
- 🎨 **Modern Frontend** - React/Next.js with real-time updates
- 🧪 **HTTP Test Files** - Complete API testing and workflow examples

## Architecture

This system follows an IoT architecture pattern:

1. **Raspberry Pi Simulator** → Generates sensor data every 2 minutes
2. **MQTT Broker (Mosquitto)** → Message broker for pub/sub communication
3. **Central Backend** → Subscribes to MQTT topics, stores data in MongoDB
4. **REST API** → Manages sensor metadata (name, location, status)
5. **Frontend** → Displays sensors and allows metadata management

```
[Raspberry Pi Simulator] → [MQTT Broker] → [Backend] ↔ [MongoDB]
                                                ↕
                                          [Frontend]
```

## Tech Stack

### Backend (Central Server)
- Node.js with Express
- TypeScript
- MongoDB with Mongoose (with TTL indexes for auto-expiration)
- MQTT Client for receiving sensor data
- Server-Sent Events (SSE) for real-time updates
- Event-driven architecture with EventEmitter
- Historical data storage and retrieval
- CORS enabled
- RESTful API

### Raspberry Pi Simulator
- Node.js
- MQTT Publisher
- Simulates multiple sensor types (temperature, humidity, pressure, light)
- Configurable update interval (default: 2 minutes)

### MQTT Broker
- Eclipse Mosquitto
- Ports: 1883 (MQTT), 9001 (WebSocket)
- Anonymous connections allowed for development

### Frontend
- Next.js 14
- TypeScript
- React 18
- Recharts for data visualization
- Interactive historical graphs
- Modal-based sensor history view
- Server-Sent Events (SSE) client for real-time updates
- Axios for API calls
- Modern CSS styling with animations
- Real-time sensor value display

### Infrastructure
- Docker & Docker Compose
- 5 containerized services
- Hot-reload for development
- Persistent volumes for MongoDB and MQTT logs

## Project Structure

```
.
├── compose.yml                    # Docker Compose configuration
├── mosquitto/                     # MQTT broker configuration
│   └── config/
│       └── mosquitto.conf
├── pi-simulator/                  # Raspberry Pi device simulator
│   ├── src/
│   │   └── index.js              # MQTT publisher
│   ├── package.json
│   └── Dockerfile
├── backend/                       # Central backend server
│   ├── src/
│   │   ├── index.ts
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── models/
│   │   │   ├── Sensor.ts
│   │   │   └── SensorReading.ts  # Historical data
│   │   ├── controllers/
│   │   │   ├── sensor.controller.ts
│   │   │   ├── history.controller.ts
│   │   │   └── sse.controller.ts  # Server-Sent Events
│   │   ├── routes/
│   │   │   ├── sensor.routes.ts
│   │   │   ├── history.routes.ts
│   │   │   └── sse.routes.ts
│   │   └── services/
│   │       ├── mqttService.ts     # MQTT subscriber
│   │       └── eventEmitter.ts    # Event broadcasting
│   ├── api-test.http              # API endpoint tests
│   ├── api-workflow.http          # Complete workflow example
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
└── frontend/                      # Web interface
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx           # Main page with SSE
    │   │   ├── layout.tsx
    │   │   └── globals.css
    │   ├── components/
    │   │   ├── SensorCard.tsx
    │   │   ├── SensorForm.tsx
    │   │   └── SensorHistoryModal.tsx  # History graphs
    │   └── services/
    │       ├── sensorService.ts
    │       └── historyService.ts
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

3. The system will automatically:
   - Start MongoDB database
   - Start MQTT broker (Mosquitto)
   - Start backend and connect to MQTT
   - Start Raspberry Pi simulator (begins sending sensor data every 2 minutes)
   - Start frontend application

4. Access the applications:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:3001
   - **MQTT Broker**: localhost:1883 (MQTT), localhost:9001 (WebSocket)
   - **MongoDB**: localhost:27017

5. Watch the logs to see sensor data flowing:
```bash
docker logs -f sensor-pi-simulator
docker logs -f sensor-backend
```

### Stopping the Application

```bash
docker-compose down
```

To remove volumes (database data):
```bash
docker-compose down -v
```

## How It Works

### 1. Sensor Data Flow (MQTT)

The Raspberry Pi simulator publishes sensor readings to MQTT topics:

```
Topic: sensors/{type}/{sensorId}
Example: sensors/temperature/temp-sensor-01

Payload:
{
  "sensorId": "temp-sensor-01",
  "type": "temperature",
  "value": 23.5,
  "unit": "°C",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

The backend subscribes to `sensors/#` and automatically:
- Updates existing sensor values in the database
- Creates new sensors if they don't exist

### 2. Sensor Management (REST API)

Use the web interface or API to manage sensor metadata:

**Register a New Sensor:**
```http
POST http://localhost:3001/api/sensors
Content-Type: application/json

{
  "name": "temp-sensor-01",
  "type": "temperature",
  "location": "Living Room",
  "status": "active"
}
```

**Update Sensor Metadata (name, location, status only):**
```http
PUT http://localhost:3001/api/sensors/{id}
Content-Type: application/json

{
  "name": "Temperature Sensor Main",
  "location": "Bedroom",
  "status": "maintenance"
}
```

**Important:** Sensor values (`value` and `unit`) cannot be updated via API. They are controlled exclusively by MQTT messages from Raspberry Pi devices.

## API Endpoints

### Sensors

- `GET /api/sensors` - Get all sensors with current values
- `GET /api/sensors/:id` - Get specific sensor by ID
- `POST /api/sensors` - Register new sensor (metadata only)
- `PUT /api/sensors/:id` - Update sensor metadata (name, location, status)
  - ⚠️ Cannot update `value` or `unit` - returns 400 error
- `DELETE /api/sensors/:id` - Delete sensor

### Sensor History

- `GET /api/history/:sensorId` - Get all historical readings for a sensor
  - Query params: `startDate`, `endDate`, `limit` (default: 1000)
- `GET /api/history/:sensorId/recent` - Get recent readings
  - Query params: `hours` (default: 24)
- `GET /api/history/:sensorId/stats` - Get statistics (avg, min, max, count)
  - Query params: `startDate`, `endDate`
- `DELETE /api/history/cleanup` - Delete old readings
  - Query params: `days` (default: 30)

### Real-time Stream (SSE)

- `GET /api/stream/sensors` - Server-Sent Events stream for real-time sensor updates
  - Sends initial sensor data on connection
  - Streams updates when MQTT messages arrive
  - Heartbeat every 30 seconds

### Health Check

- `GET /health` - API health status

## MQTT Topics

### Publishing (Pi Simulator → Broker)

- `sensors/temperature/{sensorId}` - Temperature readings
- `sensors/humidity/{sensorId}` - Humidity readings
- `sensors/pressure/{sensorId}` - Pressure readings
- `sensors/light/{sensorId}` - Light sensor readings

### Subscribing (Backend)

- `sensors/#` - All sensor topics (wildcard subscription)

## Testing the System

### 1. Watch Real-time Sensor Updates

Monitor the Pi simulator sending data:
```bash
docker logs -f sensor-pi-simulator
```

Expected output:
```
✅ Pi Simulator connected to MQTT broker
📡 Sending sensor data every 120 seconds
📤 Published: sensors/temperature/temp-sensor-01 -> 22.5°C
📤 Published: sensors/humidity/humidity-sensor-01 -> 65%
```

Monitor the backend receiving data:
```bash
docker logs -f sensor-backend
```

Expected output:
```
✅ Backend connected to MQTT broker
📡 Subscribed to sensors/# topic
📥 Received message on sensors/temperature/temp-sensor-01
✅ Updated sensor temp-sensor-01: 22.5°C
```

### 2. Test API with HTTP Files

Use the included HTTP files with VS Code's REST Client extension:
- `backend/api-test.http` - Individual endpoint tests
- `backend/api-workflow.http` - Complete workflow example with step-by-step guide

### 3. Adjust Update Interval

Modify the Pi simulator's update frequency by editing `compose.yml`:

```yaml
pi-simulator:
  environment:
    - UPDATE_INTERVAL=60000  # 1 minute (in milliseconds)
```

Default is 120000 (2 minutes).

## Data Models

### Sensor Model (Current Values)

```typescript
{
  name: string;           // Sensor name (must match Pi device ID)
  type: string;           // temperature, humidity, pressure, motion, light, other
  location: string;       // Physical location (editable)
  value: number;          // Current reading (MQTT only)
  unit: string;           // Measurement unit (MQTT only)
  status: string;         // active, inactive, maintenance (editable)
  lastUpdated: Date;      // Last MQTT update timestamp
  createdAt: Date;        // Creation timestamp
  updatedAt: Date;        // Last modification timestamp
}
```

### SensorReading Model (Historical Data)

```typescript
{
  sensorId: ObjectId;     // Reference to Sensor
  sensorName: string;     // Sensor name for quick lookup
  type: string;           // Sensor type
  value: number;          // Reading value
  unit: string;           // Measurement unit
  timestamp: Date;        // When the reading was taken
  // Auto-expires after 30 days (TTL index)
}
```

## Historical Data & Graphs

### Viewing Sensor History

1. Click on any sensor card in the frontend
2. Click the "📊 View History" button
3. A modal will open showing:
   - Historical graph with time-series data (Recharts)
   - Statistics (average, min, max, total readings)
   - Time range selector (1h, 6h, 24h, 7d, 30d)

### Data Storage

- Every MQTT message automatically saves to the `SensorReading` collection
- Historical data is stored for **30 days** (configurable via TTL index)
- After 30 days, old readings are automatically deleted by MongoDB
- Each reading includes: timestamp, value, unit, sensor ID, and sensor name

### Data Expiration

The system uses MongoDB TTL (Time To Live) indexes to automatically delete old data:
- Default retention: 30 days (2,592,000 seconds)
- Configurable in `backend/src/models/SensorReading.ts`
- Modify the `expireAfterSeconds` value to change retention period

### Statistics Available

- **Average Value**: Mean of all readings in the time range
- **Minimum Value**: Lowest reading recorded
- **Maximum Value**: Highest reading recorded
- **Total Readings**: Number of data points collected

## Real-time Updates (SSE)

The application uses **Server-Sent Events (SSE)** for efficient real-time updates:

### Benefits over Polling:
- ✅ **No stuttering** - Smooth UI with no periodic refetches
- ✅ **Instant updates** - Data appears immediately when MQTT publishes
- ✅ **Low overhead** - Single persistent connection instead of repeated HTTP requests
- ✅ **Automatic reconnection** - Browser handles reconnection on connection loss
- ✅ **Battery efficient** - Reduces network activity and CPU usage

### How it Works:

1. Frontend opens EventSource connection to `/api/stream/sensors`
2. Backend sends initial sensor data
3. When MQTT updates a sensor, backend broadcasts via SSE
4. Frontend receives update and refreshes only that sensor
5. History modal listens for updates to its specific sensor

### Connection Details:

- **Endpoint**: `GET /api/stream/sensors`
- **Format**: `text/event-stream`
- **Heartbeat**: Every 30 seconds
- **Auto-reconnect**: Browser handles automatically

### Simulated Sensors

The Pi simulator includes these pre-configured sensors:

| Sensor ID            | Type        | Unit | Range      |
|---------------------|-------------|------|------------|
| temp-sensor-01      | temperature | °C   | 18 - 28    |
| humidity-sensor-01  | humidity    | %    | 40 - 80    |
| pressure-sensor-01  | pressure    | hPa  | 990 - 1030 |
| light-sensor-01     | light       | lux  | 100 - 1000 |

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
MQTT_BROKER=mqtt://mosquitto:1883
NODE_ENV=development
```

**Pi Simulator (.env)**
```
MQTT_BROKER=mqtt://mosquitto:1883
UPDATE_INTERVAL=120000
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

### MQTT Connection Issues
- Check Mosquitto logs: `docker logs sensor-mqtt`
- Verify port 1883 is not in use
- Test MQTT connection with an MQTT client (e.g., MQTT Explorer, mosquitto_pub/sub)

### Pi Simulator Not Sending Data
- Check logs: `docker logs sensor-pi-simulator`
- Ensure MQTT broker is running
- Verify UPDATE_INTERVAL environment variable

### Backend Not Receiving MQTT Messages
- Check logs: `docker logs sensor-backend`
- Verify MQTT broker is accessible from backend container
- Check MQTT_BROKER environment variable

### Sensors Not Updating in Frontend
- Check if sensors are registered in the database
- Verify sensor names match the Pi simulator IDs
- Check backend logs for MQTT message processing
- Refresh the frontend page

### MongoDB Connection Issues
- Ensure MongoDB container is running: `docker ps`
- Check logs: `docker logs sensor-mongo`

### Port Conflicts
- Ensure ports 3000, 3001, 1883, 9001, and 27017 are not in use
- Modify ports in `compose.yml` if needed

## Real Raspberry Pi Integration

To replace the simulator with real Raspberry Pi devices:

1. **On your Raspberry Pi:**
   - Install Node.js and npm
   - Copy the `pi-simulator/src/index.js` code
   - Update MQTT_BROKER to your server's IP address
   - Install dependencies: `npm install mqtt dotenv`
   - Modify sensor readings to use actual GPIO sensors
   - Run: `node index.js`

2. **Ensure network connectivity:**
   - Raspberry Pi must be able to reach the MQTT broker
   - Open port 1883 on your server's firewall

3. **Register sensors:**
   - Use the frontend to register sensors with matching IDs
   - Values will automatically update when Pi publishes data

## License

MIT

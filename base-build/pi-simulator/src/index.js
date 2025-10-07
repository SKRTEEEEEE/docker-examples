const mqtt = require('mqtt');
require('dotenv').config();

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
const UPDATE_INTERVAL = parseInt(process.env.UPDATE_INTERVAL) || 120000;

const sensors = [
  { id: 'temp-sensor-01', type: 'temperature', unit: '°C', min: 18, max: 28 },
  { id: 'humidity-sensor-01', type: 'humidity', unit: '%', min: 40, max: 80 },
  { id: 'pressure-sensor-01', type: 'pressure', unit: 'hPa', min: 990, max: 1030 },
  { id: 'light-sensor-01', type: 'light', unit: 'lux', min: 100, max: 1000 },
];

const client = mqtt.connect(MQTT_BROKER, {
  clientId: 'pi-simulator-' + Math.random().toString(16).substr(2, 8),
  clean: true,
  reconnectPeriod: 5000,
});

client.on('connect', () => {
  console.log('✅ Pi Simulator connected to MQTT broker');
  console.log(`📡 Sending sensor data every ${UPDATE_INTERVAL / 1000} seconds`);
  
  sendSensorData();
  setInterval(sendSensorData, UPDATE_INTERVAL);
});

client.on('error', (err) => {
  console.error('❌ MQTT connection error:', err);
});

client.on('reconnect', () => {
  console.log('🔄 Reconnecting to MQTT broker...');
});

function getRandomValue(min, max, decimals = 2) {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
}

function sendSensorData() {
  sensors.forEach((sensor) => {
    const value = getRandomValue(sensor.min, sensor.max);
    
    const payload = {
      sensorId: sensor.id,
      type: sensor.type,
      value: value,
      unit: sensor.unit,
      timestamp: new Date().toISOString(),
    };

    const topic = `sensors/${sensor.type}/${sensor.id}`;
    
    client.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
      if (err) {
        console.error(`❌ Error publishing ${sensor.id}:`, err);
      } else {
        console.log(`📤 Published: ${topic} -> ${value}${sensor.unit}`);
      }
    });
  });
}

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Pi Simulator...');
  client.end(true, () => {
    process.exit(0);
  });
});

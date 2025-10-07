import mqtt from 'mqtt';
import Sensor from '../models/Sensor';

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost:1883';

let client: mqtt.MqttClient;

export const connectMQTT = () => {
  client = mqtt.connect(MQTT_BROKER, {
    clientId: 'backend-' + Math.random().toString(16).substr(2, 8),
    clean: true,
    reconnectPeriod: 5000,
  });

  client.on('connect', () => {
    console.log('✅ Backend connected to MQTT broker');
    
    client.subscribe('sensors/#', { qos: 1 }, (err) => {
      if (err) {
        console.error('❌ MQTT subscription error:', err);
      } else {
        console.log('📡 Subscribed to sensors/# topic');
      }
    });
  });

  client.on('message', async (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      console.log(`📥 Received message on ${topic}:`, payload);

      const { sensorId, value, type, unit, timestamp } = payload;

      const sensor = await Sensor.findOne({ name: sensorId });

      if (sensor) {
        sensor.value = value;
        sensor.unit = unit;
        sensor.lastUpdated = new Date(timestamp);
        await sensor.save();
        console.log(`✅ Updated sensor ${sensorId}: ${value}${unit}`);
      } else {
        console.log(`⚠️ Sensor ${sensorId} not found in database. Creating new sensor...`);
        
        const newSensor = new Sensor({
          name: sensorId,
          type: type,
          location: 'Raspberry Pi',
          value: value,
          unit: unit,
          status: 'active',
          lastUpdated: new Date(timestamp),
        });

        await newSensor.save();
        console.log(`✅ Created new sensor ${sensorId}`);
      }
    } catch (error) {
      console.error('❌ Error processing MQTT message:', error);
    }
  });

  client.on('error', (err) => {
    console.error('❌ MQTT connection error:', err);
  });

  client.on('reconnect', () => {
    console.log('🔄 Reconnecting to MQTT broker...');
  });

  client.on('close', () => {
    console.log('📴 MQTT connection closed');
  });
};

export const disconnectMQTT = () => {
  if (client) {
    client.end(true);
    console.log('🛑 MQTT client disconnected');
  }
};

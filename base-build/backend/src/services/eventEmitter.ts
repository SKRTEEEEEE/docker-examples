import { EventEmitter } from 'events';

export interface SensorUpdateEvent {
  sensorId: string;
  name: string;
  type: string;
  value: number;
  unit: string;
  timestamp: Date;
}

class SensorEventEmitter extends EventEmitter {
  emitSensorUpdate(data: SensorUpdateEvent) {
    this.emit('sensorUpdate', data);
  }

  onSensorUpdate(callback: (data: SensorUpdateEvent) => void) {
    this.on('sensorUpdate', callback);
  }

  removeSensorUpdateListener(callback: (data: SensorUpdateEvent) => void) {
    this.off('sensorUpdate', callback);
  }
}

export const sensorEvents = new SensorEventEmitter();

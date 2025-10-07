import mongoose, { Document, Schema } from 'mongoose';

export interface ISensorReading extends Document {
  sensorId: string;
  sensorName: string;
  type: string;
  value: number;
  unit: string;
  timestamp: Date;
}

const SensorReadingSchema: Schema = new Schema(
  {
    sensorId: {
      type: Schema.Types.ObjectId,
      ref: 'Sensor',
      required: true,
      index: true,
    },
    sensorName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

SensorReadingSchema.index({ sensorId: 1, timestamp: -1 });
SensorReadingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.model<ISensorReading>('SensorReading', SensorReadingSchema);

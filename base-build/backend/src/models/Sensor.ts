import mongoose, { Document, Schema } from 'mongoose';

export interface ISensor extends Document {
  name: string;
  type: string;
  location: string;
  value: number;
  unit: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastUpdated: Date;
}

const SensorSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['temperature', 'humidity', 'pressure', 'motion', 'light', 'other'],
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active',
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISensor>('Sensor', SensorSchema);

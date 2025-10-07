import { Request, Response } from 'express';
import Sensor from '../models/Sensor';

export const getAllSensors = async (req: Request, res: Response) => {
  try {
    const sensors = await Sensor.find().sort({ createdAt: -1 });
    res.json(sensors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sensors', error });
  }
};

export const getSensorById = async (req: Request, res: Response) => {
  try {
    const sensor = await Sensor.findById(req.params.id);
    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found' });
    }
    res.json(sensor);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sensor', error });
  }
};

export const createSensor = async (req: Request, res: Response) => {
  try {
    const sensor = new Sensor(req.body);
    const savedSensor = await sensor.save();
    res.status(201).json(savedSensor);
  } catch (error) {
    res.status(400).json({ message: 'Error creating sensor', error });
  }
};

export const updateSensor = async (req: Request, res: Response) => {
  try {
    const sensor = await Sensor.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: Date.now() },
      { new: true, runValidators: true }
    );
    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found' });
    }
    res.json(sensor);
  } catch (error) {
    res.status(400).json({ message: 'Error updating sensor', error });
  }
};

export const deleteSensor = async (req: Request, res: Response) => {
  try {
    const sensor = await Sensor.findByIdAndDelete(req.params.id);
    if (!sensor) {
      return res.status(404).json({ message: 'Sensor not found' });
    }
    res.json({ message: 'Sensor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting sensor', error });
  }
};

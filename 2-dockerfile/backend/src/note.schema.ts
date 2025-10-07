import mongoose, { Schema, Document } from "mongoose";

// Interfaz para el documento de usuario
export interface NoteDoc extends Document {
    title: string;
    desc: string;
    priv: boolean;
    deleted: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// Esquema de Mongoose
const NoteSchema: Schema = new Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  priv: { type: Boolean, required: true },
  deleted: { type: Boolean, required: true }
}, {timestamps: true});

// Exporta el modelo
export const NoteModel = mongoose.models.Note || mongoose.model<NoteDoc>("Note", NoteSchema);

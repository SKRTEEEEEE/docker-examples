import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


// URL de la base de datos
const MONGO_URI = process.env.MONGO_URI;

// Función para conectar a MongoDB
export const connectDB = async (): Promise<void> => {
  try { 
    if (MONGO_URI===undefined) throw new Error ("MongoDB not Setted");
    await mongoose.connect(MONGO_URI);
    console.log("Conexión a MongoDB exitosa.");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
    process.exit(1); // Termina la aplicación si falla la conexión
  }
};

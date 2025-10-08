import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import { connectDB } from "./db";
import { NoteModel } from "./note.schema";
import cors from "cors";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware para parsear JSON
app.use(express.json());

const allowedOrigins = [
  'http://localhost:4173',
  'http://localhost:5173',
  'http://localhost',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Permite solicitudes sin origen (Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true); // origen permitido
    } else {
      callback(new Error('CORS no permitido para este origen'));
    }
  },
}));

// Conectar a MongoDB
connectDB();

// Ruta básica
app.get("/", (req: Request, res: Response) => {
  res.send("Servidor funcionando correctamente.");
});

app.delete("/note", async (req: Request, res: Response)=> {
  console.log(req.body)
  try {
    const {id} = req.body;
    console.log("delete: ",id)
    if(!id)res.status(400).json({success: false, message: "Faltan datos necesarios"})
    const deleted = await NoteModel.findByIdAndDelete(id)
    console.log(`deleted: ${deleted}`)
    res.status(201).json({success: true, message: `Exit at delete note id: ${id}`,data: deleted})
  } catch (error) {
    console.log("Error at delete note: ",error)
    res.status(500).json({success: false, message: `Error al eliminar la nota`, data: error})
  }
})

// Ruta para crear un usuario
app.post("/note", async (req: Request, res: Response) => { 
  console.log("Servidor para peticioansdads");
  try {
    const { title, desc, priv ,deleted } = req.body;
    console.log(title, desc, priv, deleted)
    if (!title ||!desc) {
      res.status(400).json({ success: false, message: "Faltan datos necesarios" });
    }
    const user = new NoteModel({  title, desc, priv ,deleted });
    await user.save();
    res.status(201).json({success: true, message: "Usuario creado", data: user });
  } catch (error) {
    res.status(500).json({ success: false,message: "Error al crear el usuario", data:error });
  }
});

app.get("/note", async (req: Request, res: Response) => {
    try {
      const notes = await NoteModel.find();
      
      res.status(200).json({ success: true, message: "Notas obtenidas", data: notes });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al obtener las notas", data: error });
    }
})

app.put("/note", async (req: Request, res: Response) => {
  try {
    
      const data = req.body
      const bddRes = await NoteModel.findByIdAndUpdate(data.id, data)
      res.status(200).json({success: true, message: "Nota modificada", data: bddRes})
    
  }  catch (error) {
    res.status(500).json({ success: false, message: "Error al obtener las notas", data: error });
  }
})

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

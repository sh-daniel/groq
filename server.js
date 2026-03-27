import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Configurar entorno
dotenv.config();

const app = express();

// Necesario para usar __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());

// 👉 Servir archivos estáticos (tu HTML)
app.use(express.static(path.join(__dirname, "public")));

// 👉 API KEY desde variables de entorno
const API_KEY = process.env.GROQ_API_KEY;

// 👉 Endpoint seguro para chat
app.post("/chat", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: "API KEY no configurada" });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    // Manejo de errores de la API
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);

  } catch (error) {
    console.error("Error en /chat:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// 👉 Ruta principal (evita "Cannot GET /")
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 👉 Puerto dinámico (Render usa process.env.PORT)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Rutas de los archivos JSON
const wordsFilePath = path.join(__dirname, "words.json");
const historialFilePath = path.join(__dirname, "Historial.json");

/**
 * GET /api/palabra
 * Retorna una palabra al azar desde el archivo words.json.
 */
app.get("/api/palabra", (req, res) => {
  fs.readFile(wordsFilePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error al leer el archivo de palabras" });
    }
    let palabras = [];
    try {
      palabras = JSON.parse(data);
    } catch (e) {
      return res.status(500).json({ error: "Error en el formato del archivo de palabras" });
    }
    if (palabras.length === 0) {
      return res.status(404).json({ error: "No hay palabras disponibles" });
    }
    const randomIndex = Math.floor(Math.random() * palabras.length);
    const palabra = palabras[randomIndex];
    return res.json({ palabra });
  });
});

/**
 * POST /api/historico
 * Recibe en el body los datos de una partida y los agrega al archivo Historial.json.
 */
app.post("/api/historico", (req, res) => {
  const partida = req.body;
  // Validación básica de datos
  if (!partida || !partida.jugador1 || !partida.jugador2 || !partida.resultado) {
    return res.status(400).json({ error: "Datos de partida incompletos" });
  }

  fs.readFile(historialFilePath, "utf8", (err, data) => {
    let historico = [];
    if (!err) {
      try {
        historico = JSON.parse(data);
      } catch (e) {
        historico = [];
      }
    }
    historico.push(partida);
    fs.writeFile(historialFilePath, JSON.stringify(historico, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Error al guardar la partida" });
      }
      return res.status(201).json({ message: "Partida guardada correctamente" });
    });
  });
});

/**
 * GET /api/historico
 * Retorna el historial completo de partidas desde el archivo Historial.json.
 */
app.get("/api/historico", (req, res) => {
  fs.readFile(historialFilePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error al leer el historial" });
    }
    let historico = [];
    try {
      historico = JSON.parse(data);
    } catch (e) {
      historico = [];
    }
    return res.json({ historico });
  });
});

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

// Middleware para leer JSON en requests
app.use(express.json());

// Conectar a la base de datos (se crea si no existe)
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("Error al conectar con la base de datos:", err.message);
  } else {
    console.log("Conectado a SQLite3.");
  }
});

// Crear tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
)`);

// ------------------ RUTAS API ------------------

// GET → obtener todos los usuarios
app.get("/users", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST → agregar un nuevo usuario
app.post("/users", (req, res) => {
  const { name, email } = req.body;
  db.run(
    `INSERT INTO users (name, email) VALUES (?, ?)`,
    [name, email],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, email });
    }
  );
});

// PUT → actualizar usuario por id
app.put("/users/:id", (req, res) => {
  const { name, email } = req.body;
  const { id } = req.params;

  db.run(
    `UPDATE users SET name = ?, email = ? WHERE id = ?`,
    [name, email, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updatedID: id, changes: this.changes });
    }
  );
});

// DELETE → eliminar usuario por id
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM users WHERE id = ?`, id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deletedID: id, changes: this.changes });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

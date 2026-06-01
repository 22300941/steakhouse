const db = require('../config/db');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const getPerfil = (req, res) => {
  const { id } = req.params;
  db.query('SELECT id, username, nombre, email, foto, rol, fecha_modificacion FROM usuarios WHERE id = ?', [id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error obteniendo perfil.' });
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json(rows[0]);
  });
};

const actualizarPerfil = (req, res) => {
  const { id } = req.params;
  const { username, password, foto } = req.body;

  // Verificar username disponible
  db.query('SELECT id FROM usuarios WHERE username = ? AND id != ?', [username, id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error en el servidor.' });
    if (rows.length > 0) return res.status(409).json({ error: 'El nombre de usuario ya está en uso.' });

    let sql, params;
    if (password) {
      const hashedPassword = bcrypt.hashSync(password, 10);
      sql = 'UPDATE usuarios SET username = ?, password = ?, foto = ? WHERE id = ?';
      params = [username, hashedPassword, foto, id];
    } else {
      sql = 'UPDATE usuarios SET username = ?, foto = ? WHERE id = ?';
      params = [username, foto, id];
    }

    db.query(sql, params, (err2) => {
      if (err2) return res.status(500).json({ error: 'Error actualizando perfil.' });
      res.json({ message: 'Perfil actualizado.' });
    });
  });
};

const darDeBaja = (req, res) => {
  const { id } = req.params;
  db.query('UPDATE usuarios SET vigente = 0 WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Error dando de baja.' });
    res.json({ message: 'Cuenta dada de baja.' });
  });
};

module.exports = { getPerfil, actualizarPerfil, darDeBaja };
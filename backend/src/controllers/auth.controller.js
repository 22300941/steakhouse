const db = require('../config/db');

const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }

  const sql = 'SELECT * FROM usuarios WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (error, resultados) => {
    if (error) {
      return res.status(500).json({ error: 'Error al verificar credenciales.' });
    }
    if (resultados.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    const usuario = resultados[0];
    // En producción usar JWT real. Por ahora token simple.
    const token = Buffer.from(`${usuario.id}:${usuario.username}:${Date.now()}`).toString('base64');

    res.json({
      usuario: {
        id: usuario.id,
        username: usuario.username,
        nombre: usuario.nombre,
        rol: usuario.rol
      },
      token
    });
  });
};

module.exports = { login };

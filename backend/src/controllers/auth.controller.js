const db = require('../config/db');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Usuario y contraseña requeridos.' });

  const sql = 'SELECT * FROM usuarios WHERE username = ? AND vigente = 1';
db.query(sql, [username], (error, resultados) => {
  if (error) return res.status(500).json({ error: 'Error al verificar credenciales.' });
  if (resultados.length === 0)
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });

  const usuario = resultados[0];
  const passwordValida = bcrypt.compareSync(password, usuario.password);
  if (!passwordValida)
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });

  if (!usuario.confirmado)
    return res.status(403).json({ error: 'Cuenta no confirmada. Revisa tu correo.' });

  const token = Buffer.from(`${usuario.id}:${usuario.username}:${Date.now()}`).toString('base64');
  res.json({
    usuario: { id: usuario.id, username: usuario.username, nombre: usuario.nombre, rol: usuario.rol, email: usuario.email, foto: usuario.foto },
    token
  });
});
};

const registrar = (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email)
    return res.status(400).json({ error: 'Todos los campos son requeridos.' });

  // Verificar disponibilidad de username
  db.query('SELECT id FROM usuarios WHERE username = ?', [username], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error en el servidor.' });
    if (rows.length > 0) return res.status(409).json({ error: 'El nombre de usuario ya está en uso.' });

    // Verificar email
    db.query('SELECT id FROM usuarios WHERE email = ?', [email], (err2, rows2) => {
      if (err2) return res.status(500).json({ error: 'Error en el servidor.' });
      if (rows2.length > 0) return res.status(409).json({ error: 'El correo ya está registrado.' });

      const codigo = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedPassword = bcrypt.hashSync(password, 10);
      const sql = 'INSERT INTO usuarios (username, password, nombre, email, rol, codigo_confirmacion, confirmado) VALUES (?, ?, ?, ?, "empleado", ?, 0)';
      db.query(sql, [username, hashedPassword, username, email, codigo], (err3) => {
        if (err3) return res.status(500).json({ error: 'Error al registrar usuario.' });

        transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Código de confirmación - Garín Steakhouse',
          html: `<h2>Bienvenido a Garín Steakhouse</h2><p>Tu código de confirmación es: <strong>${codigo}</strong></p>`
        }, (mailErr) => {
          if (mailErr) console.error('Error enviando correo:', mailErr);
          res.status(201).json({ message: 'Usuario registrado. Revisa tu correo para confirmar.' });
        });
      });
    });
  });
};

const confirmarCodigo = (req, res) => {
  const { email, codigo } = req.body;
  db.query('SELECT * FROM usuarios WHERE email = ? AND codigo_confirmacion = ?', [email, codigo], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error en el servidor.' });
    if (rows.length === 0) return res.status(400).json({ error: 'Código incorrecto.' });

    db.query('UPDATE usuarios SET confirmado = 1, codigo_confirmacion = NULL WHERE email = ?', [email], (err2) => {
      if (err2) return res.status(500).json({ error: 'Error confirmando cuenta.' });
      res.json({ message: 'Cuenta confirmada exitosamente.' });
    });
  });
};

const verificarUsername = (req, res) => {
  const { username } = req.params;
  db.query('SELECT id FROM usuarios WHERE username = ?', [username], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error en el servidor.' });
    res.json({ disponible: rows.length === 0 });
  });
};

module.exports = { login, registrar, confirmarCodigo, verificarUsername };
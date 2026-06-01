const db = require('../config/db');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Almacén temporal de registros pendientes (en memoria)
const registrosPendientes = new Map();
const recuperacionesPendientes = new Map();

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

  db.query('SELECT id FROM usuarios WHERE username = ?', [username], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error en el servidor.' });
    if (rows.length > 0) return res.status(409).json({ error: 'El nombre de usuario ya está en uso.' });

    db.query('SELECT id FROM usuarios WHERE email = ?', [email], (err2, rows2) => {
      if (err2) return res.status(500).json({ error: 'Error en el servidor.' });
      if (rows2.length > 0) return res.status(409).json({ error: 'El correo ya está registrado.' });

      const codigo = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedPassword = bcrypt.hashSync(password, 10);
      const expiracion = Date.now() + 15 * 60 * 1000; // 15 minutos

      // Guardar temporalmente en memoria, NO en BD
      registrosPendientes.set(email, { username, password: hashedPassword, email, codigo, expiracion });

      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Código de confirmación - Garín Steakhouse',
        html: `<h2>Bienvenido a Garín Steakhouse</h2><p>Tu código de confirmación es: <strong>${codigo}</strong></p><p>Este código expira en 15 minutos.</p>`
      }, (mailErr) => {
        if (mailErr) {
          console.error('Error enviando correo:', mailErr);
          return res.status(500).json({ error: 'Error enviando correo de confirmación.' });
        }
        res.status(201).json({ message: 'Código enviado a tu correo.' });
      });
    });
  });
};

const confirmarCodigo = (req, res) => {
  const { email, codigo } = req.body;
  const pendiente = registrosPendientes.get(email);

  if (!pendiente) return res.status(400).json({ error: 'No hay registro pendiente para este correo.' });
  if (Date.now() > pendiente.expiracion) {
    registrosPendientes.delete(email);
    return res.status(400).json({ error: 'El código ha expirado. Vuelve a registrarte.' });
  }
  if (pendiente.codigo !== codigo) return res.status(400).json({ error: 'Código incorrecto.' });

  // Ahora sí insertar en BD
  const sql = 'INSERT INTO usuarios (username, password, nombre, email, rol, confirmado) VALUES (?, ?, ?, ?, "empleado", 1)';
  db.query(sql, [pendiente.username, pendiente.password, pendiente.username, pendiente.email], (err) => {
    if (err) return res.status(500).json({ error: 'Error al crear la cuenta.' });
    registrosPendientes.delete(email);
    res.json({ message: 'Cuenta creada exitosamente.' });
  });
};

const reenviarCodigo = (req, res) => {
  const { email } = req.body;
  const pendiente = registrosPendientes.get(email);
  if (!pendiente) return res.status(400).json({ error: 'No hay registro pendiente para este correo.' });

  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  const expiracion = Date.now() + 15 * 60 * 1000;
  pendiente.codigo = codigo;
  pendiente.expiracion = expiracion;
  registrosPendientes.set(email, pendiente);

  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Nuevo código de confirmación - Garín Steakhouse',
    html: `<h2>Nuevo código de confirmación</h2><p>Tu nuevo código es: <strong>${codigo}</strong></p><p>Este código expira en 15 minutos.</p>`
  }, (mailErr) => {
    if (mailErr) return res.status(500).json({ error: 'Error enviando correo.' });
    res.json({ message: 'Nuevo código enviado.' });
  });
};

const verificarUsername = (req, res) => {
  const { username } = req.params;
  db.query('SELECT id FROM usuarios WHERE username = ?', [username], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error en el servidor.' });
    res.json({ disponible: rows.length === 0 });
  });
};

const recuperarPassword = (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'El correo es requerido.' });

  db.query('SELECT * FROM usuarios WHERE email = ? AND vigente = 1', [email], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error en el servidor.' });
    if (rows.length === 0) return res.status(404).json({ error: 'No existe una cuenta con ese correo.' });

    const usuario = rows[0];
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiracion = Date.now() + 15 * 60 * 1000;

    recuperacionesPendientes.set(email, { codigo, expiracion, username: usuario.username });

    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperación de contraseña - Garín Steakhouse',
      html: `<h2>Recuperación de contraseña</h2><p>Hola <strong>${usuario.nombre}</strong>,</p><p>Tu código de recuperación es: <strong>${codigo}</strong></p><p>Este código expira en 15 minutos.</p>`
    }, (mailErr) => {
      if (mailErr) return res.status(500).json({ error: 'Error enviando correo.' });
      res.json({ message: 'Código enviado a tu correo.', username: usuario.username });
    });
  });
};

const verificarCodigoRecuperacion = (req, res) => {
  const { email, codigo } = req.body;
  const pendiente = recuperacionesPendientes.get(email);

  if (!pendiente) return res.status(400).json({ error: 'No hay recuperación pendiente para este correo.' });
  if (Date.now() > pendiente.expiracion) {
    recuperacionesPendientes.delete(email);
    return res.status(400).json({ error: 'El código ha expirado.' });
  }
  if (pendiente.codigo !== codigo) return res.status(400).json({ error: 'Código incorrecto.' });

  res.json({ message: 'Código verificado.', username: pendiente.username });
};

const cambiarPassword = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Datos incompletos.' });

  const hashedPassword = bcrypt.hashSync(password, 10);
  db.query('UPDATE usuarios SET password = ? WHERE email = ?', [hashedPassword, email], (err) => {
    if (err) return res.status(500).json({ error: 'Error actualizando contraseña.' });
    recuperacionesPendientes.delete(email);

    // Devolver datos del usuario para auto-login
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err2, rows) => {
      if (err2 || rows.length === 0) return res.json({ message: 'Contraseña actualizada.' });
      const usuario = rows[0];
      const token = Buffer.from(`${usuario.id}:${usuario.username}:${Date.now()}`).toString('base64');
      res.json({
        message: 'Contraseña actualizada.',
        usuario: { id: usuario.id, username: usuario.username, nombre: usuario.nombre, rol: usuario.rol, email: usuario.email, foto: usuario.foto },
        token
      });
    });
  });
};

module.exports = { login, registrar, confirmarCodigo, verificarUsername, reenviarCodigo, recuperarPassword, verificarCodigoRecuperacion, cambiarPassword };
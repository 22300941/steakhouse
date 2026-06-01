const db = require('../config/db');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const getHistorial = (req, res) => {
  const { usuario_id } = req.params;
  db.query('SELECT * FROM historial WHERE usuario_id = ? ORDER BY fecha DESC', [usuario_id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error obteniendo historial.' });
    const datos = rows.map(h => ({
      ...h,
      fecha: h.fecha instanceof Date ? h.fecha.toISOString().split('T')[0] : h.fecha,
      total: Number(h.total)
    }));
    res.json(datos);
  });
};

const getHistorialById = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM historial WHERE id = ?', [id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error obteniendo ticket.' });
    if (rows.length === 0) return res.status(404).json({ error: 'Ticket no encontrado.' });
    const ticket = { ...rows[0], fecha: rows[0].fecha instanceof Date ? rows[0].fecha.toISOString().split('T')[0] : rows[0].fecha };

    db.query('SELECT * FROM historial_items WHERE historial_id = ?', [id], (err2, items) => {
      if (err2) return res.status(500).json({ error: 'Error obteniendo items.' });
      ticket.items = items.map(i => ({ ...i, producto_precio: Number(i.producto_precio), total_linea: Number(i.total_linea) }));
      res.json(ticket);
    });
  });
};

const crearHistorial = (req, res) => {
  const { usuario_id, usuario_nombre, fecha, total, items, email, xml_ticket } = req.body;
  const sql = 'INSERT INTO historial (usuario_id, usuario_nombre, fecha, total, xml_ticket) VALUES (?, ?, ?, ?, ?)';

  db.query(sql, [usuario_id, usuario_nombre, fecha, total, xml_ticket], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error creando historial.' });
    const historialId = result.insertId;

    if (items && items.length > 0) {
      const itemsSql = 'INSERT INTO historial_items (historial_id, producto_nombre, producto_precio, cantidad, total_linea) VALUES ?';
      const valores = items.map(i => [historialId, i.producto_nombre, i.producto_precio, i.cantidad, i.total_linea]);
      db.query(itemsSql, [valores], (err2) => {
        if (err2) return res.status(500).json({ error: 'Error guardando items.' });

        // Enviar correo
        if (email) {
          transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Ticket de compra #${historialId} - Garín Steakhouse`,
            html: `<h2>¡Gracias por tu compra!</h2><p>Adjunto encontrarás tu ticket #${historialId}.</p><p><strong>Total:</strong> $${Number(total).toFixed(2)} MXN</p>`,
            attachments: [{
              filename: `ticket_${historialId}.xml`,
              content: xml_ticket,
              contentType: 'application/xml'
            }]
          }, (mailErr) => {
            if (mailErr) console.error('Error enviando correo ticket:', mailErr);
          });
        }

        res.status(201).json({ id: historialId });
      });
    } else {
      res.status(201).json({ id: historialId });
    }
  });
};

module.exports = { getHistorial, getHistorialById, crearHistorial };
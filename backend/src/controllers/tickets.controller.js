const db = require('../config/db');

const getTickets = (req, res) => {
  db.query('SELECT * FROM tickets ORDER BY fecha DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener tickets.' });
    const datos = rows.map(t => ({
      ...t,
      fecha: t.fecha instanceof Date ? t.fecha.toISOString().split('T')[0] : t.fecha,
      cantidad: Number(t.cantidad)
    }));
    res.json(datos);
  });
};

const getTicketById = (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM tickets WHERE id = ?', [id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener ticket.' });
    if (rows.length === 0) return res.status(404).json({ error: 'Ticket no encontrado.' });
    const ticket = rows[0];
    db.query('SELECT * FROM ticket_items WHERE ticket_id = ?', [id], (err2, items) => {
      if (err2) return res.status(500).json({ error: 'Error al obtener items.' });
      ticket.items = items;
      res.json(ticket);
    });
  });
};

const crearTicket = (req, res) => {
  const { fecha, responsable, cantidad, tipo, items } = req.body;
  const tipoFinal = tipo || 'ganancia';
  const sql = 'INSERT INTO tickets (fecha, responsable, cantidad, tipo) VALUES (?, ?, ?, ?)';

  db.query(sql, [fecha, responsable, cantidad, tipoFinal], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al crear ticket.' });
    const ticketId = result.insertId;

    if (items && items.length > 0) {
      const itemsSql = 'INSERT INTO ticket_items (ticket_id, producto, cantidad, precio_unitario, total_linea) VALUES ?';
      const valores = items.map(i => [ticketId, i.producto, i.cantidad, i.precio_unitario, i.total_linea]);
      db.query(itemsSql, [valores], (err2) => {
        if (err2) return res.status(500).json({ error: 'Error al guardar items.' });
        res.status(201).json({ id: ticketId, fecha, responsable, cantidad, tipo: tipoFinal });
      });
    } else {
      res.status(201).json({ id: ticketId, fecha, responsable, cantidad, tipo: tipoFinal });
    }
  });
};

module.exports = { getTickets, getTicketById, crearTicket };
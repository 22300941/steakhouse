const db = require('../config/db');

const getProveedores = (req, res) => {
  db.query('SELECT * FROM proveedores', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener proveedores.' });
    res.json(rows);
  });
};

const getProductosPorProveedor = (req, res) => {
  const sql = 'SELECT * FROM productos WHERE proveedor_id = ?';
  db.query(sql, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener productos del proveedor.' });
    res.json(rows);
  });
};

module.exports = { getProveedores, getProductosPorProveedor };

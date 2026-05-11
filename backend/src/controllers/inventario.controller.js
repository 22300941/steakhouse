const db = require('../config/db');

const getInventario = (req, res) => {
  db.query('SELECT * FROM productos', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener inventario.' });
    res.json(rows);
  });
};

const getById = (req, res) => {
  db.query('SELECT * FROM productos WHERE id = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener producto.' });
    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.json(rows[0]);
  });
};

const crear = (req, res) => {
  const { name, price, imageURL, category, description, inStock, proveedor } = req.body;
  const sql = 'INSERT INTO productos (name, price, imageURL, category, description, inStock, proveedor) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [name, price, imageURL, category, description, inStock, proveedor], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al crear producto.' });
    res.status(201).json({ id: result.insertId, name, price, imageURL, category, description, inStock, proveedor });
  });
};

const actualizar = (req, res) => {
  const { name, price, imageURL, category, description, inStock, proveedor } = req.body;
  const sql = 'UPDATE productos SET name=?, price=?, imageURL=?, category=?, description=?, inStock=?, proveedor=? WHERE id=?';
  db.query(sql, [name, price, imageURL, category, description, inStock, proveedor, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar producto.' });
    res.json({ message: 'Producto actualizado.' });
  });
};

const eliminar = (req, res) => {
  db.query('DELETE FROM productos WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar producto.' });
    res.json({ message: 'Producto eliminado.' });
  });
};

module.exports = { getInventario, getById, crear, actualizar, eliminar };

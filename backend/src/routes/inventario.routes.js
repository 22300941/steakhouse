const express = require('express');
const router = express.Router();
const { getInventario, getById, crear, actualizar, eliminar, actualizarStock } = require('../controllers/inventario.controller');
router.get('/inventario', getInventario);
router.get('/inventario/:id', getById);
router.post('/inventario', crear);
router.put('/inventario/:id', actualizar);
router.delete('/inventario/:id', eliminar);
router.post('/inventario/stock', actualizarStock);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getInventario, getInventarioVigente, getById, crear, actualizar, darDeBaja, actualizarStock } = require('../controllers/inventario.controller');

router.get('/inventario', getInventario);
router.get('/inventario/vigente', getInventarioVigente);
router.get('/inventario/:id', getById);
router.post('/inventario', crear);
router.put('/inventario/:id', actualizar);
router.put('/inventario/:id/baja', darDeBaja);
router.post('/inventario/stock', actualizarStock);

module.exports = router;
const express = require('express');
const router = express.Router();
const { getInventario, getInventarioVigente, getById, crear, actualizar, darDeBaja, actualizarStock, reactivar } = require('../controllers/inventario.controller');

router.get('/inventario/vigente', getInventarioVigente);
router.post('/inventario/stock', actualizarStock);
router.get('/inventario', getInventario);
router.post('/inventario', crear);
router.get('/inventario/:id', getById);
router.put('/inventario/:id', actualizar);
router.put('/inventario/:id/baja', darDeBaja);
router.put('/inventario/:id/reactivar', reactivar);

module.exports = router;
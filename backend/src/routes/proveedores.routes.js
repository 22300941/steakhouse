const express = require('express');
const router = express.Router();
const { getProveedores, getProductosPorProveedor } = require('../controllers/proveedores.controller');

router.get('/proveedores', getProveedores);
router.get('/proveedores/:id/productos', getProductosPorProveedor);

module.exports = router;

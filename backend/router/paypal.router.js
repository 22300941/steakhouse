const express = require('express');
const { createOrder, captureOrder } = require('../controlador/paypal.controller');

const router = express.Router();

router.post('/crear-orden', createOrder);
router.post('/capturar-orden', captureOrder);

module.exports = router;
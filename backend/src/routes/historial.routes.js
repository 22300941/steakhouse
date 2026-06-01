const express = require('express');
const router = express.Router();
const { getHistorial, getHistorialById, crearHistorial } = require('../controllers/historial.controller');

router.get('/historial/:usuario_id', getHistorial);
router.get('/historial/ticket/:id', getHistorialById);
router.post('/historial', crearHistorial);

module.exports = router;
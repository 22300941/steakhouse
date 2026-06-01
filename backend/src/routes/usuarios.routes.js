const express = require('express');
const router = express.Router();
const { getPerfil, actualizarPerfil, darDeBaja } = require('../controllers/usuarios.controller');

router.get('/usuarios/:id', getPerfil);
router.put('/usuarios/:id', actualizarPerfil);
router.put('/usuarios/:id/baja', darDeBaja);

module.exports = router;
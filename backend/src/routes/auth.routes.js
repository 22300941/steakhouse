const express = require('express');
const router = express.Router();
const { login, registrar, confirmarCodigo, verificarUsername } = require('../controllers/auth.controller');

router.post('/auth/login', login);
router.post('/auth/registrar', registrar);
router.post('/auth/confirmar', confirmarCodigo);
router.get('/auth/verificar-username/:username', verificarUsername);

module.exports = router;
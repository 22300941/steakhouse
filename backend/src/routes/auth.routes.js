const express = require('express');
const router = express.Router();
const { login, registrar, confirmarCodigo, verificarUsername, reenviarCodigo, recuperarPassword, verificarCodigoRecuperacion, cambiarPassword } = require('../controllers/auth.controller');

router.post('/auth/login', login);
router.post('/auth/registrar', registrar);
router.post('/auth/confirmar', confirmarCodigo);
router.get('/auth/verificar-username/:username', verificarUsername);
router.post('/auth/reenviar-codigo', reenviarCodigo);
router.post('/auth/recuperar-password', recuperarPassword);
router.post('/auth/verificar-codigo-recuperacion', verificarCodigoRecuperacion);
router.post('/auth/cambiar-password', cambiarPassword);

module.exports = router;
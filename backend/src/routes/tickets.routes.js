const express = require('express');
const router = express.Router();
const { getTickets, getTicketById, crearTicket } = require('../controllers/tickets.controller');

router.get('/tickets', getTickets);
router.get('/tickets/:id', getTicketById);
router.post('/tickets', crearTicket);

module.exports = router;

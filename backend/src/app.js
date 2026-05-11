const express = require('express');
const cors = require('cors');
const productosRoutes = require('./routes/productos.routes');
const paypalRouter = require('../router/paypal.router');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', productosRoutes);
app.use('/api/paypal', paypalRouter);

module.exports = app;
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Rutas
const productosRoutes = require('./routes/productos.routes');
const authRoutes = require('./routes/auth.routes');
const inventarioRoutes = require('./routes/inventario.routes');
const proveedoresRoutes = require('./routes/proveedores.routes');
const ticketsRoutes = require('./routes/tickets.routes');
const paypalRouter = require('../router/paypal.router');

app.use('/api', productosRoutes);
app.use('/api', authRoutes);
app.use('/api', inventarioRoutes);
app.use('/api', proveedoresRoutes);
app.use('/api', ticketsRoutes);
app.use('/api/paypal', paypalRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

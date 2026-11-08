const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use(healthRoutes);
app.use(authRoutes);
app.use(roomRoutes);
app.use(categoryRoutes);
app.use(productRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
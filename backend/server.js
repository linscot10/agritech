// server.js
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// routes (we put handlers inside route files)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/uploads', express.static('uploads'));
app.use('/api/products', require('./routes/products'));
app.use('/api/sensors', require('./routes/sensors'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/supply-chain', require('./routes/supplyChain'));
app.use('/api/programs', require('./routes/programs'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/geo-data', require('./routes/geoData'));
app.use('/api/recommendations', require('./routes/recommendations'));



app.get('/', (req, res) => res.send('Agritech Backend (Module 1) up'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

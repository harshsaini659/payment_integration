require('dotenv').config();
const connectDB = require("./config/db");
connectDB();
const express = require('express');
const app = express();
const paymentRoutes = require('./routes/paymentRoutes');
const customerRoutes = require('./routes/customerRoutes');

app.use(express.json());

// routes
app.use('/', paymentRoutes);
app.use('/api', customerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

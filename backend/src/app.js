import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import productRoutes from './routes/productRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import authRoutes from './routes/auth.js';

const app = express();

app.use(express.json());                            // Parse JSON
app.use(express.urlencoded({ extended: true }));    // Parse form data

app.use('/api/auth', authRoutes);

app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);

export default app;
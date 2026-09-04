import express from 'express';
import studentRoutes from './src/routes/studentRoutes.js';

const app = express();

app.use(express.json());
app.use('/students', studentRoutes);

export default app;
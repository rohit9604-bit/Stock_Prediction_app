import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';

dotenv.config({ path: './config.env' });

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Auth API running on http://localhost:${port}`);
});

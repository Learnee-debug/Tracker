import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from './lib/db';
import authRoutes from './routes/auth';
import stateRoutes from './routes/state';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT ?? 3001;

// ─── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  credentials: true, // required for httpOnly cookies
}));

app.use(express.json({ limit: '256kb' })); // state payload will never exceed ~50KB
app.use(cookieParser());

// ─── Routes ────────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/state', stateRoutes);

// Health check — used by Railway and monitoring
app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime() });
});

// ─── Error handler — must be last ─────────────────────────────────────────────

app.use(errorHandler);

// ─── Boot ─────────────────────────────────────────────────────────────────────

async function start(): Promise<void> {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] Running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('[server] Failed to start:', err);
  process.exit(1);
});

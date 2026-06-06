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

// Accept comma-separated origins in CLIENT_ORIGIN, plus the hardcoded
// Vercel production URL as a fallback so CORS works before the env var is set.
const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'https://career-os-jet.vercel.app',
  ...(process.env.CLIENT_ORIGIN ?? '').split(',').map(o => o.trim()).filter(Boolean),
]);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin || ALLOWED_ORIGINS.has(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '256kb' }));
app.use(cookieParser());

// ─── Routes ────────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/state', stateRoutes);

// Health check — must respond before MongoDB connects so Railway
// healthcheck passes during the startup window.
app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime() });
});

// ─── Error handler ─────────────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Boot ─────────────────────────────────────────────────────────────────────
// Start HTTP server FIRST so the Railway healthcheck gets a 200 immediately.
// Then connect to MongoDB. If MongoDB fails, log and exit — Railway will restart.

async function start(): Promise<void> {
  // Step 1: bind to port immediately
  await new Promise<void>((resolve) => {
    app.listen(PORT, () => {
      console.log(`[server] Listening on port ${PORT}`);
      resolve();
    });
  });

  // Step 2: connect to database
  try {
    await connectDB();
    console.log('[server] Ready');
  } catch (err) {
    console.error('[server] MongoDB connection failed:', err);
    process.exit(1);
  }
}

start().catch((err) => {
  console.error('[server] Fatal startup error:', err);
  process.exit(1);
});

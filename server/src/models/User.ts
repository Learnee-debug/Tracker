import { Schema, model, Document, Types } from 'mongoose';
import type { CareerState } from 'shared/types';

// ─────────────────────────────────────────────────────────────────────────────
// Default state — applied when a new user registers.
// Mirrors the localStorage defaults from v3 exactly.
// ─────────────────────────────────────────────────────────────────────────────
export const DEFAULT_CAREER_STATE: CareerState = {
  score: { solved: 0, owned: 0, verbal: 0, commits: 0, mocks: 0, lc: 0, apps: 0, oss: 0 },
  nn: { d1: false, d2: false, d3: false },
  nnDate: '',
  risks: {},
  verify: {},
  hx: {},
  cal: {},
  sprintStart: '',
  weeklyHistory: [],
  pipeline: [],
  coNotes: {},
};

// ─────────────────────────────────────────────────────────────────────────────
// Mongoose document interface
// ─────────────────────────────────────────────────────────────────────────────
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  refreshTokenHash: string | null;
  state: CareerState;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    // We store a hash of the refresh token, never the token itself.
    // This lets us invalidate a token server-side without storing the raw value.
    refreshTokenHash: {
      type: String,
      default: null,
    },
    // The entire career state is one embedded document.
    // This is intentional — the data is personal, not relational.
    state: {
      type: Schema.Types.Mixed,
      default: () => ({ ...DEFAULT_CAREER_STATE }),
    },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);

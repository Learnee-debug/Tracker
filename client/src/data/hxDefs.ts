// ─────────────────────────────────────────────────────────────────────────────
// HireOnyx task definitions.
// Order of keys matters — it defines the recommended build sequence.
// Pure data — no logic.
// ─────────────────────────────────────────────────────────────────────────────

export interface HxTask {
  id: string;
  label: string;
}

export interface HxSection {
  label: string;
  color: string;
  tasks: HxTask[];
}

export const HX_DEFS: Record<string, HxSection> = {
  database: {
    label: 'Database',
    color: 'var(--teal)',
    tasks: [
      { id: 'db1', label: 'User schema (name, email, password hash, role)' },
      { id: 'db2', label: 'Employer schema (company, email, description)' },
      { id: 'db3', label: 'Job schema (title, desc, requirements, salary, employerId)' },
      { id: 'db4', label: 'Application schema (userId, jobId, resume, status, date)' },
      { id: 'db5', label: 'MongoDB Atlas configured and connected' },
      { id: 'db6', label: 'Indexes on commonly queried fields' },
      { id: 'db7', label: 'Aggregation: top jobs query working' },
    ],
  },
  backend: {
    label: 'Backend',
    color: 'var(--blue)',
    tasks: [
      { id: 'be1',  label: 'User register + bcrypt password hash' },
      { id: 'be2',  label: 'User login → returns JWT' },
      { id: 'be3',  label: 'Employer register + login' },
      { id: 'be4',  label: 'Job CRUD (create, read, update, delete)' },
      { id: 'be5',  label: 'Job listing with filters + pagination' },
      { id: 'be6',  label: 'Submit job application endpoint' },
      { id: 'be7',  label: 'Employer: view applications, update status' },
      { id: 'be8',  label: 'File upload for resumes (Multer)' },
      { id: 'be9',  label: 'Email notification on apply (Nodemailer)' },
      { id: 'be10', label: 'Input validation on all routes (Zod)' },
      { id: 'be11', label: 'Centralized error handler' },
      { id: 'be12', label: 'Rate limiting middleware' },
      { id: 'be13', label: 'All routes tested (Postman/Thunder)' },
    ],
  },
  auth: {
    label: 'Auth',
    color: 'var(--purple)',
    tasks: [
      { id: 'au1', label: 'JWT generation on login' },
      { id: 'au2', label: 'JWT verification middleware' },
      { id: 'au3', label: 'Refresh token implementation' },
      { id: 'au4', label: 'Refresh token rotation' },
      { id: 'au5', label: 'Role-based access (user vs employer)' },
      { id: 'au6', label: 'Protected routes on frontend' },
    ],
  },
  frontend: {
    label: 'Frontend',
    color: 'var(--green)',
    tasks: [
      { id: 'fe1',  label: 'Login + Register UI' },
      { id: 'fe2',  label: 'Job listing + search/filter' },
      { id: 'fe3',  label: 'Job detail page' },
      { id: 'fe4',  label: 'User dashboard: applied jobs + statuses' },
      { id: 'fe5',  label: 'Employer dashboard: postings + applicants' },
      { id: 'fe6',  label: 'Application submit + file upload UI' },
      { id: 'fe7',  label: 'Profile management' },
      { id: 'fe8',  label: 'Loading states on all async actions' },
      { id: 'fe9',  label: 'Error states on all async actions' },
      { id: 'fe10', label: 'Responsive (mobile + desktop)' },
    ],
  },
  deployment: {
    label: 'Deployment',
    color: 'var(--amber)',
    tasks: [
      { id: 'dp1', label: 'Backend deployed (Render/Railway)' },
      { id: 'dp2', label: 'Frontend deployed (Vercel)' },
      { id: 'dp3', label: 'Env vars configured (not hardcoded)' },
      { id: 'dp4', label: 'Live URL fully working end-to-end' },
      { id: 'dp5', label: 'CORS configured for production URL' },
    ],
  },
  docs: {
    label: 'Docs',
    color: 'var(--teal)',
    tasks: [
      { id: 'dc1', label: 'README: description + purpose' },
      { id: 'dc2', label: 'README: tech stack' },
      { id: 'dc3', label: 'README: local setup instructions' },
      { id: 'dc4', label: 'README: env vars listed' },
      { id: 'dc5', label: 'README: screenshots' },
      { id: 'dc6', label: 'README: live URL shown prominently' },
    ],
  },
  resume: {
    label: 'Resume Value',
    color: 'var(--red)',
    tasks: [
      { id: 'rv1', label: 'Can explain full architecture verbally in 7 min' },
      { id: 'rv2', label: 'Can answer "why MongoDB over SQL?" with tradeoffs' },
      { id: 'rv3', label: 'Has 1 technical differentiator (realtime/analytics/AI)' },
      { id: 'rv4', label: 'Can answer "what would you do differently?"' },
      { id: 'rv5', label: 'Clean commit history (no "fix" or "asdf" messages)' },
      { id: 'rv6', label: 'GitHub activity graph shows consistent contribution' },
    ],
  },
};

// Ordered section keys — determines build sequence and "next task" logic.
export const HX_ORDER = ['database', 'backend', 'auth', 'frontend', 'deployment', 'docs', 'resume'] as const;

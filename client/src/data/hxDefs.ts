// ─────────────────────────────────────────────────────────────────────────────
// HireOnyx task definitions.
// Order of keys matters — it defines the recommended build sequence.
// Pure data — no logic.
// ─────────────────────────────────────────────────────────────────────────────

export interface HxTask {
  id: string;
  label: string;
  doneWhen: string;
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
      { id: 'db1', label: 'User schema (name, email, password hash, role)', doneWhen: 'Schema file committed. Connects to Atlas. Runs without error. No hardcoded data.' },
      { id: 'db2', label: 'Employer schema (company, email, description)', doneWhen: 'Schema committed. Connects to Atlas without error.' },
      { id: 'db3', label: 'Job schema (title, desc, requirements, salary, employerId)', doneWhen: 'Schema committed. All refs valid.' },
      { id: 'db4', label: 'Application schema (userId, jobId, resume, status, date)', doneWhen: 'Schema committed. All refs valid. Status enum defined.' },
      { id: 'db5', label: 'MongoDB Atlas configured and connected', doneWhen: 'App connects on npm start. No hardcoded strings in codebase.' },
      { id: 'db6', label: 'Indexes on commonly queried fields', doneWhen: 'Indexes visible in Atlas UI.' },
      { id: 'db7', label: 'Aggregation: top jobs query working', doneWhen: 'Query returns correct results. Tested in MongoDB Compass.' },
    ],
  },
  backend: {
    label: 'Backend',
    color: 'var(--blue)',
    tasks: [
      { id: 'be1',  label: 'User register + bcrypt password hash', doneWhen: 'POST /auth/register hashes password. User saved to DB.' },
      { id: 'be2',  label: 'User login → returns JWT', doneWhen: 'POST /auth/login returns valid JWT. Tested in Postman.' },
      { id: 'be3',  label: 'Employer register + login', doneWhen: 'Both routes working. Employer role set correctly.' },
      { id: 'be4',  label: 'Job CRUD (create, read, update, delete)', doneWhen: 'All 4 operations tested and working in Postman.' },
      { id: 'be5',  label: 'Job listing with filters + pagination', doneWhen: '/jobs?page=1&limit=10 returns correct paginated results.' },
      { id: 'be6',  label: 'Submit job application endpoint', doneWhen: 'POST /apply saves application with correct status.' },
      { id: 'be7',  label: 'Employer: view applications, update status', doneWhen: 'GET and PATCH both working correctly.' },
      { id: 'be8',  label: 'File upload for resumes (Multer)', doneWhen: 'File saved to storage. URL stored in application document.' },
      { id: 'be9',  label: 'Email notification on apply (Nodemailer)', doneWhen: 'Email sent to employer on new application.' },
      { id: 'be10', label: 'Input validation on all routes (Zod)', doneWhen: 'Invalid inputs return 400 with clear error messages.' },
      { id: 'be11', label: 'Centralized error handler', doneWhen: 'All unhandled errors caught. Consistent error response shape.' },
      { id: 'be12', label: 'Rate limiting middleware', doneWhen: 'Requests above limit return 429.' },
      { id: 'be13', label: 'All routes tested (Postman/Thunder)', doneWhen: 'Every route has at least one passing test case documented.' },
    ],
  },
  auth: {
    label: 'Auth',
    color: 'var(--purple)',
    tasks: [
      { id: 'au1', label: 'JWT generation on login', doneWhen: 'Login returns signed JWT. Payload contains userId and role.' },
      { id: 'au2', label: 'JWT verification middleware', doneWhen: 'Protected route returns 401 without token, 200 with valid token. req.user populated.' },
      { id: 'au3', label: 'Refresh token implementation', doneWhen: 'Refresh token issued on login. Stored securely (httpOnly cookie or DB).' },
      { id: 'au4', label: 'Refresh token rotation', doneWhen: 'Old refresh token invalidated on use. New token issued.' },
      { id: 'au5', label: 'Role-based access (user vs employer)', doneWhen: 'Employer-only routes return 403 for user role.' },
      { id: 'au6', label: 'Protected routes on frontend', doneWhen: 'Unauthenticated users redirected to login. Token stored and sent on requests.' },
    ],
  },
  frontend: {
    label: 'Frontend',
    color: 'var(--green)',
    tasks: [
      { id: 'fe1',  label: 'Login + Register UI', doneWhen: 'Forms submit. Errors displayed. Redirects on success.' },
      { id: 'fe2',  label: 'Job listing + search/filter', doneWhen: 'Jobs load. Search and filters work. Pagination functional.' },
      { id: 'fe3',  label: 'Job detail page', doneWhen: 'All fields displayed. Apply button visible.' },
      { id: 'fe4',  label: 'User dashboard: applied jobs + statuses', doneWhen: 'Lists all applications with current status.' },
      { id: 'fe5',  label: 'Employer dashboard: postings + applicants', doneWhen: 'Employer sees their jobs and applicant list.' },
      { id: 'fe6',  label: 'Application submit + file upload UI', doneWhen: 'File upload works. Confirmation shown after submission.' },
      { id: 'fe7',  label: 'Profile management', doneWhen: 'User can view and update their profile. Changes persist.' },
      { id: 'fe8',  label: 'Loading states on all async actions', doneWhen: 'Spinner or skeleton shown during every network call.' },
      { id: 'fe9',  label: 'Error states on all async actions', doneWhen: 'User-facing error message shown on failure. No silent failures.' },
      { id: 'fe10', label: 'Responsive (mobile + desktop)', doneWhen: 'App usable on 375px and 1280px. No horizontal scroll on mobile.' },
    ],
  },
  deployment: {
    label: 'Deployment',
    color: 'var(--amber)',
    tasks: [
      { id: 'dp1', label: 'Backend deployed (Render/Railway)', doneWhen: 'API accessible at public URL. No errors on /health endpoint.' },
      { id: 'dp2', label: 'Frontend deployed (Vercel)', doneWhen: 'App loads from Vercel URL. API calls work.' },
      { id: 'dp3', label: 'Env vars configured (not hardcoded)', doneWhen: 'No hardcoded strings. App works end-to-end.' },
      { id: 'dp4', label: 'Live URL fully working end-to-end', doneWhen: 'Register → login → post job → apply flow completes without error.' },
      { id: 'dp5', label: 'CORS configured for production URL', doneWhen: 'Frontend origin whitelisted. No CORS errors in production.' },
    ],
  },
  docs: {
    label: 'Docs',
    color: 'var(--teal)',
    tasks: [
      { id: 'dc1', label: 'README: description + purpose', doneWhen: 'One paragraph explains what HireOnyx does and who it is for.' },
      { id: 'dc2', label: 'README: tech stack', doneWhen: 'All major dependencies listed with brief reason for each choice.' },
      { id: 'dc3', label: 'README: local setup instructions', doneWhen: 'Clone → install → env → run works without assistance.' },
      { id: 'dc4', label: 'README: env vars listed', doneWhen: 'All required env vars listed with descriptions. No secrets committed.' },
      { id: 'dc5', label: 'README: screenshots', doneWhen: 'At least 3 screenshots showing key UI states.' },
      { id: 'dc6', label: 'README: live URL shown prominently', doneWhen: 'Live link is the first thing visible in README.' },
    ],
  },
  resume: {
    label: 'Resume Value',
    color: 'var(--red)',
    tasks: [
      { id: 'rv1', label: 'Can explain full architecture verbally in 7 min', doneWhen: 'Recorded walkthrough. No notes. Under 7 min. Coherent.' },
      { id: 'rv2', label: 'Can answer "why MongoDB over SQL?" with tradeoffs', doneWhen: 'Answer covers schema flexibility, horizontal scaling, and the specific tradeoffs for a job board.' },
      { id: 'rv3', label: 'Has 1 technical differentiator (realtime/analytics/AI)', doneWhen: 'One feature exists that goes beyond standard CRUD. Deployed and working.' },
      { id: 'rv4', label: 'Can answer "what would you do differently?"', doneWhen: 'Answer is specific, honest, and shows architectural maturity.' },
      { id: 'rv5', label: 'Clean commit history (no "fix" or "asdf" messages)', doneWhen: 'Git log shows descriptive commits. No squashing needed.' },
      { id: 'rv6', label: 'GitHub activity graph shows consistent contribution', doneWhen: 'Visible commits across at least 4 weeks on the graph.' },
    ],
  },
};

// Ordered section keys — determines build sequence and "next task" logic.
export const HX_ORDER = ['database', 'backend', 'auth', 'frontend', 'deployment', 'docs', 'resume'] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Matrix tab — composes CompanyMatrix and PipelineTracker.
// No logic here. Each sub-component owns its own state access and handlers.
// ─────────────────────────────────────────────────────────────────────────────

import { CompanyMatrix } from './CompanyMatrix';
import { PipelineTracker } from './PipelineTracker';

export function Matrix() {
  return (
    <div>
      <CompanyMatrix />
      <PipelineTracker />
    </div>
  );
}

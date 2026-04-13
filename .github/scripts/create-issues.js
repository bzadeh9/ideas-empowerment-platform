#!/usr/bin/env node
/**
 * create-issues.js
 *
 * Creates the full set of GitHub Issues and sub-issues for the
 * Ideas Empowerment Platform implementation plan.
 *
 * Run via the `.github/workflows/create-issues.yml` workflow_dispatch trigger.
 * Requires: GH_TOKEN env var with `issues: write` and `contents: write` permissions.
 */

'use strict';

const https = require('https');

const REPO = process.env.GITHUB_REPOSITORY; // "owner/repo"
const TOKEN = process.env.GH_TOKEN;

if (!REPO || !TOKEN) {
  console.error('Missing GITHUB_REPOSITORY or GH_TOKEN environment variables.');
  process.exit(1);
}

const [OWNER, REPO_NAME] = REPO.split('/');

// ---------------------------------------------------------------------------
// GitHub REST helpers
// ---------------------------------------------------------------------------

function ghRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path,
      method,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'User-Agent': 'create-issues-script/1.0',
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(raw));
        } else {
          reject(new Error(`GitHub API ${method} ${path} → ${res.statusCode}: ${raw}`));
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function createIssue(title, body, labels = []) {
  const issue = await ghRequest('POST', `/repos/${OWNER}/${REPO_NAME}/issues`, {
    title,
    body,
    labels,
  });
  console.log(`  ✅  Created #${issue.number}: ${title}`);
  return issue;
}

async function updateIssue(number, body) {
  await ghRequest('PATCH', `/repos/${OWNER}/${REPO_NAME}/issues/${number}`, { body });
  console.log(`  🔄  Updated #${number}`);
}

// ---------------------------------------------------------------------------
// Issue definitions
// ---------------------------------------------------------------------------

function parentBody(subIssueLinks) {
  return `## Overview

This is the master tracking issue for the Ideas Empowerment Platform implementation plan.
It maps directly to [\`IMPLEMENTATION_PLAN.md\`](../blob/main/IMPLEMENTATION_PLAN.md) and the detailed
[\`APP_ENHANCEMENT_IMPLEMENTATION_PLAN\`](../blob/main/APP_ENHANCEMENT_IMPLEMENTATION_PLAN).

## Goal
Deliver a production-ready ideas-to-prototype platform with persistence, collaboration, enterprise controls, and improved generation quality.

## Delivery Principles
- Ship in phases with measurable outcomes.
- Keep changes backward-compatible where possible.
- Validate each phase with tests and CI before moving forward.

## Sub-issues

${subIssueLinks}

## References
- [IMPLEMENTATION_PLAN.md](../blob/main/IMPLEMENTATION_PLAN.md)
- [APP_ENHANCEMENT_IMPLEMENTATION_PLAN](../blob/main/APP_ENHANCEMENT_IMPLEMENTATION_PLAN)
`;
}

const subIssues = [
  // -------------------------------------------------------------------------
  // PHASE 1
  // -------------------------------------------------------------------------
  {
    title: 'Phase 1: Project Persistence & History',
    labels: ['enhancement', 'phase-1', 'high-priority'],
    body: (parentNum) => `## Parent Issue
#${parentNum}

## Overview
Currently, all work is lost when a session ends. Sandboxes are ephemeral and there is no save/load functionality. The README promises "ideas into working PoC" but there is no way to revisit or iterate on previously created ideas. This issue implements persistent project storage so users can save, reopen, duplicate, and delete their projects.

## Problem Statement
- Every browser refresh destroys the entire working session (chat history, generated files, sandbox state).
- There is no concept of a "project" — everything lives in ephemeral React/Zustand state.
- Auto-save, version history, and duplicate/delete flows are completely absent.

## What to Build

### 1. Project Data Model
Define a \`Project\` TypeScript interface in \`lib/storage/types.ts\`:
\`\`\`ts
interface Project {
  id: string;                  // nanoid-generated UUID
  title: string;               // user-provided or auto-generated from first prompt
  description: string;         // the original idea text
  chatHistory: Message[];      // full chat message array
  fileManifest: FileEntry[];   // list of generated files
  sandboxConfig: SandboxConfig;// sandbox ID + container config
  status: 'draft' | 'in-progress' | 'complete';
  createdAt: string;           // ISO 8601
  updatedAt: string;           // ISO 8601
}
\`\`\`

### 2. Storage Layer (IndexedDB via Dexie)
- Add \`dexie\` as a dependency (\`pnpm add dexie\`).
- Create \`lib/storage/project-store.ts\` with a \`ProjectStore\` class that wraps Dexie and exposes:
  - \`create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>\`
  - \`getAll(): Promise<ProjectSummary[]>\`
  - \`getById(id: string): Promise<Project | undefined>\`
  - \`update(id: string, patch: Partial<Project>): Promise<void>\`
  - \`delete(id: string): Promise<void>\`
- Design using an adapter/interface pattern (\`IProjectStore\`) so a server-side adapter (Supabase, Vercel KV) can be swapped in later without touching UI code.

### 3. My Projects Dashboard (\`app/projects/page.tsx\`)
- Route: \`/projects\`
- Server component that renders a responsive card grid of saved projects.
- Each card shows: title, description excerpt (100 chars), last-modified relative date, status badge, and action buttons (Open, Duplicate, Delete).
- Empty state with a CTA to start a new idea.

### 4. Project Card Component (\`components/projects/project-card.tsx\`)
- shadcn/ui \`Card\` base, styled with Tailwind.
- Accepts a \`ProjectSummary\` prop.
- Open button navigates to \`/?projectId={id}\`.
- Delete shows a confirmation dialog before removing.

### 5. Save Project Dialog (\`components/projects/save-project-dialog.tsx\`)
- Modal triggered by a "Save" button in the chat/header area.
- Fields: project title (pre-filled from first message), optional description.
- On confirm: serializes current Zustand store + chat context and calls \`ProjectStore.create()\`.

### 6. Open Project Flow
- Modify \`app/page.tsx\` (or a new route) to accept \`?projectId=\` query param.
- On load: fetch project from IndexedDB, restore chat history and file tree into Zustand.
- If the original sandbox ID is stale, prompt the user to "Recreate Sandbox" (call \`createSandbox\` tool again).

### 7. Auto-Save
- Modify \`app/state.ts\` to subscribe to key state changes.
- Trigger a debounced (2 s) \`ProjectStore.update()\` call after: sandbox created, files generated, command run successfully.
- Show a subtle "Saved" indicator in the header.

## Files to Create / Modify
| File | Action |
|------|--------|
| \`lib/storage/types.ts\` | Create — TypeScript interfaces |
| \`lib/storage/project-store.ts\` | Create — IndexedDB adapter (Dexie) |
| \`app/projects/page.tsx\` | Create — Projects dashboard |
| \`components/projects/project-card.tsx\` | Create — Card component |
| \`components/projects/save-project-dialog.tsx\` | Create — Save dialog |
| \`app/header.tsx\` | Modify — Add "My Projects" nav link |
| \`app/state.ts\` | Modify — Add project ID, auto-save hooks |
| \`lib/chat-context.tsx\` | Modify — Add serialization/deserialization |

## Testing Requirements
- Unit tests for \`ProjectStore\` CRUD (mock IndexedDB with \`fake-indexeddb\`).
- Unit tests for chat state serialization/deserialization round-trip.
- E2E test (\`e2e/project-persistence.spec.ts\`): create project → navigate away → return → verify project persists.
- Target: maintain ≥90% unit-test coverage threshold.

## Acceptance Criteria
- [ ] Users can save a named project from any active session.
- [ ] The /projects dashboard lists all saved projects with correct metadata.
- [ ] Opening a project restores chat history and file tree.
- [ ] Auto-save fires within 2 s of a meaningful state change.
- [ ] Duplicate and delete flows work correctly with confirmation UX.
- [ ] All new code is covered by unit tests.
- [ ] Changeset generated for this PR.

## Dependencies
None (first Phase 1 feature — can be implemented independently).

## References
- [IMPLEMENTATION_PLAN.md § Phase 1 — Project Persistence & History](../blob/main/IMPLEMENTATION_PLAN.md)
- [APP_ENHANCEMENT_IMPLEMENTATION_PLAN § Feature 1.1](../blob/main/APP_ENHANCEMENT_IMPLEMENTATION_PLAN)
- [Dexie.js docs](https://dexie.org/)
`,
  },
  {
    title: 'Phase 1: Structured Idea Input & Templates',
    labels: ['enhancement', 'phase-1', 'high-priority'],
    body: (parentNum) => `## Parent Issue
#${parentNum}

## Overview
The current interface only supports free-form text prompts. Market research shows that structured input (guided wizard + categorized templates) dramatically improves AI output quality and lowers the barrier for non-technical users. This issue implements an Idea Wizard and a Template Gallery to make ideation more guided and effective.

## Problem Statement
- Free-form text prompts produce inconsistent quality; users who don't know what to say are stuck at a blank input.
- There are only 2 test prompts in \`ai/constants.ts\` — far too few to showcase platform capabilities.
- Competitors (Lovable.dev, IdeaScale) all provide structured input with guided templates that outperform blank-canvas prompts.

## What to Build

### 1. Idea Wizard (\`components/idea-wizard/\`)
A guided multi-step form that replaces or augments the welcome modal. Steps:

| Step | Component | Fields |
|------|-----------|--------|
| 1 — Problem | \`step-problem.tsx\` | Idea title, problem statement (textarea) |
| 2 — Audience | \`step-audience.tsx\` | Target users, primary use case |
| 3 — Tech | \`step-tech.tsx\` | Frontend only / Full-stack / API, preferred language |
| 4 — Style | \`step-style.tsx\` | Visual style (minimal/modern/enterprise/playful), color preference |

- Uses shadcn/ui \`Dialog\` or \`Sheet\` wrapper with a progress indicator.
- "Back" / "Next" / "Generate" buttons; "Generate" fires the composed prompt.
- All fields are optional with sensible defaults.

### 2. Prompt Composer (\`lib/prompt-composer.ts\`)
\`\`\`ts
function composePrompt(wizardInput: WizardInput): string
\`\`\`
- Takes the wizard's structured inputs and produces an optimized AI prompt.
- Uses a template system (string interpolation over a base template).
- Exported and unit-tested independently of UI.

### 3. Template Gallery (\`components/templates/\`)
- \`template-gallery.tsx\` — A responsive grid of template cards, grouped by category.
- \`template-card.tsx\` — Thumbnail, title, short description, and "Use Template" CTA.
- Categories: Internal Dashboard, Customer Portal, Data Visualization, Workflow Automation, Landing Page, API Service, Mobile App, Chatbot.

### 4. Expanded Test Prompts (\`ai/constants.ts\`)
- Expand \`TEST_PROMPTS\` from 2 to ≥8 diverse templates.
- Each entry: \`{ id, category, title, prompt, description }\`.

### 5. Refine Idea Button
- Add a "✨ Refine Idea" button in the chat toolbar.
- Opens a simplified 1-step prompt refinement dialog that lets users adjust their initial idea description and re-runs the prompt composer.

## Files to Create / Modify
| File | Action |
|------|--------|
| \`components/idea-wizard/idea-wizard.tsx\` | Create — Wizard shell |
| \`components/idea-wizard/step-problem.tsx\` | Create — Step 1 |
| \`components/idea-wizard/step-audience.tsx\` | Create — Step 2 |
| \`components/idea-wizard/step-tech.tsx\` | Create — Step 3 |
| \`components/idea-wizard/step-style.tsx\` | Create — Step 4 |
| \`lib/prompt-composer.ts\` | Create — Prompt composition logic |
| \`components/templates/template-gallery.tsx\` | Create — Gallery grid |
| \`components/templates/template-card.tsx\` | Create — Template card |
| \`ai/constants.ts\` | Modify — Expand TEST_PROMPTS |
| \`app/chat.tsx\` | Modify — Integrate wizard & gallery triggers |

## Testing Requirements
- Unit tests for \`composePrompt()\` covering all input combinations (empty, partial, full).
- Component tests for wizard step navigation (next/back, keyboard).
- Snapshot tests for \`TemplateCard\` rendering.
- Target: maintain ≥90% unit-test coverage threshold.

## Acceptance Criteria
- [ ] Idea Wizard opens from a CTA on the welcome screen and from the chat toolbar.
- [ ] All 4 wizard steps render correctly and navigation works.
- [ ] \`composePrompt()\` returns a meaningful, non-empty string for all input combinations.
- [ ] Template gallery shows ≥8 templates across ≥4 categories.
- [ ] "Use Template" pre-fills the chat input and starts generation.
- [ ] Refine Idea button is visible and functional in the chat toolbar.
- [ ] Changeset generated for this PR.

## Dependencies
- Phase 1: Project Persistence (#8) — wizard output can optionally trigger auto-save, but is not blocked by it.

## References
- [IMPLEMENTATION_PLAN.md § Phase 1 — Structured Idea Input](../blob/main/IMPLEMENTATION_PLAN.md)
- [APP_ENHANCEMENT_IMPLEMENTATION_PLAN § Feature 1.2](../blob/main/APP_ENHANCEMENT_IMPLEMENTATION_PLAN)
`,
  },
  {
    title: 'Phase 1: Deployment Flow',
    labels: ['enhancement', 'phase-1', 'high-priority'],
    body: (parentNum) => `## Parent Issue
#${parentNum}

## Overview
The README lists deployment to Vercel, AWS, Google Cloud, and Azure as a core feature, but the current platform has no in-app deploy integration. Generated apps exist only inside the ephemeral Vercel Sandbox. This issue implements a full deployment workflow: ZIP export, Vercel deploy guidance, and CLI instructions for other cloud providers.

## Problem Statement
- The "Deploy" button mentioned in the README does not exist in the app.
- Generated apps are lost when the sandbox terminates.
- There is no way to export or ship the generated code to a live environment.

## What to Build

### 1. Deploy Button
- Add a "🚀 Deploy" button to the preview panel header (\`components/preview/preview.tsx\`).
- Opens a \`DeployDialog\` modal.

### 2. Deploy Dialog (\`components/deploy/deploy-dialog.tsx\`)
A modal with three deployment paths:

| Tab | Component | Description |
|-----|-----------|-------------|
| Export ZIP | \`export-zip.tsx\` | Download all sandbox files as a .zip |
| Deploy to Vercel | \`deploy-vercel.tsx\` | Guided GitHub push + Vercel link flow |
| Other Providers | \`deploy-instructions.tsx\` | Copy-paste CLI commands for AWS/GCP/Azure |

### 3. ZIP Export (\`components/deploy/export-zip.tsx\`)
- Uses \`jszip\` (\`pnpm add jszip\`) or the \`CompressionStream\` Web API to package all files from the sandbox file manifest.
- Server route \`app/api/deploy/route.ts\` reads sandbox files and returns a zip buffer.
- Client-side: triggers a browser download of the \`.zip\` file.

### 4. Vercel Deployment Flow (\`components/deploy/deploy-vercel.tsx\`)
Step-by-step guided modal:
1. "Connect GitHub" — directs user to authenticate with GitHub (for personal repos).
2. "Push to Repository" — calls the server route to push files to a new/existing GitHub repo via GitHub API.
3. "Import to Vercel" — deep-link to \`https://vercel.com/import/git\` with the repo pre-filled.
- Alternatively (simpler v1): provide clear manual instructions + the "Deploy with Vercel" button targeting the exported repo.

### 5. CLI Instructions for Other Providers (\`components/deploy/deploy-instructions.tsx\`)
- Detects the project's tech stack (from file manifest / framework config).
- Renders copy-pasteable CLI snippets for:
  - **AWS Amplify**: \`amplify init && amplify publish\`
  - **Google Cloud Run**: \`gcloud run deploy --source .\`
  - **Azure Static Web Apps**: \`az staticwebapp create ...\`
- Each snippet is in a \`<code>\` block with a copy button.

### 6. AI Export Tool (\`ai/tools/export-files.ts\`)
A new AI tool that the agent can call to package all sandbox files:
\`\`\`ts
export async function exportFiles(sandboxId: string): Promise<FileBundle>
\`\`\`

### 7. Deployment Status Indicator
- Add a small badge to the project card and preview header showing if/where a project has been deployed.
- Stored in project metadata (modify \`Project\` model from Phase 1).

## Files to Create / Modify
| File | Action |
|------|--------|
| \`components/deploy/deploy-dialog.tsx\` | Create — Main deployment modal |
| \`components/deploy/export-zip.tsx\` | Create — ZIP download |
| \`components/deploy/deploy-vercel.tsx\` | Create — Vercel flow |
| \`components/deploy/deploy-instructions.tsx\` | Create — CLI instructions |
| \`app/api/deploy/route.ts\` | Create — Server route to package files |
| \`ai/tools/export-files.ts\` | Create — AI tool for file export |
| \`components/preview/preview.tsx\` | Modify — Add Deploy button |

## Testing Requirements
- Unit tests for file packaging logic (mock sandbox file responses).
- Unit tests for CLI instruction generation (various stacks).
- E2E test: generate app → click Deploy → download ZIP → verify ZIP contains expected files.
- Target: maintain ≥90% unit-test coverage threshold.

## Acceptance Criteria
- [ ] Deploy button is visible in the preview header after files are generated.
- [ ] ZIP download produces a valid archive containing all generated project files.
- [ ] Vercel deployment guidance is clear and actionable.
- [ ] CLI instructions are rendered for AWS, GCP, and Azure.
- [ ] Copy button on code snippets works correctly.
- [ ] Changeset generated for this PR.

## Dependencies
- Phase 1: Project Persistence (#8) — optional; deployment status stored in Project model if available.

## References
- [IMPLEMENTATION_PLAN.md § Phase 1 — Deployment Flow](../blob/main/IMPLEMENTATION_PLAN.md)
- [APP_ENHANCEMENT_IMPLEMENTATION_PLAN § Feature 1.3](../blob/main/APP_ENHANCEMENT_IMPLEMENTATION_PLAN)
- [JSZip](https://stuk.github.io/jszip/)
`,
  },

  // -------------------------------------------------------------------------
  // PHASE 2
  // -------------------------------------------------------------------------
  {
    title: 'Phase 2: Authentication & Accounts',
    labels: ['enhancement', 'phase-2', 'high-priority'],
    body: (parentNum) => `## Parent Issue
#${parentNum}

## Overview
The platform has zero authentication. The README targets businesses but there is no concept of users, teams, or permissions. The codebase already has \`arctic\` (OAuth) and \`jose\` (JWT) as installed dependencies. This issue implements OAuth login, JWT session management, protected routes, and a user profile menu.

## Problem Statement
- Any visitor can access all platform features with no identity.
- The \`arctic@3.7.0\` and \`jose@6.0.12\` packages are installed but completely unused.
- API routes (\`/api/chat\`, \`/api/sandboxes/*\`) are fully public with no rate limiting or per-user attribution.
- Without authentication there can be no collaboration, project ownership, or enterprise governance.

## What to Build

### 1. OAuth Providers
Using the installed \`arctic\` library, implement:
- **GitHub OAuth** — most relevant for developer users.
- **Google OAuth** — broadest enterprise coverage.
- Configuration lives in \`lib/auth/providers.ts\`; credentials stored in environment variables.

### 2. JWT Session Management (\`lib/auth/session.ts\`)
Using the installed \`jose\` library:
- \`createSession(user: User): Promise<string>\` — sign a JWT (HS256, 7-day expiry).
- \`verifySession(token: string): Promise<SessionPayload | null>\` — verify and decode.
- \`getSession(request: NextRequest): Promise<SessionPayload | null>\` — read from \`HttpOnly\` cookie.
- Middleware (\`middleware.ts\`) protects all non-public routes.

### 3. User Model (\`lib/auth/types.ts\`)
\`\`\`ts
interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  provider: 'github' | 'google';
  role: 'user' | 'admin';
  createdAt: string;
}
\`\`\`

### 4. Auth Routes
| Route | Description |
|-------|-------------|
| \`GET /login\` | Login page with OAuth provider buttons |
| \`GET /api/auth/github\` | Redirect to GitHub OAuth |
| \`GET /api/auth/github/callback\` | Handle GitHub OAuth callback |
| \`GET /api/auth/google\` | Redirect to Google OAuth |
| \`GET /api/auth/google/callback\` | Handle Google OAuth callback |
| \`GET /api/auth/session\` | Return current session info |
| \`POST /api/auth/logout\` | Clear session cookie |

### 5. User Storage
- Initially use a lightweight JSON-based store in Vercel KV (or a simple in-memory map for local dev).
- Reuse the adapter/interface pattern from Phase 1 (\`IProjectStore\`).
- \`lib/auth/user-store.ts\` with \`findOrCreate(oauthProfile): Promise<User>\`.

### 6. Header User Menu (\`components/auth/user-menu.tsx\`)
- Shows avatar + display name when logged in.
- Dropdown: "My Projects", "Settings", "Sign Out".
- Shows "Sign In" button when logged out.

### 7. Protected Routes
- Modify \`app/api/chat/route.ts\` and sandbox routes to check session; return \`401\` if unauthenticated.
- Add \`middleware.ts\` at the root to redirect unauthenticated users trying to access \`/projects/*\` and \`/admin/*\`.

### 8. Environment Variables
Add to \`.env.example\`:
\`\`\`
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
JWT_SECRET=           # 32+ random bytes, base64-encoded
\`\`\`

## Files to Create / Modify
| File | Action |
|------|--------|
| \`app/login/page.tsx\` | Create — Login page |
| \`app/api/auth/[provider]/route.ts\` | Create — OAuth redirect |
| \`app/api/auth/[provider]/callback/route.ts\` | Create — OAuth callback |
| \`app/api/auth/session/route.ts\` | Create — Session endpoint |
| \`lib/auth/session.ts\` | Create — JWT helpers |
| \`lib/auth/providers.ts\` | Create — Arctic OAuth config |
| \`lib/auth/types.ts\` | Create — User/Session types |
| \`lib/auth/user-store.ts\` | Create — User persistence |
| \`components/auth/user-menu.tsx\` | Create — Header menu |
| \`components/auth/login-button.tsx\` | Create — OAuth button |
| \`app/header.tsx\` | Modify — Add user menu |
| \`app/api/chat/route.ts\` | Modify — Auth check |
| \`middleware.ts\` | Create or modify — Route protection |
| \`.env.example\` | Modify — Add auth env vars |

## Testing Requirements
- Unit tests for \`createSession()\` and \`verifySession()\` (mock jose).
- Unit tests for auth middleware (mock NextRequest with/without cookie).
- E2E test: OAuth callback flow with mocked provider → protected route access → logout.

## Acceptance Criteria
- [ ] GitHub and Google OAuth logins work end-to-end.
- [ ] Session cookie is \`HttpOnly\`, \`Secure\` in production, with 7-day expiry.
- [ ] Unauthenticated requests to \`/api/chat\` return \`401\`.
- [ ] User menu shows avatar and name when logged in.
- [ ] Sign Out clears the session and redirects to \`/login\`.
- [ ] All credentials stored in env vars only — none hardcoded.
- [ ] Changeset generated for this PR.

## Dependencies
- Phase 1: Project Persistence (#8) — user ID will be added to the Project model.

## References
- [IMPLEMENTATION_PLAN.md § Phase 2 — Authentication](../blob/main/IMPLEMENTATION_PLAN.md)
- [APP_ENHANCEMENT_IMPLEMENTATION_PLAN § Feature 2.1](../blob/main/APP_ENHANCEMENT_IMPLEMENTATION_PLAN)
- [Arctic OAuth library](https://arcticjs.dev/)
- [jose JWT library](https://github.com/panva/jose)
`,
  },
  {
    title: 'Phase 2: Sharing, Comments & Voting',
    labels: ['enhancement', 'phase-2', 'high-priority'],
    body: (parentNum) => `## Parent Issue
#${parentNum}

## Overview
The README promises a platform that "benefits the whole organization" and enables "staff at every level to contribute ideas," but there is no way to share ideas or collaborate. Market research confirms collaboration is the #1 differentiator for enterprise innovation platforms (Brightidea, IdeaScale). This issue adds shareable project links, read-only views, comment threads, upvoting, and an activity feed.

## Problem Statement
- Projects are completely private and non-shareable.
- There is no feedback mechanism — no way to comment or endorse an idea.
- Without social signals (votes, comments), good ideas remain invisible to the organisation.

## What to Build

### 1. Shareable Project URL
- Shared link format: \`/projects/{id}/view\`
- Three visibility levels stored on the \`Project\` model:
  - \`private\` — creator only (default)
  - \`team\` — organisation members
  - \`public\` — anyone with the link
- \`ShareDialog\` (\`components/projects/share-dialog.tsx\`) lets the owner toggle visibility and copy the link.

### 2. Shared Project View (\`app/projects/[id]/view/page.tsx\`)
Read-only presentation of a shared project:
- Idea title & description
- Chat history (read-only message log)
- File tree (expandable, no edit actions)
- Live preview iframe (if sandbox is still active) or a screenshot/placeholder
- Comment thread below
- Upvote button in the header

### 3. Comment Threads (\`components/projects/comment-thread.tsx\`)
- Threaded comments with timestamp and avatar.
- \`@mention\` support (basic — turns \`@username\` into a styled highlight).
- Author can delete their own comments; admin can delete any.
- Stored via \`lib/storage/comments-store.ts\` (IndexedDB or Vercel KV depending on storage phase).

### 4. API Routes for Comments
| Route | Method | Description |
|-------|--------|-------------|
| \`/api/projects/[id]/comments\` | GET | List comments for a project |
| \`/api/projects/[id]/comments\` | POST | Create a comment (auth required) |
| \`/api/projects/[id]/comments/[cid]\` | DELETE | Delete a comment (auth required) |

### 5. Upvoting (\`components/projects/upvote-button.tsx\`)
- Single upvote per authenticated user per project (toggle).
- Upvote count visible on project cards and shared view.
- \`/api/projects/[id]/vote\` POST/DELETE route.

### 6. Activity Feed (\`components/projects/activity-feed.tsx\`)
- Displayed on the \`/projects\` dashboard sidebar.
- Shows recent events across shared/team projects: "Alice submitted a new idea", "Bob commented on X", "Y was deployed".
- Powered by \`/api/activity\` route reading from an audit/events table.

## Files to Create / Modify
| File | Action |
|------|--------|
| \`app/projects/[id]/view/page.tsx\` | Create — Read-only shared view |
| \`components/projects/share-dialog.tsx\` | Create — Share settings modal |
| \`components/projects/comment-thread.tsx\` | Create — Comment UI |
| \`components/projects/upvote-button.tsx\` | Create — Upvote component |
| \`components/projects/activity-feed.tsx\` | Create — Activity stream |
| \`lib/storage/comments-store.ts\` | Create — Comment data model |
| \`app/api/projects/[id]/comments/route.ts\` | Create — Comments API |
| \`app/api/projects/[id]/vote/route.ts\` | Create — Vote API |
| \`lib/storage/types.ts\` | Modify — Add Comment, Vote types |

## Testing Requirements
- Unit tests for comment/vote storage adapters.
- Component tests for ShareDialog (visibility toggle, copy link).
- E2E test: create project → share (public) → open as another user → add comment → upvote → verify counts.

## Acceptance Criteria
- [ ] Sharing a project with "public" visibility makes it accessible without authentication.
- [ ] "Team" visibility restricts access to authenticated org members.
- [ ] Comment thread renders correctly and new comments appear without full page reload.
- [ ] Upvote button toggles and count updates optimistically.
- [ ] Activity feed shows the last 20 events from shared projects.
- [ ] Changeset generated for this PR.

## Dependencies
- Phase 2: Authentication (#11) — comments and votes require authenticated users.
- Phase 1: Project Persistence (#8) — projects must exist to be shared.

## References
- [IMPLEMENTATION_PLAN.md § Phase 2 — Sharing, Comments, Voting](../blob/main/IMPLEMENTATION_PLAN.md)
- [APP_ENHANCEMENT_IMPLEMENTATION_PLAN § Feature 2.2](../blob/main/APP_ENHANCEMENT_IMPLEMENTATION_PLAN)
`,
  },
  {
    title: 'Phase 2: Pipeline & Status Tracking',
    labels: ['enhancement', 'phase-2', 'high-priority'],
    body: (parentNum) => `## Parent Issue
#${parentNum}

## Overview
The README positions this as a platform for turning ideas into prototypes, but there is no concept of an idea lifecycle. Enterprise innovation platforms (Brightidea, IdeaScale) all have structured pipelines. This issue adds a formal pipeline status model, a Kanban board view, admin management, and analytics dashboards.

## Problem Statement
- Ideas have no status — there is no way to signal whether an idea is under development, complete, approved, or archived.
- There is no admin oversight of submitted ideas across the organisation.
- No analytics means no way to measure the platform's innovation output.

## What to Build

### 1. Pipeline Status Model (\`lib/storage/pipeline.ts\`)
Define the 7-stage lifecycle:
\`\`\`ts
type PipelineStatus =
  | 'idea'           // just submitted
  | 'in-development' // sandbox being built
  | 'prototype-ready'// generation complete
  | 'under-review'   // submitted for evaluation
  | 'approved'       // admin-approved
  | 'deployed'       // deployed to a live URL
  | 'archived';      // closed / not pursued
\`\`\`
- Define valid transitions: e.g. \`idea → in-development\`, \`prototype-ready → under-review\`.
- Add \`status\`, \`statusHistory\`, \`statusUpdatedAt\` fields to the \`Project\` model.

### 2. Kanban Board (\`app/projects/board/page.tsx\`)
- Route: \`/projects/board\`
- A horizontal scrollable Kanban view with one column per pipeline stage.
- Project cards are draggable between columns using \`@dnd-kit/core\` (\`pnpm add @dnd-kit/core @dnd-kit/sortable\`).
- Moving a card triggers a status transition (with optional justification note modal).

### 3. Status Badge (\`components/projects/status-badge.tsx\`)
- A small coloured badge showing the current status.
- Used in project cards, the shared project view, and the admin view.
- Uses CVA variants for each status.

### 4. Admin View
- Route: \`/admin/projects\`
- Accessible only to users with \`role === 'admin'\`.
- Data table showing all projects across all users, with filters: status, author, date range.
- Bulk-action buttons: "Approve", "Archive", "Request Changes".

### 5. Analytics Dashboard (\`app/projects/analytics/page.tsx\`)
- Route: \`/projects/analytics\`
- Charts (use \`recharts\` — \`pnpm add recharts\`):
  - Ideas submitted per week (line chart)
  - Ideas by status (donut chart)
  - Conversion rate: idea → deployed (funnel)
  - Top contributors (bar chart)

## Files to Create / Modify
| File | Action |
|------|--------|
| \`lib/storage/pipeline.ts\` | Create — Status model & transitions |
| \`app/projects/board/page.tsx\` | Create — Kanban board |
| \`app/projects/analytics/page.tsx\` | Create — Analytics |
| \`components/projects/kanban-board.tsx\` | Create — Board component |
| \`components/projects/kanban-column.tsx\` | Create — Column component |
| \`components/projects/status-badge.tsx\` | Create — Status badge |
| \`components/projects/analytics-charts.tsx\` | Create — Chart wrappers |
| \`lib/storage/types.ts\` | Modify — Add status fields to Project |
| \`app/admin/projects/page.tsx\` | Create — Admin project view |

## Testing Requirements
- Unit tests for pipeline transition validation (illegal transitions must throw).
- Component tests for Kanban board drag-and-drop interactions.
- E2E test: create project → drag to "under-review" → verify status badge updates → check analytics reflect change.

## Acceptance Criteria
- [ ] All 7 pipeline stages render as Kanban columns.
- [ ] Drag-and-drop moves projects between valid stages only; invalid moves are rejected.
- [ ] Status change persists after page reload.
- [ ] Admin view shows all org projects with working filters.
- [ ] Analytics charts render with correct data.
- [ ] Changeset generated for this PR.

## Dependencies
- Phase 2: Authentication (#11) — admin view requires role-based access.
- Phase 1: Project Persistence (#8) — status is stored on the Project model.

## References
- [IMPLEMENTATION_PLAN.md § Phase 2 — Pipeline & Status Tracking](../blob/main/IMPLEMENTATION_PLAN.md)
- [APP_ENHANCEMENT_IMPLEMENTATION_PLAN § Feature 2.3](../blob/main/APP_ENHANCEMENT_IMPLEMENTATION_PLAN)
- [@dnd-kit](https://dndkit.com/)
`,
  },

  // -------------------------------------------------------------------------
  // PHASE 3
  // -------------------------------------------------------------------------
  {
    title: 'Phase 3: Multi-Framework Generation',
    labels: ['enhancement', 'phase-3', 'medium-priority'],
    body: (parentNum) => `## Parent Issue
#${parentNum}

## Overview
The AI system prompt currently defaults all generation to Next.js. Competitors (Bolt.new) support React, Vue, Svelte, Express, Python Flask, FastAPI, and more. This issue adds a framework selector UI and a modular prompt template system so users can choose their target stack.

## Problem Statement
- \`app/api/chat/prompt.md\` hard-codes Next.js version constraints, patterns, and file conventions.
- Users with Vue, Python, or Express requirements are forced into a Next.js output that doesn't fit their needs.
- There is no mechanism for per-framework sandbox configuration or starter files.

## What to Build

### 1. Framework Definitions (\`ai/frameworks.ts\`)
\`\`\`ts
interface Framework {
  id: string;         // 'nextjs' | 'react-vite' | 'vue' | 'svelte' | 'express' | 'flask' | 'fastapi' | 'static'
  label: string;
  description: string;
  promptFile: string; // relative path within ai/prompts/
  starterDeps: string[];
  sandboxImage?: string;
}
\`\`\`

### 2. Modular Prompt Templates (\`ai/prompts/\`)
Split the monolithic \`prompt.md\` into a composable system:
\`\`\`
ai/prompts/
  base.md          — Universal rules (loop prevention, file ops, error handling)
  nextjs.md        — Next.js 15 conventions (current default)
  react-vite.md    — React 18 + Vite
  vue.md           — Vue 3 + Vite
  svelte.md        — SvelteKit
  express.md       — Express.js REST API
  python.md        — Python Flask + FastAPI shared rules
\`\`\`
Final prompt = \`base.md\` + framework-specific file, loaded in \`app/api/chat/route.ts\`.

### 3. Framework Selector UI (\`components/settings/framework-selector.tsx\`)
- A \`Select\` or \`RadioGroup\` (shadcn/ui) in the Settings panel.
- Shows framework name, description, and icon.
- Persisted in \`localStorage\` (follows existing settings patterns).
- Changing framework after generation shows a warning: "Changing framework will reset the current project."

### 4. Sandbox Creation Updates (\`ai/tools/create-sandbox.ts\`)
- Accept a \`frameworkId\` parameter.
- Install framework-appropriate base dependencies on sandbox creation.
- Pre-populate starter files for the chosen framework.

### 5. File Generation Updates (\`ai/tools/generate-files.ts\`)
- Use the active framework's file conventions when generating code.
- Validate generated file extensions against framework expectations.

## Files to Create / Modify
| File | Action |
|------|--------|
| \`ai/frameworks.ts\` | Create — Framework definitions |
| \`ai/prompts/base.md\` | Create — Shared base prompt |
| \`ai/prompts/nextjs.md\` | Create — Next.js prompt (extract from current prompt.md) |
| \`ai/prompts/react-vite.md\` | Create |
| \`ai/prompts/vue.md\` | Create |
| \`ai/prompts/svelte.md\` | Create |
| \`ai/prompts/express.md\` | Create |
| \`ai/prompts/python.md\` | Create |
| \`components/settings/framework-selector.tsx\` | Create |
| \`ai/tools/create-sandbox.ts\` | Modify — Accept frameworkId |
| \`ai/tools/generate-files.ts\` | Modify — Framework-aware generation |
| \`app/api/chat/route.ts\` | Modify — Load framework prompt |

## Testing Requirements
- Unit tests for framework definitions (all fields present and valid).
- Unit tests for prompt template loading and composition.
- Integration test per framework: select framework → generate minimal project → verify framework-specific files created (e.g., \`vite.config.ts\` for React+Vite, \`package.json\` with \`vue\` for Vue).

## Acceptance Criteria
- [ ] Framework selector is visible in Settings and persists across page reloads.
- [ ] All 8 frameworks have a corresponding prompt template.
- [ ] Generated code matches the chosen framework's conventions.
- [ ] Switching framework shows a warning dialog.
- [ ] Changeset generated for this PR.

## Dependencies
- None — can be built independently. Benefits from Phase 1 (users can save multi-framework projects).

## References
- [IMPLEMENTATION_PLAN.md § Phase 3 — Multi-Framework Generation](../blob/main/IMPLEMENTATION_PLAN.md)
- [APP_ENHANCEMENT_IMPLEMENTATION_PLAN § Feature 3.1](../blob/main/APP_ENHANCEMENT_IMPLEMENTATION_PLAN)
`,
  },
  {
    title: 'Phase 3: Versioning & Iterative Refinement',
    labels: ['enhancement', 'phase-3', 'medium-priority'],
    body: (parentNum) => `## Parent Issue
#${parentNum}

## Overview
Once the AI generates files, there is no structured way to iterate safely. Users can ask for changes but have no way to undo a bad generation without losing their entire session. This issue adds version snapshots, undo/redo, a version history timeline, diff view, and the ability to branch from any snapshot.

## Problem Statement
- There is no snapshot mechanism — destructive changes (incorrect file generation, bad command run) are irreversible.
- Users must manually remember what changed between iterations.
- There is no diff view to compare file versions.

## What to Build

### 1. Snapshot Model (\`lib/storage/snapshots.ts\`)
\`\`\`ts
interface Snapshot {
  id: string;
  projectId: string;
  label: string;          // auto-generated (e.g. "After file generation — 14:32") or user-named
  fileManifest: FileEntry[];
  chatPosition: number;   // index of the last chat message at snapshot time
  createdAt: string;
  isAutoSave: boolean;
}
\`\`\`
- Stored alongside the project in IndexedDB.
- Auto-snapshot triggers: before every \`generateFiles\` call and before every \`runCommand\` call.

### 2. Snapshot Hooks
- Modify \`ai/tools/generate-files.ts\` to call \`SnapshotStore.create()\` before writing files.
- Modify \`ai/tools/run-command.ts\` to call \`SnapshotStore.create()\` before destructive commands.

### 3. Version History Panel (\`components/file-explorer/version-history.tsx\`)
- A collapsible panel at the bottom of the file explorer.
- Lists snapshots in reverse chronological order with label and timestamp.
- Click to preview a snapshot's file manifest without switching to it.
- "Restore" button to overwrite current state with a snapshot.
- "Fork" button to create a new project branch from this snapshot.

### 4. Undo/Redo (\`components/file-explorer/snapshot-controls.tsx\`)
- Keyboard shortcuts: \`Ctrl+Z\` (undo — restore previous snapshot), \`Ctrl+Y\` / \`Ctrl+Shift+Z\` (redo).
- UI buttons in the file explorer toolbar.
- Uses a pointer into the snapshot history array (not a full copy per step).

### 5. Diff View (\`components/file-explorer/diff-view.tsx\`)
- When selecting a snapshot from the history panel, show a side-by-side or unified diff of each changed file.
- Use a lightweight diff library (e.g. \`diff\` — \`pnpm add diff\`) for computation.
- Render additions in green, deletions in red, in a scrollable panel.

### 6. Branching
- "Fork from here" creates a new project in ProjectStore with a copy of the snapshot's file manifest and chat history up to \`chatPosition\`.
- Navigates to the new project's page.

## Files to Create / Modify
| File | Action |
|------|--------|
| \`lib/storage/snapshots.ts\` | Create — Snapshot model & storage |
| \`components/file-explorer/version-history.tsx\` | Create — History panel |
| \`components/file-explorer/diff-view.tsx\` | Create — Diff viewer |
| \`components/file-explorer/snapshot-controls.tsx\` | Create — Undo/redo buttons |
| \`app/state.ts\` | Modify — Add snapshot pointer |
| \`ai/tools/generate-files.ts\` | Modify — Pre-generation snapshot |
| \`ai/tools/run-command.ts\` | Modify — Pre-command snapshot |

## Testing Requirements
- Unit tests for snapshot creation and retrieval (mock IndexedDB).
- Unit tests for diff computation (various added/removed/modified cases).
- Component tests for version history UI (list, select, restore).
- E2E test: generate files → trigger another generation → undo → verify original files restored.

## Acceptance Criteria
- [ ] Auto-snapshot is created before every file generation and destructive command.
- [ ] Version history panel lists all snapshots correctly.
- [ ] Undo/redo moves through snapshot history correctly.
- [ ] Diff view shows correct additions/deletions.
- [ ] Fork creates a new independent project from the snapshot.
- [ ] Changeset generated for this PR.

## Dependencies
- Phase 1: Project Persistence (#8) — snapshots are tied to project IDs.
- Phase 3: Multi-Framework Generation (#14) — snapshots should capture framework context.

## References
- [IMPLEMENTATION_PLAN.md § Phase 3 — Versioning & Refinement](../blob/main/IMPLEMENTATION_PLAN.md)
- [APP_ENHANCEMENT_IMPLEMENTATION_PLAN § Feature 3.2](../blob/main/APP_ENHANCEMENT_IMPLEMENTATION_PLAN)
`,
  },
  {
    title: 'Phase 3: Error Handling UX',
    labels: ['enhancement', 'phase-3', 'medium-priority'],
    body: (parentNum) => `## Parent Issue
#${parentNum}

## Overview
The current error monitor catches stderr output and reports to the AI for auto-fixing, but the experience is basic. Users have limited visibility into errors and no way to intervene manually. This issue replaces the basic monitor with a structured error panel, per-error fix flow, fix previews, configurable auto-fix levels, and error history.

## Problem Statement
- The existing error monitor sends all errors as a bulk payload to the AI — no categorization, no severity, no targeted context.
- Users cannot see what the AI plans to do before it does it (no fix preview).
- Auto-fix is binary (on/off) with no "suggest only" middle ground.
- There is no history of errors and how they were resolved.

## What to Build

### 1. Error Panel (\`components/error-monitor/error-panel.tsx\`)
Replaces the current inline error monitor. A dedicated panel (collapsible tab at the bottom of the layout, similar to VS Code's Problems panel) that shows:
- A header with error count and category breakdown.
- A scrollable list of \`ErrorCard\` components.
- Filter tabs: All / Build / Runtime / Dependency.

### 2. Error Card (\`components/error-monitor/error-card.tsx\`)
Each error card shows:
- Severity badge (Error / Warning / Info) using CVA variants.
- Error message (truncated with expand toggle).
- Source file + line number (if available).
- "Fix This" button — sends this specific error to the AI with focused context.
- "Explain" toggle — shows a human-readable explanation of the error.

### 3. Fix Preview (\`components/error-monitor/fix-preview.tsx\`)
Before applying an AI-generated fix:
- Show the proposed diff (reuse the diff component from Phase 3: Versioning).
- "Apply Fix" and "Skip" buttons.
- Only available when auto-fix level is "Suggest Only" or manually triggered.

### 4. Updated Error Schemas (\`components/error-monitor/schemas.ts\`)
Add fields to the existing error schema:
\`\`\`ts
interface ParsedError {
  // existing fields...
  severity: 'error' | 'warning' | 'info';
  category: 'build' | 'runtime' | 'dependency' | 'unknown';
  file?: string;
  line?: number;
  column?: number;
}
\`\`\`

### 5. Auto-Fix Level Selector (\`components/settings/auto-fix-errors.tsx\`)
Replace the binary toggle with a 3-level radio group:
- **Off** — errors are shown but AI is not called automatically.
- **Suggest Only** — AI proposes a fix (shown in FixPreview) but does not apply it.
- **Auto-Fix** — current behavior: AI applies fix immediately.

### 6. Error History (\`components/error-monitor/error-history.tsx\`)
- A "History" tab in the error panel showing past errors with: timestamp, message, category, resolution status (fixed / skipped / open).
- Stored in a lightweight in-memory list (cleared on page reload for v1; persist in Phase 1 storage later).

### 7. Updated Error API (\`app/api/errors/route.ts\`)
- Return structured error analysis: \`{ errors: ParsedError[], proposedFix: FileDiff[] }\`.
- Include the relevant source file content in the fix context.

## Files to Create / Modify
| File | Action |
|------|--------|
| \`components/error-monitor/error-panel.tsx\` | Create — Dedicated panel |
| \`components/error-monitor/error-card.tsx\` | Create — Individual error card |
| \`components/error-monitor/fix-preview.tsx\` | Create — Diff preview before fix |
| \`components/error-monitor/error-history.tsx\` | Create — Historical log |
| \`components/error-monitor/error-monitor.tsx\` | Modify — Refactor to use new components |
| \`components/error-monitor/schemas.ts\` | Modify — Add severity, category |
| \`components/settings/auto-fix-errors.tsx\` | Modify — 3-level selector |
| \`app/api/errors/route.ts\` | Modify — Return structured analysis |

## Testing Requirements
- Unit tests for error categorization logic (regex patterns for build vs. runtime vs. dependency).
- Component tests for error card actions (fix, skip, explain).
- E2E test: trigger a known build error → see categorized card in error panel → click "Fix This" → verify fix applied or previewed.

## Acceptance Criteria
- [ ] Error panel shows categorized errors with severity badges.
- [ ] "Fix This" sends focused context (file + error) rather than bulk errors.
- [ ] Fix preview shows diff before applying (in "Suggest Only" mode).
- [ ] Auto-fix 3-level selector works and persists.
- [ ] Error history records past errors and resolutions.
- [ ] Changeset generated for this PR.

## Dependencies
- Phase 3: Versioning (#15) — FixPreview reuses the diff viewer component.

## References
- [IMPLEMENTATION_PLAN.md § Phase 3 — Error Experience](../blob/main/IMPLEMENTATION_PLAN.md)
- [APP_ENHANCEMENT_IMPLEMENTATION_PLAN § Feature 3.3](../blob/main/APP_ENHANCEMENT_IMPLEMENTATION_PLAN)
`,
  },

  // -------------------------------------------------------------------------
  // PHASE 4
  // -------------------------------------------------------------------------
  {
    title: 'Phase 4: Organization & Team Management',
    labels: ['enhancement', 'phase-4', 'medium-priority'],
    body: (parentNum) => `## Parent Issue
#${parentNum}

## Overview
Enterprise customers need to manage multiple users under a shared organization with role-based access control, member invitations, shared branding, usage quotas, and an admin dashboard. This issue implements the organizational layer on top of the user authentication system.

## Problem Statement
- Authentication (Phase 2) gives individual user accounts, but there is no concept of a company or team.
- Admin actions (approve ideas, manage members) have no permission model.
- There is no usage tracking to understand or limit AI API consumption.

## What to Build

### 1. Organization Model (\`lib/storage/organization-store.ts\`)
\`\`\`ts
interface Organization {
  id: string;
  name: string;
  slug: string;         // URL-safe unique identifier
  logoUrl?: string;
  defaultBranding?: BrandingConfig;
  allowedModels: string[];
  createdAt: string;
  ownerId: string;
}
\`\`\`

### 2. Team Roles (\`lib/auth/permissions.ts\`)
Define 4 roles with permission checks:
| Role | Permissions |
|------|-------------|
| Owner | All admin actions + billing/deletion |
| Admin | Manage members, approve ideas, view audit logs |
| Member | Create projects, submit to challenges |
| Viewer | Read-only access to team projects |

\`\`\`ts
function can(user: User, action: Permission, resource?: Resource): boolean
\`\`\`

### 3. Invite Flow (\`components/admin/invite-dialog.tsx\`)
- Admin sends invite by email or generates a shareable invite link.
- Invite stored with expiry (7 days).
- Invited user clicks link → is added to the org with \`Member\` role.

### 4. Admin Dashboard (\`app/admin/page.tsx\`)
- Route: \`/admin\` (role: Owner/Admin only)
- Overview cards: total members, active projects, ideas this month, AI usage.
- Links to Members, Settings, Audit Log sub-pages.

### 5. Member Management (\`app/admin/members/page.tsx\`)
- Data table: avatar, name, email, role, joined date, last active.
- Role change dropdown (Owner can promote/demote anyone; Admin can manage Members/Viewers).
- Remove member button with confirmation.

### 6. Organization Settings (\`app/admin/settings/page.tsx\`)
- Org name, slug, logo upload.
- Default branding (reuse BrandingPanel component from issue #3).
- Allowed AI models (multi-select from available models).

### 7. Usage Quotas (\`components/admin/usage-dashboard.tsx\`)
- Track AI API call counts per user per day/month.
- Show usage bar per user.
- Configurable soft limits (warn) and hard limits (block) per member.

## Files to Create / Modify
| File | Action |
|------|--------|
| \`lib/storage/organization-store.ts\` | Create — Org data model |
| \`lib/auth/permissions.ts\` | Create — RBAC permission checks |
| \`app/admin/page.tsx\` | Create — Admin overview |
| \`app/admin/members/page.tsx\` | Create — Member management |
| \`app/admin/settings/page.tsx\` | Create — Org settings |
| \`components/admin/member-table.tsx\` | Create — Member list table |
| \`components/admin/invite-dialog.tsx\` | Create — Invite flow |
| \`components/admin/usage-dashboard.tsx\` | Create — Usage metrics |

## Testing Requirements
- Unit tests for \`can()\` permission function (all role/action combinations).
- Unit tests for invite link generation and expiry validation.
- E2E test: admin invites member → member accepts → admin changes member role → verify access changes.

## Acceptance Criteria
- [ ] Organization model is stored and retrievable.
- [ ] Role-based permission checks prevent unauthorized actions.
- [ ] Invite link flow works end-to-end.
- [ ] Admin dashboard shows correct metrics.
- [ ] Member management (add/remove/change role) works correctly.
- [ ] Changeset generated for this PR.

## Dependencies
- Phase 2: Authentication (#11) — user identity required.

## References
- [IMPLEMENTATION_PLAN.md § Phase 4 — Organization & Team Management](../blob/main/IMPLEMENTATION_PLAN.md)
- [APP_ENHANCEMENT_IMPLEMENTATION_PLAN § Feature 4.1](../blob/main/APP_ENHANCEMENT_IMPLEMENTATION_PLAN)
`,
  },
  {
    title: 'Phase 4: Innovation Challenges',
    labels: ['enhancement', 'phase-4', 'medium-priority'],
    body: (parentNum) => `## Parent Issue
#${parentNum}

## Overview
Innovation challenges (time-bound campaigns with a theme) are the #1 engagement feature in enterprise innovation platforms (Brightidea, HYPE). They focus organizational creativity on priority problems and drive higher participation. This issue adds challenge creation, browsing, submissions, a leaderboard, and gamification badges.

## Problem Statement
- There is no way for a company to run a focused innovation campaign.
- Without challenges, the platform is passive — ideas are submitted ad-hoc with no urgency or shared theme.
- Gamification (points, badges) has been shown to increase platform participation by 3–5×.

## What to Build

### 1. Challenge Model (\`lib/storage/challenges-store.ts\`)
\`\`\`ts
interface Challenge {
  id: string;
  orgId: string;
  title: string;
  description: string;   // rich text (Markdown)
  theme: string;
  deadline: string;      // ISO 8601
  status: 'draft' | 'active' | 'closed' | 'archived';
  prize?: string;        // description of recognition/prize
  createdBy: string;     // userId
  createdAt: string;
  submissionCount: number;
}
\`\`\`

### 2. Challenge Submission
- Link between a \`Project\` and a \`Challenge\` via a \`ChallengeSubmission\` join model.
- Users can submit any of their projects to an active challenge from the project view.
- A project can be submitted to multiple challenges.

### 3. Challenge Pages
| Route | Description |
|-------|-------------|
| \`/challenges\` | Browse all active & past challenges |
| \`/challenges/[id]\` | Challenge detail: description, deadline, submissions |
| \`/challenges/create\` | Admin-only: create a new challenge |
| \`/challenges/[id]/leaderboard\` | Ranked submissions |

### 4. Leaderboard (\`components/challenges/leaderboard.tsx\`)
- Ranked by: upvotes (default), completion stage, or admin score.
- Shows rank, project title, creator name, upvotes, and submission date.
- Live updates when new upvotes arrive (SWR polling).

### 5. Challenge Completion & Archive
- When a challenge deadline passes or admin closes it, it moves to \`closed\` status.
- Winning ideas are highlighted in the archive view.
- Winning creator receives a \`challenge-winner\` badge.

### 6. Gamification (\`lib/gamification.ts\`)
Award badges for:
| Badge | Trigger |
|-------|---------|
| \`first-idea\` | First project created |
| \`deployed\` | First project deployed |
| \`top-voted\` | Project reaches 10+ upvotes |
| \`challenge-winner\` | Admin marks as challenge winner |
| \`speed-builder\` | Project deployed within 30 min of creation |

- Badge storage: array on the \`User\` model.
- \`components/challenges/badge-display.tsx\` renders earned badges on user profiles.

## Files to Create / Modify
| File | Action |
|------|--------|
| \`lib/storage/challenges-store.ts\` | Create — Challenge model |
| \`lib/gamification.ts\` | Create — Badge/points logic |
| \`app/challenges/page.tsx\` | Create — Browse challenges |
| \`app/challenges/[id]/page.tsx\` | Create — Challenge detail |
| \`app/challenges/create/page.tsx\` | Create — Admin creation form |
| \`app/challenges/[id]/leaderboard/page.tsx\` | Create — Leaderboard |
| \`components/challenges/challenge-card.tsx\` | Create — Challenge card |
| \`components/challenges/leaderboard.tsx\` | Create — Ranked list |
| \`components/challenges/badge-display.tsx\` | Create — Badge icons |

## Testing Requirements
- Unit tests for challenge status transitions and submission linking.
- Unit tests for badge award logic (each trigger condition).
- E2E test: admin creates challenge → member submits project → admin closes challenge → winner badge awarded.

## Acceptance Criteria
- [ ] Admins can create, publish, and close challenges.
- [ ] Members can browse and submit projects to active challenges.
- [ ] Leaderboard correctly ranks submissions.
- [ ] Badge awards fire at the correct trigger events.
- [ ] Challenge archive shows past challenges with winners highlighted.
- [ ] Changeset generated for this PR.

## Dependencies
- Phase 2: Authentication (#11) — challenges require org membership.
- Phase 2: Sharing & Voting (#12) — leaderboard uses upvote counts.
- Phase 4: Org & Team Management (#17) — admin role required.

## References
- [IMPLEMENTATION_PLAN.md § Phase 4 — Innovation Challenges](../blob/main/IMPLEMENTATION_PLAN.md)
- [APP_ENHANCEMENT_IMPLEMENTATION_PLAN § Feature 4.2](../blob/main/APP_ENHANCEMENT_IMPLEMENTATION_PLAN)
`,
  },
  {
    title: 'Phase 4: Audit Trail & Compliance',
    labels: ['enhancement', 'phase-4', 'medium-priority'],
    body: (parentNum) => `## Parent Issue
#${parentNum}

## Overview
Enterprise customers require auditable logs of all significant actions for compliance, governance, and usage billing. This issue adds an activity logging system, an admin audit log viewer, CSV export, configurable data retention, and an API usage/cost dashboard.

## Problem Statement
- There is no record of who did what and when.
- AI API usage is invisible — it is impossible to understand costs or attribute them per user/team.
- Regulated industries (finance, healthcare) require tamper-evident activity logs.
- There is no mechanism to enforce data retention or right-to-erasure policies.

## What to Build

### 1. Audit Event Model (\`lib/storage/audit-store.ts\`)
\`\`\`ts
interface AuditEvent {
  id: string;
  orgId: string;
  userId: string;
  action: AuditAction;   // enum of all tracked actions
  resourceType: 'project' | 'challenge' | 'user' | 'sandbox' | 'ai-call';
  resourceId: string;
  metadata: Record<string, unknown>;  // action-specific details
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

type AuditAction =
  | 'project.created' | 'project.updated' | 'project.deleted' | 'project.deployed'
  | 'project.status_changed' | 'project.shared'
  | 'ai.prompt_sent' | 'ai.files_generated' | 'ai.command_run'
  | 'auth.login' | 'auth.logout'
  | 'challenge.created' | 'challenge.submitted'
  | 'member.invited' | 'member.role_changed' | 'member.removed';
\`\`\`

### 2. Audit Helper (\`lib/audit.ts\`)
\`\`\`ts
async function logEvent(event: Omit<AuditEvent, 'id' | 'createdAt'>): Promise<void>
\`\`\`
Called from all API routes after significant state changes.

### 3. Instrument All API Routes
Add \`await logEvent({...})\` calls at the end of every mutating API handler:
- \`/api/chat\` — log \`ai.prompt_sent\` and \`ai.files_generated\` with model name and token count.
- \`/api/projects/*\` — log project CRUD operations.
- \`/api/auth/*\` — log login/logout.
- All other mutating routes.

### 4. Audit Log Viewer (\`app/admin/audit/page.tsx\`)
- Route: \`/admin/audit\` (Owner/Admin only)
- Filterable table: date range, user, action type, resource type.
- Pagination (50 events per page).
- Each row is expandable to show full \`metadata\` JSON.

### 5. CSV Export
- "Export CSV" button in the audit log viewer.
- Applies current filters and generates a downloadable \`audit-log-{date}.csv\`.

### 6. Data Retention Settings
- In \`/admin/settings\`: "Retention Policy" selector (30 / 90 / 180 / 365 days / Forever).
- A scheduled job (Vercel Cron or manual trigger) purges events older than the policy.

### 7. API Usage Dashboard (\`components/admin/api-usage.tsx\`)
- AI calls per day (line chart).
- Token usage breakdown by model (stacked bar chart).
- Estimated cost per user/team (based on model pricing constants).

## Files to Create / Modify
| File | Action |
|------|--------|
| \`lib/storage/audit-store.ts\` | Create — Event model & storage |
| \`lib/audit.ts\` | Create — Event creation helpers |
| \`app/admin/audit/page.tsx\` | Create — Log viewer |
| \`components/admin/audit-log.tsx\` | Create — Filterable table |
| \`components/admin/api-usage.tsx\` | Create — Usage charts |
| All \`app/api/*\` route files | Modify — Add audit logging |

## Testing Requirements
- Unit tests for \`logEvent()\` (mock storage, verify event shape).
- Unit tests for CSV generation (correct headers and row format).
- E2E test: perform project creation → check audit log shows event → export CSV → verify row present.

## Acceptance Criteria
- [ ] All listed actions generate audit events with correct metadata.
- [ ] Audit log viewer loads and filters correctly.
- [ ] CSV export produces a valid file with correct data.
- [ ] Retention policy purges old events correctly.
- [ ] API usage chart shows accurate token counts and estimated costs.
- [ ] Changeset generated for this PR.

## Dependencies
- Phase 2: Authentication (#11) — all events are attributed to a user.
- Phase 4: Org & Team Management (#17) — events scoped to an org.

## References
- [IMPLEMENTATION_PLAN.md § Phase 4 — Audit & Compliance](../blob/main/IMPLEMENTATION_PLAN.md)
- [APP_ENHANCEMENT_IMPLEMENTATION_PLAN § Feature 4.3](../blob/main/APP_ENHANCEMENT_IMPLEMENTATION_PLAN)
`,
  },

  // -------------------------------------------------------------------------
  // PHASE 5
  // -------------------------------------------------------------------------
  {
    title: 'Phase 5: Mobile UX Improvements',
    labels: ['enhancement', 'phase-5', 'medium-low-priority'],
    body: (parentNum) => `## Parent Issue
#${parentNum}

## Overview
The app uses a tab-based layout on mobile but lacks touch-optimized interactions, native-feeling navigation, and installability. This issue adds a bottom navigation bar, swipe gestures, touch-optimized file explorer, a floating chat input for mobile keyboards, and PWA support.

## Problem Statement
- The current tab layout was designed for desktop; on mobile it is awkward and hard to use.
- No swipe gestures for panel switching.
- The chat input is hidden behind the mobile keyboard on small screens.
- The app is not installable as a PWA despite the platform being suitable for on-the-go ideation.

## What to Build

### 1. Bottom Navigation Bar (\`components/layout/mobile-nav.tsx\`)
- Visible only on screens < 768px (Tailwind \`sm:\` breakpoint).
- 4 tabs: Chat, Preview, Files, Logs — with icons (shadcn/ui \`lucide-react\` icons).
- Active tab is highlighted; navigation is keyboard accessible.
- Hides when the keyboard is open (uses \`visualViewport\` API).

### 2. Swipe Gestures
- Detect horizontal swipe on the main panel area.
- Left swipe → next tab; right swipe → previous tab.
- Use \`@use-gesture/react\` (\`pnpm add @use-gesture/react\`) for gesture detection.
- Respects \`prefers-reduced-motion\`.

### 3. Touch-Optimized File Explorer
- Increase tap targets to minimum 44×44px per WCAG 2.5.5.
- Long-press on a file shows a context menu (Rename, Delete, Copy Path).
- File icons are larger on mobile.
- Pinch-to-zoom is disabled (files are already scrollable).

### 4. Floating Chat Input
- On mobile, the chat input sticks to just above the keyboard (uses \`position: sticky\` or \`env(keyboard-inset-height)\` where supported).
- The message list scrolls independently, keeping the latest messages visible.

### 5. PWA Support
- Add \`app/manifest.json\` with:
  - App name, short name, description
  - Theme color (from branding context)
  - Icons: 192×192, 512×512 (SVG or PNG)
  - Display: \`standalone\`
- Modify \`app/layout.tsx\` to include \`<link rel="manifest">\` and \`<meta name="theme-color">\`.
- Add a simple service worker for offline splash screen (using Next.js's built-in support or \`next-pwa\`).

## Files to Create / Modify
| File | Action |
|------|--------|
| \`components/layout/mobile-nav.tsx\` | Create — Bottom nav bar |
| \`app/manifest.json\` | Create — PWA manifest |
| \`app/layout.tsx\` | Modify — Manifest link, viewport meta |
| \`components/file-explorer/file-explorer.tsx\` | Modify — Touch optimizations |
| \`app/page.tsx\` | Modify — Enhanced mobile layout, floating input |

## Testing Requirements
- Component test for mobile-nav tab switching (simulated swipe events).
- E2E test (Playwright with mobile viewport): load page → swipe to Preview tab → verify preview is visible.
- PWA manifest validation: verify manifest.json is valid JSON with all required fields.

## Acceptance Criteria
- [ ] Bottom navigation is visible on mobile and correctly switches panels.
- [ ] Swipe gestures work in both directions.
- [ ] File explorer tap targets are ≥44px on mobile.
- [ ] Chat input stays above keyboard on iOS and Android.
- [ ] App is installable as a PWA (passes Lighthouse PWA audit).
- [ ] Changeset generated for this PR.

## Dependencies
- None (can be built independently).

## References
- [IMPLEMENTATION_PLAN.md § Phase 5 — Mobile UX](../blob/main/IMPLEMENTATION_PLAN.md)
- [APP_ENHANCEMENT_IMPLEMENTATION_PLAN § Feature 5.1](../blob/main/APP_ENHANCEMENT_IMPLEMENTATION_PLAN)
`,
  },
  {
    title: 'Phase 5: Accessibility Enhancements',
    labels: ['enhancement', 'phase-5', 'medium-low-priority'],
    body: (parentNum) => `## Parent Issue
#${parentNum}

## Overview
WCAG contrast checking already exists for branding. This issue expands accessibility coverage across the app: skip navigation, ARIA live regions for dynamic content, focus management, keyboard shortcuts, reduced-motion support, and font-size controls. Target: WCAG 2.1 AA compliance.

## Problem Statement
- Screen readers cannot track dynamic content updates (chat messages, command output, error notifications).
- Users relying on keyboard navigation face focus traps and unannounced content changes.
- No font-size scaling support and animations do not respect \`prefers-reduced-motion\`.
- No keyboard shortcuts for common actions.

## What to Build

### 1. Skip Navigation (\`components/accessibility/skip-nav.tsx\`)
- A visually hidden "Skip to main content" link that appears on focus at the top of every page.
- Implements \`<a href="#main-content">\` with appropriate ARIA.
- Styled with Tailwind (\`sr-only focus:not-sr-only\` pattern).

### 2. ARIA Live Regions
Add \`aria-live\` regions to all dynamically updated areas:
| Component | Region Type | Announcement |
|-----------|-------------|--------------|
| Chat messages | \`aria-live="polite"\` | New message text |
| Command output | \`aria-live="polite"\` | Command completion/failure |
| Error notifications | \`aria-live="assertive"\` | Error message |
| Sandbox status | \`aria-live="polite"\` | "Sandbox created" / "Connecting..." |
| File generation | \`aria-live="polite"\` | "Files generated: [count]" |

### 3. Focus Management
- Trap focus inside all modal dialogs (shadcn/ui Dialog already does this — verify and fix any gaps).
- After closing a dialog, return focus to the element that opened it.
- After navigating panels (mobile tabs), focus the first interactive element in the new panel.

### 4. Keyboard Shortcuts Panel (\`components/accessibility/keyboard-shortcuts.tsx\`)
- Opens with \`?\` key (discoverable shortcut, common pattern).
- Lists all available shortcuts in a table.
- Shortcuts implemented:
  | Shortcut | Action |
  |----------|--------|
  | \`Ctrl+Enter\` | Send message |
  | \`Ctrl+S\` | Save project |
  | \`Ctrl+Z\` | Undo (Phase 3) |
  | \`Ctrl+/\` | Toggle file explorer |
  | \`Escape\` | Close modal / cancel |
  | \`?\` | Open keyboard shortcuts panel |

### 5. Reduced Motion
- Add CSS: \`@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; } }\` in \`app/globals.css\`.
- Disable swipe gesture animations (Phase 5: Mobile) when reduced motion is preferred.

### 6. Font Size Control
- Add a "Text Size" slider (3 levels: Small / Default / Large) in the Settings panel.
- Adjusts a \`--font-scale\` CSS custom property on \`:root\` (\`0.875\` / \`1\` / \`1.125\`).
- All \`font-size\` values in the app use \`rem\` units (audit existing components).
- Persisted in \`localStorage\`.

### 7. Screen Reader Announcements (\`lib/accessibility.ts\`)
\`\`\`ts
function announce(message: string, priority?: 'polite' | 'assertive'): void
\`\`\`
Injects a temporary \`aria-live\` region announcement for one-off status messages.

## Files to Create / Modify
| File | Action |
|------|--------|
| \`components/accessibility/skip-nav.tsx\` | Create |
| \`components/accessibility/keyboard-shortcuts.tsx\` | Create |
| \`lib/accessibility.ts\` | Create — Announce helper |
| \`app/layout.tsx\` | Modify — Add skip nav, reduced-motion CSS |
| \`components/chat/message-part/*.tsx\` | Modify — ARIA annotations |
| \`components/settings/settings.tsx\` | Modify — Font size control |
| \`app/globals.css\` | Modify — Reduced motion media query |

## Testing Requirements
- Unit tests for \`announce()\` (verify DOM injection and cleanup).
- Component tests for keyboard-shortcuts panel (opens on \`?\`, closes on \`Escape\`).
- Accessibility audit using \`@axe-core/playwright\` on key pages.
- E2E test: navigate using keyboard only through the full chat flow.

## Acceptance Criteria
- [ ] Skip nav link is visible on focus and functional.
- [ ] All dynamic content updates are announced by screen readers.
- [ ] Focus is managed correctly across all modal dialogs.
- [ ] Keyboard shortcuts panel lists all shortcuts and they work.
- [ ] Animations are disabled when \`prefers-reduced-motion\` is set.
- [ ] Font size control works and persists.
- [ ] Key pages pass axe-core automated accessibility audit with zero critical violations.
- [ ] Changeset generated for this PR.

## Dependencies
- Phase 3: Versioning (#15) — keyboard shortcut \`Ctrl+Z\` depends on Phase 3's undo implementation.

## References
- [IMPLEMENTATION_PLAN.md § Phase 5 — Accessibility](../blob/main/IMPLEMENTATION_PLAN.md)
- [APP_ENHANCEMENT_IMPLEMENTATION_PLAN § Feature 5.2](../blob/main/APP_ENHANCEMENT_IMPLEMENTATION_PLAN)
- [WCAG 2.1 AA](https://www.w3.org/TR/WCAG21/)
`,
  },
  {
    title: 'Phase 5: Test Coverage Expansion',
    labels: ['enhancement', 'phase-5', 'medium-low-priority'],
    body: (parentNum) => `## Parent Issue
#${parentNum}

## Overview
The codebase enforces ≥90% unit-test coverage thresholds but current tests only cover utilities and simple components. API routes, AI tools, Zustand state management, and streaming have zero test coverage. The E2E suite has only 1 smoke test. This issue fills those gaps with comprehensive API, tool, state, and E2E tests.

## Problem Statement
- Zero test coverage on \`app/api/chat/route.ts\`, \`app/api/errors/route.ts\`, \`app/api/models/route.ts\`, and all sandbox routes.
- Zero test coverage on AI tools (\`createSandbox\`, \`generateFiles\`, \`runCommand\`).
- Zero test coverage on Zustand stores (sandbox store, file explorer store).
- Only 1 E2E test (\`e2e/app.spec.ts\`) covering a basic smoke check.

## What to Build

### 1. API Route Tests
#### \`__tests__/api/chat.test.ts\`
- Mock: \`@ai-sdk/openai\`, \`streamText\`, auth session.
- Test: authenticated POST returns streaming response; unauthenticated returns 401.
- Test: invalid body returns 400 with Zod error.
- Test: AI tool calls (createSandbox, generateFiles) are invoked correctly.

#### \`__tests__/api/errors.test.ts\`
- Mock: sandbox file reads.
- Test: POST with stderr output returns structured \`ParsedError[]\`.
- Test: response includes proposed fix diff.

#### \`__tests__/api/sandboxes.test.ts\`
- Mock: \`@vercel/sandbox\` client.
- Test: GET /api/sandboxes returns sandbox list.
- Test: POST creates a sandbox with correct config.
- Test: DELETE removes a sandbox.

### 2. AI Tool Tests
#### \`__tests__/tools/create-sandbox.test.ts\`
- Mock: Vercel Sandbox API.
- Test: sandbox is created with correct environment variables.
- Test: error handling when API returns 5xx.

#### \`__tests__/tools/generate-files.test.ts\`
- Mock: sandbox file write API.
- Test: files are written with correct paths and content.
- Test: snapshot is taken before generation (Phase 3).

#### \`__tests__/tools/run-command.test.ts\`
- Mock: sandbox command execution API.
- Test: command output is streamed to the monitor.
- Test: non-zero exit code triggers error event.

### 3. State Management Tests (\`__tests__/state.test.ts\`)
- Test: sandbox store initialises with correct defaults.
- Test: \`setSandboxId()\` updates the store.
- Test: file explorer store correctly handles file add/remove/select operations.
- Test: auto-save hook fires after state change (mock \`ProjectStore.update\`).

### 4. E2E Test Expansion
#### \`e2e/full-workflow.spec.ts\`
Full generation workflow:
1. Load page → verify welcome state.
2. Enter a prompt → submit.
3. Wait for sandbox creation message.
4. Wait for file generation to complete.
5. Verify files appear in file explorer.
6. Verify preview iframe loads.

#### \`e2e/settings.spec.ts\`
- Change branding colour → reload → verify colour persists.
- Change framework selector → reload → verify selection persists.
- Change auto-fix level → reload → verify level persists.

#### \`e2e/error-recovery.spec.ts\`
- Generate app → simulate build error → verify error panel shows card → click "Fix This" → verify fix applied.

### 5. Visual Regression (Optional — Playwright Screenshots)
- \`e2e/visual.spec.ts\`: take screenshots of key states (welcome, chat with messages, file explorer open, settings open) and compare against stored baselines using \`expect(page).toHaveScreenshot()\`.

## Files to Create / Modify
| File | Action |
|------|--------|
| \`__tests__/api/chat.test.ts\` | Create |
| \`__tests__/api/errors.test.ts\` | Create |
| \`__tests__/api/sandboxes.test.ts\` | Create |
| \`__tests__/tools/create-sandbox.test.ts\` | Create |
| \`__tests__/tools/generate-files.test.ts\` | Create |
| \`__tests__/tools/run-command.test.ts\` | Create |
| \`__tests__/state.test.ts\` | Create |
| \`e2e/full-workflow.spec.ts\` | Create |
| \`e2e/settings.spec.ts\` | Create |
| \`e2e/error-recovery.spec.ts\` | Create |

## Testing Requirements (Meta)
All new tests themselves must pass CI and not reduce existing coverage below 90%.

## Acceptance Criteria
- [ ] All 3 API route test files pass with ≥80% branch coverage on the routes.
- [ ] All 3 AI tool test files pass with ≥80% branch coverage.
- [ ] State management tests achieve ≥90% branch coverage on Zustand stores.
- [ ] Full workflow E2E test completes successfully in CI.
- [ ] Settings persistence E2E test verifies all 3 settings.
- [ ] Error recovery E2E test verifies the fix flow.
- [ ] Overall unit-test coverage remains ≥90%.
- [ ] Changeset generated for this PR.

## Dependencies
- Phase 3: Error Handling (#16) — error recovery E2E depends on the new error panel.
- Phase 3: Versioning (#15) — state tests cover snapshot store.
- Phase 2: Authentication (#11) — API route tests cover auth middleware.

## References
- [IMPLEMENTATION_PLAN.md § Phase 5 — Test Coverage Expansion](../blob/main/IMPLEMENTATION_PLAN.md)
- [APP_ENHANCEMENT_IMPLEMENTATION_PLAN § Feature 5.3](../blob/main/APP_ENHANCEMENT_IMPLEMENTATION_PLAN)
`,
  },

  // -------------------------------------------------------------------------
  // PHASE 6
  // -------------------------------------------------------------------------
  {
    title: 'Phase 6: Real-Time Collaboration',
    labels: ['enhancement', 'phase-6', 'low-priority'],
    body: (parentNum) => `## Parent Issue
#${parentNum}

## Overview
Multiple users should be able to view and interact with the same project simultaneously — seeing each other's chat cursors, sharing a live sandbox, and receiving real-time updates to the file explorer and preview. This is the #1 competitive differentiator against existing vibe-coding tools and enterprise platforms alike.

## Problem Statement
- The platform is entirely single-user today.
- Teams cannot co-build prototypes together in real time.
- There is no presence system — no awareness of who else is viewing a project.

## What to Build

### 1. Real-Time Infrastructure
Options (choose one based on infrastructure decisions):
- **Vercel Real-Time** (if available on plan) — built-in WebSocket/SSE support.
- **Ably / Pusher** — managed real-time PaaS.
- **PartyKit** — purpose-built for collaborative web apps.
- **Supabase Realtime** — if already using Supabase for storage.

### 2. Collaborative Session Model
\`\`\`ts
interface CollabSession {
  projectId: string;
  participants: Participant[];
}

interface Participant {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  cursorPosition?: ChatCursor;  // { messageIndex, inputText }
  lastSeen: string;
}
\`\`\`

### 3. Presence Indicators
- Show avatar bubbles in the project header for each active participant.
- Highlight which message in the chat another participant is currently viewing.

### 4. Shared Sandbox State
- All participants see the same live file explorer (file add/delete/rename events broadcast in real time).
- Preview iframe reflects the latest sandbox state for all participants.
- Prevent simultaneous conflicting file edits (last-write-wins or operational transform for v1).

### 5. Collaborative Chat
- When another participant sends a message to the AI, all participants see it in their chat stream.
- Typing indicators: "Alice is typing…"

### 6. Permissions
- Only the project Owner can trigger AI actions (generate files, run commands) in collaborative sessions (v1 restriction to avoid conflicts).
- Others can chat and observe.

## Files to Create / Modify
| File | Action |
|------|--------|
| \`lib/realtime/session.ts\` | Create — Collaboration session management |
| \`lib/realtime/presence.ts\` | Create — Participant tracking |
| \`components/collab/participant-list.tsx\` | Create — Presence avatars |
| \`components/collab/typing-indicator.tsx\` | Create — Typing status |
| \`app/api/collab/[projectId]/route.ts\` | Create — WebSocket/SSE endpoint |
| \`app/state.ts\` | Modify — Add collab session to store |
| \`lib/chat-context.tsx\` | Modify — Broadcast messages to session |

## Acceptance Criteria
- [ ] Two users can open the same project and see each other's avatars in the header.
- [ ] Chat messages from one user appear in the other's chat stream in < 500ms.
- [ ] File explorer updates (new file added) appear for all participants in real time.
- [ ] Typing indicators appear and disappear correctly.
- [ ] Changeset generated for this PR.

## Dependencies
- Phase 2: Authentication (#11) — required to identify participants.
- Phase 1: Project Persistence (#8) — shared projects require saved state.
- Phase 2: Sharing & Collaboration (#12) — project must be shared (team/public visibility).

## References
- [IMPLEMENTATION_PLAN.md § Phase 6 — Real-Time Collaboration](../blob/main/IMPLEMENTATION_PLAN.md)
- [APP_ENHANCEMENT_IMPLEMENTATION_PLAN § Feature 6.1](../blob/main/APP_ENHANCEMENT_IMPLEMENTATION_PLAN)
`,
  },
  {
    title: 'Phase 6: Custom AI Model Integration',
    labels: ['enhancement', 'phase-6', 'low-priority'],
    body: (parentNum) => `## Parent Issue
#${parentNum}

## Overview
Allow organizations to bring their own AI models — self-hosted LLMs, Azure OpenAI, AWS Bedrock, Ollama — instead of relying exclusively on the platform's shared AI Gateway. Includes per-org system prompt customization and support for fine-tuned models trained on the organization's codebase.

## Problem Statement
- Enterprise customers often cannot send code to shared multi-tenant AI services due to data residency or confidentiality requirements.
- There is no way to use organization-specific fine-tuned models.
- The system prompt is global — organizations cannot customize AI behavior.

## What to Build

### 1. Provider Configuration (\`lib/ai/custom-provider.ts\`)
Support for additional providers via the AI SDK's provider pattern:
| Provider | SDK |
|----------|-----|
| Azure OpenAI | \`@ai-sdk/azure\` |
| AWS Bedrock | \`@ai-sdk/amazon-bedrock\` |
| Ollama (local) | \`ollama-ai-provider\` |
| OpenAI-compatible (self-hosted) | \`@ai-sdk/openai\` with custom base URL |

### 2. Org-Level Model Settings (\`app/admin/settings/page.tsx\` — extend from Phase 4)
- A new "AI Models" section in org settings.
- Form fields: provider type, API endpoint, API key (stored encrypted), default model name.
- Test connection button — validates the credentials by sending a minimal test prompt.

### 3. Model Resolution Logic (\`app/api/chat/route.ts\`)
- Check if the current user's org has a custom model configured.
- If yes, use the org's provider and model.
- Fall back to the platform's default AI Gateway if not configured.

### 4. Custom System Prompt Management
- Org admins can define a custom system prompt addendum (Markdown).
- This is appended after the platform's base prompt when generating code.
- Use case: "Always use our internal component library at \`@company/ui\`."
- Stored in the org settings; editable via a Markdown editor in \`/admin/settings\`.

### 5. Fine-Tuned Model Support
- Allow an org to specify a custom model ID (e.g., a fine-tuned \`gpt-4o\` on their codebase).
- The platform uses this model ID when calling the provider.
- Documentation on how to fine-tune and configure.

## Files to Create / Modify
| File | Action |
|------|--------|
| \`lib/ai/custom-provider.ts\` | Create — Provider factory |
| \`lib/ai/model-resolver.ts\` | Create — Model resolution logic |
| \`app/admin/settings/page.tsx\` | Modify — Add AI model configuration section |
| \`app/api/chat/route.ts\` | Modify — Use resolved model |
| \`.env.example\` | Modify — Document org-level AI env vars |

## Acceptance Criteria
- [ ] Org admins can configure and test a custom AI provider.
- [ ] Chat uses the org's custom model when configured.
- [ ] Custom system prompt addendum is applied correctly.
- [ ] Fine-tuned model ID is passed to the provider correctly.
- [ ] Changeset generated for this PR.

## Dependencies
- Phase 4: Org & Team Management (#17) — org settings panel required.
- Phase 2: Authentication (#11) — org-level configuration requires auth.

## References
- [IMPLEMENTATION_PLAN.md § Phase 6 — Custom Model Integration](../blob/main/IMPLEMENTATION_PLAN.md)
- [APP_ENHANCEMENT_IMPLEMENTATION_PLAN § Feature 6.2](../blob/main/APP_ENHANCEMENT_IMPLEMENTATION_PLAN)
`,
  },
  {
    title: 'Phase 6: Marketplace & Plugin Ecosystem',
    labels: ['enhancement', 'phase-6', 'low-priority'],
    body: (parentNum) => `## Parent Issue
#${parentNum}

## Overview
A plugin marketplace allows community-contributed templates, themes, and tool integrations to extend the platform. This creates a network effect where the platform improves with every contributor and enables organizations to build internal extensions without modifying the core codebase.

## Problem Statement
- Template and theme contributions require modifying the core repository.
- There is no way to integrate the platform with internal tools (Jira, Slack, MS Teams, custom APIs).
- No webhook support for triggering external actions on platform events.

## What to Build

### 1. Plugin Interface (\`lib/plugins/types.ts\`)
Define the plugin interface:
\`\`\`ts
interface Plugin {
  id: string;
  name: string;
  version: string;
  type: 'template' | 'theme' | 'tool' | 'webhook';
  description: string;
  author: string;
  entryPoint: string;  // relative path to the plugin's main file
  permissions: PluginPermission[];
}
\`\`\`

### 2. Template Marketplace (\`app/marketplace/page.tsx\`)
- Browse community-contributed project templates.
- Filter by category, framework, rating.
- "Install Template" adds it to the user's template gallery.
- Templates are JSON/Markdown files hosted in a public registry (GitHub repo or npm package).

### 3. Theme Marketplace
- Community-contributed branding themes (colour palettes, font pairings).
- Preview a theme before installing.
- "Install Theme" applies it to the branding settings.

### 4. Custom AI Tools
- Allow organizations to define their own AI tools in a JSON schema format.
- Examples: "Query internal Jira API", "Post to Slack channel", "Lookup employee directory".
- Tools are injected into the AI's available tool list for the org.

### 5. Webhook Integrations (\`app/admin/webhooks/page.tsx\`)
- Admins configure webhook endpoints.
- Events that trigger webhooks:
  - \`project.created\`
  - \`project.status_changed\`
  - \`challenge.submitted\`
  - \`project.deployed\`
- Each webhook: URL, secret (for HMAC signature), selected events.
- Delivery log with retry on failure.

## Files to Create / Modify
| File | Action |
|------|--------|
| \`lib/plugins/types.ts\` | Create — Plugin interface definitions |
| \`lib/plugins/plugin-registry.ts\` | Create — Plugin loading/management |
| \`app/marketplace/page.tsx\` | Create — Template & theme marketplace |
| \`app/admin/webhooks/page.tsx\` | Create — Webhook configuration |
| \`components/marketplace/plugin-card.tsx\` | Create — Plugin card |
| \`app/api/webhooks/route.ts\` | Create — Webhook delivery engine |

## Acceptance Criteria
- [ ] Marketplace page shows installable templates.
- [ ] Installing a template makes it available in the template gallery.
- [ ] Webhook endpoint receives a POST with correct payload when a triggering event occurs.
- [ ] Webhook delivery log shows success/failure status.
- [ ] Changeset generated for this PR.

## Dependencies
- Phase 2: Authentication (#11) — marketplace requires a user account.
- Phase 4: Org & Team Management (#17) — custom tools and webhooks are org-scoped.
- Phase 1: Structured Idea Input (#9) — templates integrate with the template gallery.

## References
- [IMPLEMENTATION_PLAN.md § Phase 6 — Marketplace & Extensibility](../blob/main/IMPLEMENTATION_PLAN.md)
- [APP_ENHANCEMENT_IMPLEMENTATION_PLAN § Feature 6.3](../blob/main/APP_ENHANCEMENT_IMPLEMENTATION_PLAN)
`,
  },
  {
    title: 'Phase 6: Advanced Analytics & AI Insights',
    labels: ['enhancement', 'phase-6', 'low-priority'],
    body: (parentNum) => `## Parent Issue
#${parentNum}

## Overview
A sophisticated analytics layer surfaces innovation metrics, clusters similar ideas, detects trends, and predicts idea feasibility. This transforms the platform from a passive idea repository into an active intelligence system that helps organizations understand and optimize their innovation pipeline.

## Problem Statement
- The basic analytics dashboard (Phase 2) only shows counts and simple charts.
- Duplicate ideas are submitted unknowingly — there is no similarity detection.
- There is no way to understand which departments or topics generate the most value.
- Idea quality is evaluated manually — an AI-assisted feasibility score would speed up triaging.

## What to Build

### 1. Innovation Metrics Dashboard (Enhanced)
Extend the Phase 2 analytics page (\`app/projects/analytics/page.tsx\`) with:
- **Time-to-prototype**: average time from idea submission to "Prototype Ready" status.
- **Idea conversion funnel**: % of ideas that reach each pipeline stage.
- **Cost per idea**: AI API cost (from audit logs) averaged per completed prototype.
- **Most productive models**: which AI model produces the highest-rated outputs.
- **Top contributors**: by volume and by quality (upvotes/deployment rate).

### 2. AI-Powered Idea Clustering (\`lib/ai/clustering.ts\`)
- Use embeddings (via the AI Gateway's embedding endpoint) to vectorize idea titles and descriptions.
- Group similar ideas using k-means or DBSCAN clustering.
- Display cluster groups in the analytics dashboard: "5 ideas about internal dashboards", "3 ideas about customer onboarding".
- Warn when a new idea is submitted that is >85% similar to an existing one.

### 3. Trend Analysis (\`lib/ai/trends.ts\`)
- Analyse idea submission patterns over time to surface emerging themes.
- Use a sliding window (last 30 days vs previous 30 days) to detect rising topics.
- Display "Trending this month: workflow automation, AI assistants" in the dashboard.

### 4. Predictive Feasibility Scoring
- When an idea is submitted, use the AI to score it on 3 dimensions (0–10 each):
  - **Technical Feasibility**: how realistic is the tech stack?
  - **Impact Potential**: how broadly could this benefit the org?
  - **Effort Estimate**: rough complexity (Low / Medium / High).
- Show the score breakdown in the project detail view and the admin pipeline view.

### 5. AI Insight Summary
- A weekly AI-generated summary for admins: "This week 12 ideas were submitted, trending towards data analytics use cases. 3 ideas are awaiting review. The most active contributor was Alice."
- Generated on-demand or via a scheduled Vercel Cron job.
- Delivered as an in-app notification and optionally via email/Slack webhook.

## Files to Create / Modify
| File | Action |
|------|--------|
| \`lib/ai/clustering.ts\` | Create — Embedding-based idea clustering |
| \`lib/ai/trends.ts\` | Create — Trend detection |
| \`lib/ai/feasibility.ts\` | Create — Feasibility scoring |
| \`app/projects/analytics/page.tsx\` | Modify — Enhanced metrics |
| \`components/projects/analytics-charts.tsx\` | Modify — Add clustering & trend charts |
| \`app/api/analytics/cluster/route.ts\` | Create — Clustering API |
| \`app/api/analytics/score/route.ts\` | Create — Feasibility scoring API |

## Acceptance Criteria
- [ ] Time-to-prototype, conversion funnel, and cost-per-idea metrics are displayed.
- [ ] Idea clustering groups similar ideas correctly (manual review of results).
- [ ] Duplicate detection warns when a new idea is >85% similar to an existing one.
- [ ] Trend analysis surfaces the top 3 topics from the last 30 days.
- [ ] Feasibility score is shown on new project submission.
- [ ] Changeset generated for this PR.

## Dependencies
- Phase 4: Audit Trail (#19) — metrics rely on audit event data.
- Phase 2: Pipeline & Status Tracking (#13) — conversion funnel uses pipeline stages.
- Phase 2: Sharing & Voting (#12) — quality metrics use upvote data.

## References
- [IMPLEMENTATION_PLAN.md § Phase 6 — Advanced Analytics](../blob/main/IMPLEMENTATION_PLAN.md)
- [APP_ENHANCEMENT_IMPLEMENTATION_PLAN § Feature 6.4](../blob/main/APP_ENHANCEMENT_IMPLEMENTATION_PLAN)
`,
  },
];

// ---------------------------------------------------------------------------
// Main execution
// ---------------------------------------------------------------------------

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const repo = `https://github.com/${OWNER}/${REPO_NAME}`;
  console.log(`\n🚀  Creating Implementation Plan issues in ${repo}\n`);

  // 1. Create placeholder parent issue (will be updated later with sub-issue links)
  console.log('Creating parent tracking issue...');
  const parent = await createIssue(
    'Implementation Plan Execution: Ideas Empowerment Platform',
    parentBody('_sub-issue links will be added below once all sub-issues are created_'),
    ['enhancement', 'tracking'],
  );
  await sleep(1000);

  // 2. Create all sub-issues
  const created = [];
  for (const def of subIssues) {
    const body = def.body(parent.number);
    const issue = await createIssue(def.title, body, def.labels);
    created.push({ number: issue.number, title: def.title });
    await sleep(800); // be gentle with the API
  }

  // 3. Update parent with sub-issue links
  console.log('\nUpdating parent issue with sub-issue links...');
  const subIssueLinks = created.map((i) => `- [ ] #${i.number} — ${i.title}`).join('\n');
  await updateIssue(parent.number, parentBody(subIssueLinks));

  // 4. Print summary
  console.log('\n✅  All issues created successfully!\n');
  console.log(`Parent: #${parent.number} — Implementation Plan Execution`);
  created.forEach((i) => console.log(`  Sub-issue: #${i.number} — ${i.title}`));

  // 5. Optionally update IMPLEMENTATION_PLAN.md
  if (process.env.UPDATE_PLAN === 'true') {
    console.log('\n📝  To update IMPLEMENTATION_PLAN.md, run the update-plan.js script.');
    console.log(
      `     Pass PARENT_ISSUE=${parent.number} and the sub-issue numbers as env vars.`,
    );
  }

  // Output as JSON for downstream use (e.g. update-plan.js)
  const output = {
    parent: parent.number,
    subIssues: created,
  };
  const fs = require('fs');
  fs.writeFileSync('/tmp/created-issues.json', JSON.stringify(output, null, 2));
  console.log('\n📄  Issue numbers saved to /tmp/created-issues.json');
}

main().catch((err) => {
  console.error('❌  Error:', err.message);
  process.exit(1);
});

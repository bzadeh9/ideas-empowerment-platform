#!/usr/bin/env node
/**
 * update-plan.js
 *
 * Reads /tmp/created-issues.json (written by create-issues.js) and rewrites
 * IMPLEMENTATION_PLAN.md to replace each checklist item with a link to its
 * corresponding GitHub issue.
 *
 * Mapping key: the sub-issue title fragment (e.g. "Project Persistence")
 * maps to the relevant checklist section heading in IMPLEMENTATION_PLAN.md.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const PLAN_PATH = path.join(process.cwd(), 'IMPLEMENTATION_PLAN.md');
const ISSUES_PATH = '/tmp/created-issues.json';
const REPO = process.env.GITHUB_REPOSITORY;

if (!fs.existsSync(ISSUES_PATH)) {
  console.error('No created-issues.json found. Skipping plan update.');
  process.exit(0);
}

const { parent, subIssues } = JSON.parse(fs.readFileSync(ISSUES_PATH, 'utf8'));
const repoUrl = `https://github.com/${REPO}`;

// Map from plan section title fragment → sub-issue number
const TITLE_MAP = {
  'Project Persistence': null,
  'Structured Idea Input': null,
  'Deployment Flow': null,
  'Authentication': null,
  'Sharing, Comments': null,
  'Pipeline & Status': null,
  'Multi-Framework': null,
  'Versioning': null,
  'Error': null,
  'Organization & Team': null,
  'Innovation Challenges': null,
  'Audit': null,
  'Mobile UX': null,
  'Accessibility': null,
  'Test Coverage': null,
  'Real-Time': null,
  'Custom Model': null,
  'Marketplace': null,
  'Advanced Analytics': null,
};

// Resolve mapping
subIssues.forEach((issue) => {
  for (const key of Object.keys(TITLE_MAP)) {
    if (issue.title.includes(key)) {
      TITLE_MAP[key] = issue.number;
      break;
    }
  }
});

let plan = fs.readFileSync(PLAN_PATH, 'utf8');

// Add a "GitHub Issues" section after the Suggested GitHub Issue Structure section
const issueSectionHeader = '\n## Suggested GitHub Issue Structure';
const issueSectionAddendum = `

## GitHub Issues Created

The following GitHub issues track this implementation plan:

- 🗂 **Parent**: [#${parent} — Implementation Plan Execution: Ideas Empowerment Platform](${repoUrl}/issues/${parent})

### Phase 1 — Foundation (High Priority)
- [ ] [#${TITLE_MAP['Project Persistence']} — Phase 1: Project Persistence & History](${repoUrl}/issues/${TITLE_MAP['Project Persistence']})
- [ ] [#${TITLE_MAP['Structured Idea Input']} — Phase 1: Structured Idea Input & Templates](${repoUrl}/issues/${TITLE_MAP['Structured Idea Input']})
- [ ] [#${TITLE_MAP['Deployment Flow']} — Phase 1: Deployment Flow](${repoUrl}/issues/${TITLE_MAP['Deployment Flow']})

### Phase 2 — Collaboration & Idea Lifecycle (High Priority)
- [ ] [#${TITLE_MAP['Authentication']} — Phase 2: Authentication & Accounts](${repoUrl}/issues/${TITLE_MAP['Authentication']})
- [ ] [#${TITLE_MAP['Sharing, Comments']} — Phase 2: Sharing, Comments & Voting](${repoUrl}/issues/${TITLE_MAP['Sharing, Comments']})
- [ ] [#${TITLE_MAP['Pipeline & Status']} — Phase 2: Pipeline & Status Tracking](${repoUrl}/issues/${TITLE_MAP['Pipeline & Status']})

### Phase 3 — Generation Quality & Iteration (Medium Priority)
- [ ] [#${TITLE_MAP['Multi-Framework']} — Phase 3: Multi-Framework Generation](${repoUrl}/issues/${TITLE_MAP['Multi-Framework']})
- [ ] [#${TITLE_MAP['Versioning']} — Phase 3: Versioning & Iterative Refinement](${repoUrl}/issues/${TITLE_MAP['Versioning']})
- [ ] [#${TITLE_MAP['Error']} — Phase 3: Error Handling UX](${repoUrl}/issues/${TITLE_MAP['Error']})

### Phase 4 — Enterprise Controls (Medium Priority)
- [ ] [#${TITLE_MAP['Organization & Team']} — Phase 4: Organization & Team Management](${repoUrl}/issues/${TITLE_MAP['Organization & Team']})
- [ ] [#${TITLE_MAP['Innovation Challenges']} — Phase 4: Innovation Challenges](${repoUrl}/issues/${TITLE_MAP['Innovation Challenges']})
- [ ] [#${TITLE_MAP['Audit']} — Phase 4: Audit Trail & Compliance](${repoUrl}/issues/${TITLE_MAP['Audit']})

### Phase 5 — Experience, Accessibility, Quality (Medium-Low Priority)
- [ ] [#${TITLE_MAP['Mobile UX']} — Phase 5: Mobile UX Improvements](${repoUrl}/issues/${TITLE_MAP['Mobile UX']})
- [ ] [#${TITLE_MAP['Accessibility']} — Phase 5: Accessibility Enhancements](${repoUrl}/issues/${TITLE_MAP['Accessibility']})
- [ ] [#${TITLE_MAP['Test Coverage']} — Phase 5: Test Coverage Expansion](${repoUrl}/issues/${TITLE_MAP['Test Coverage']})

### Phase 6 — Future Differentiators (Low Priority)
- [ ] [#${TITLE_MAP['Real-Time']} — Phase 6: Real-Time Collaboration](${repoUrl}/issues/${TITLE_MAP['Real-Time']})
- [ ] [#${TITLE_MAP['Custom Model']} — Phase 6: Custom AI Model Integration](${repoUrl}/issues/${TITLE_MAP['Custom Model']})
- [ ] [#${TITLE_MAP['Marketplace']} — Phase 6: Marketplace & Plugin Ecosystem](${repoUrl}/issues/${TITLE_MAP['Marketplace']})
- [ ] [#${TITLE_MAP['Advanced Analytics']} — Phase 6: Advanced Analytics & AI Insights](${repoUrl}/issues/${TITLE_MAP['Advanced Analytics']})

> Issues are automatically checked off as their corresponding PRs are merged.
`;

// Insert the addendum before the "Suggested GitHub Issue Structure" section,
// or append to the end if the section is not found.
if (plan.includes(issueSectionHeader)) {
  plan = plan.replace(issueSectionHeader, issueSectionAddendum + issueSectionHeader);
} else {
  plan = plan.trimEnd() + '\n' + issueSectionAddendum;
}

fs.writeFileSync(PLAN_PATH, plan, 'utf8');
console.log(`✅  IMPLEMENTATION_PLAN.md updated with issue links (parent #${parent}).`);

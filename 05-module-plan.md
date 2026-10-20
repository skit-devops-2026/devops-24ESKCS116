# 05 — Module Plan and Implementation Order

## Guiding rule

Do not ask the coding agent to rebuild the whole project in one prompt. First inspect the ZIP, map the current files, and identify the smallest changes that restore the existing design. Implement one module at a time and run the app after every meaningful change.

## Module 0 — Source inspection and baseline

**Goal:** Understand the actual project before editing it.

Tasks:
- Inspect the ZIP file tree and package files.
- Identify entry points, pages, stylesheets, scripts, assets, and existing dependencies.
- Run the app as-is and record current errors.
- Note which pages work, which are broken, and which buttons are inert.
- Check whether React or backend code already exists.
- Never overwrite the project before making a backup or version-control checkpoint.
- Do not expose or copy `.env` secrets into documentation.

**Exit check:** The actual structure and startup commands are known, and the main existing UI can be reproduced or its failure documented.

## Module 1 — Repair and preserve the frontend

**Goal:** Stabilize the current UI before conversion.

Tasks:
- Fix reload loops, route problems, broken assets, and CSS regressions.
- Preserve existing visual design and working markup.
- Make navigation and visible buttons behave consistently.
- Remove only dead/duplicated code when its role is understood.
- Verify the key screens at desktop width.

**Exit check:** The existing pages render consistently, no repeated refresh loop occurs, and key navigation works.

## Module 2 — React conversion and routing

**Goal:** Use React without throwing away the design.

Tasks:
- Convert repeated UI into small components only where useful.
- Move page-level screens into components.
- Use React state for forms, dialogs, selected project, and task lists.
- Add React Router only if multiple routes need client-side navigation and it is not already present.
- Keep existing CSS class names where possible.
- Do not combine a redesign with the React conversion.

**Exit check:** The same key screens work in React, navigation is stable, and there are no avoidable console errors.

## Module 3 — Backend foundation

**Goal:** Establish a simple Express REST API.

Tasks:
- Set up or repair the Node.js/Express server.
- Add JSON parsing, CORS only where needed, environment loading, and a centralized error response approach.
- Connect Mongoose to the selected MongoDB instance.
- Add a simple health endpoint if useful for testing.
- Verify the server and database connect before implementing CRUD.

**Exit check:** Server starts predictably, database connection works, and one test API request succeeds.

## Module 4 — Authentication

**Goal:** Make signup/login/logout work and protect user data.

Tasks:
- Create the User model.
- Implement signup with input validation and password hashing.
- Implement login with password verification.
- Implement logout/session cleanup according to the selected auth approach.
- Add authentication middleware.
- Add a current-user endpoint if needed by the frontend.
- Handle duplicate emails and invalid credentials.
- Test protected endpoints with and without authentication.

**Exit check:** Signup, login, logout, and protected API behavior work. Passwords are hashed, and user-specific routes reject unauthenticated requests.

## Module 5 — Project CRUD

**Goal:** Persist projects for the authenticated user.

Tasks:
- Create the Project model.
- Implement list, create, read, update, and delete routes.
- Scope all project queries to the authenticated owner.
- Connect the existing project form and list to the API using `fetch()`.
- Add loading, empty, success, and error states.

**Exit check:** A project can be created, viewed, edited, and deleted; it remains after refresh and is only accessible to its owner.

## Module 6 — Task CRUD and status

**Goal:** Make the main task workflow functional.

Tasks:
- Create the Task model.
- Implement list/create/update/delete routes.
- Verify the selected project belongs to the authenticated user.
- Connect task forms and task lists/board to the API.
- Support status and priority updates.
- Use a simple dropdown/select for status changes; drag-and-drop is not required.
- Add delete confirmation and visible error feedback.

**Exit check:** Tasks can be created, viewed, edited, status-changed, and deleted; changes persist after refresh.

## Module 7 — Dashboard and usability

**Goal:** Make the demo coherent, not overbuilt.

Tasks:
- Calculate basic counts from real projects/tasks.
- Add useful empty states.
- Ensure form errors and failed API requests are visible.
- Check the main layout at desktop and mobile widths.
- Keep visual polish consistent with the original design.

**Exit check:** Dashboard values are not hard-coded, and the main user journey is understandable.

## Module 8 — Testing, setup guide, and viva rehearsal

**Goal:** Prepare a repeatable demonstration.

Tasks:
- Follow README setup instructions from a clean terminal.
- Test signup/login/logout.
- Test project and task CRUD.
- Refresh pages and confirm persistence.
- Test missing fields, duplicate signup, invalid login, malformed IDs, and unauthenticated requests.
- Check that one user cannot access another user's project/task by changing an ID.
- Check browser console and server terminal for errors.
- Prepare a demo account only if permitted; never hard-code credentials into source.
- Practice explaining one request end-to-end.

**Exit check:** All P0 acceptance criteria pass and the app can be demonstrated without relying on a lucky preloaded state.

## Dependency order

```text
Inspect ZIP
   ↓
Repair existing UI
   ↓
React conversion/routing
   ↓
Express + MongoDB connection
   ↓
Authentication
   ↓
Project CRUD
   ↓
Task CRUD
   ↓
Dashboard/usability
   ↓
Testing + viva
```

## Scope freeze

Do not start optional features while a P0 item is broken. Specifically postpone AI, realtime, team roles, workspaces, sprints, attachments, comments, notifications, calendar, charts, drag-and-drop, dark mode, and external integrations.

## Per-module working agreement

For each change:
1. State which files will change and why.
2. Make a small, focused edit.
3. Explain the new/changed logic in beginner-friendly terms.
4. Run the app or relevant API test.
5. Report what passed and what remains.
6. Do not claim a feature works without testing it.

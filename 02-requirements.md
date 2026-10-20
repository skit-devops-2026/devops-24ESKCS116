# 02 — Requirements and Acceptance Criteria

## 1. Product scope

DevFlow is a single-user-oriented project/task manager with authentication and database persistence. Authentication is required. Team collaboration is outside the minimum scope.

## 2. Functional requirements

### FR-01: Landing and navigation
- The application must retain the existing visual design as much as possible.
- Navigation links and buttons must lead to the correct screen or perform their stated action.
- Unknown routes should show a reasonable fallback or redirect.

### FR-02: Registration
- A new user can submit a name, email, and password.
- Required fields must be validated.
- Invalid email, missing values, or a password that does not meet the chosen minimum rule must produce a clear message.
- Duplicate email addresses must not create duplicate accounts.
- Passwords must never be stored as plain text.

### FR-03: Login and logout
- A registered user can log in with email and password.
- Incorrect credentials must produce a generic error message.
- A logged-in user can log out.
- Protected pages and API operations must reject unauthenticated requests.

### FR-04: Project management
- The user can create a project with a name and optional description.
- The user can view their saved projects.
- The user can edit a project's name/description.
- The user can delete a project after confirmation.
- Projects must be associated with the authenticated user.

### FR-05: Task management
- The user can create a task under a project.
- A task has a title, optional description, status, and priority.
- Status options: `To Do`, `In Progress`, `Done`.
- Priority options: `Low`, `Medium`, `High`.
- The user can view tasks, edit them, change their status, and delete them.
- The task must belong to a project owned by the authenticated user.

### FR-06: Dashboard
- The main screen should show a useful project/task overview.
- Where practical, show simple counts such as total projects, total tasks, and completed tasks.
- Counts must be derived from actual saved data, not hard-coded sample values.

### FR-07: Persistence
- Created or edited data must be saved through the backend to MongoDB.
- Reloading the page must not remove saved projects or tasks.
- The UI must show a useful error if an API request fails.

### FR-08: Validation and feedback
- Forms must prevent submission when required values are missing.
- The UI should provide success/error feedback for create, update, and delete actions.
- Destructive actions should require confirmation when consistent with the existing design.

## 3. Non-functional requirements

- **Understandability:** Use clear variable/function names and short, focused functions.
- **Maintainability:** Separate frontend, backend routes, models, and middleware.
- **Security basics:** Hash passwords, validate inputs, protect API routes, and enforce ownership checks.
- **Reliability:** Handle missing records, invalid IDs, database errors, and invalid credentials.
- **Usability:** Preserve the current design, keep controls predictable, and include empty states.
- **Responsiveness:** Existing screens should remain usable at common desktop and mobile widths.
- **Setup:** Provide a README with exact install/run instructions and environment variables.

## 4. Acceptance criteria / demo checklist

The project is considered ready when all required checks below pass:

- [ ] App starts without console/build errors.
- [ ] Existing key pages render without flicker or repeated refresh loops.
- [ ] Signup creates an account and duplicate signup is rejected.
- [ ] Login works; incorrect credentials are rejected.
- [ ] Logout works and protected data is no longer accessible without login.
- [ ] A project can be created, listed, edited, and deleted.
- [ ] A task can be created under a project, listed, edited, status-changed, and deleted.
- [ ] Projects/tasks remain after page refresh.
- [ ] A user cannot access another user's projects/tasks by changing an ID in a request.
- [ ] Empty, loading, and error states are understandable.
- [ ] The README setup instructions work on the demo machine.
- [ ] The student can explain the React UI, API request, Express route, Mongoose model, and authentication check for one complete operation.

## 5. Priority levels

**P0 — Must work:** startup, existing design, signup/login/logout, protected data, project CRUD, task CRUD, database persistence, demo reliability.

**P1 — Add only after P0 passes:** dashboard counts, search/filter, better responsive details, polished empty states.

**P2 — Not required for submission:** AI, realtime, comments, attachments, calendar, sprints, notifications, charts, drag-and-drop, team collaboration.

## 6. Assumptions and unresolved decision

- The current source will be supplied as a ZIP and inspected before changing files.
- Authentication is required.
- Database choice remains undecided. Recommended default is MongoDB Atlas if it can be connected quickly; use local MongoDB if it is already installed and working.
- No credentials, tokens, or `.env` secrets should be included in the source ZIP.

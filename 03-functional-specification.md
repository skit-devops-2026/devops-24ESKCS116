# 03 — Functional Specification

## 1. Main user flow

1. User opens the landing page.
2. User chooses Sign Up or Login.
3. After successful authentication, the app opens the protected dashboard.
4. User creates a project.
5. User opens a project and creates tasks.
6. User changes task details or status as work progresses.
7. The user refreshes the page and confirms that saved data remains.
8. User logs out.

## 2. Screen behavior

### 2.1 Landing page
- Preserve existing structure, colors, typography, spacing, and imagery where practical.
- Repair broken links, nonfunctional buttons, and layout issues.
- Sign Up and Login controls navigate to their respective routes.

### 2.2 Signup page
**Inputs:** name, email, password, and confirmation password if the existing design contains it.

**Behavior:**
- Trim text inputs where appropriate.
- Validate required fields and email format.
- If confirmation is present, ensure passwords match.
- Submit to the backend signup endpoint.
- On success, show confirmation and navigate to login or the dashboard, depending on the implemented auth flow.
- On failure, show a human-readable message without exposing server internals.

### 2.3 Login page
**Inputs:** email and password.

**Behavior:**
- Validate required fields.
- Submit credentials to the backend.
- On success, establish the authenticated session and navigate to the dashboard.
- On failure, show a generic invalid-credentials message.
- Do not reveal whether an email exists in the system.

### 2.4 Dashboard
- Use the existing layout and navigation.
- Show summary counts based on real data when feasible.
- Provide quick access to Projects and the task board/list.
- Show a helpful empty state when no projects or tasks exist.
- Show a loading indicator while data is being fetched and a clear error if loading fails.

### 2.5 Projects
**Project fields:** name (required), description (optional).

**Create:** open the existing form/modal or a simple form; validate name; submit to API; update the list after success.

**Read:** fetch only the current user's projects.

**Update:** populate the form with current values; save changes; refresh the visible project.

**Delete:** ask for confirmation; delete the project and its tasks, or handle related tasks consistently. The selected implementation must not leave confusing orphan tasks.

**Errors:** show messages for invalid input, failed requests, or a missing project.

### 2.6 Tasks
**Task fields:**
- `title` — required string.
- `description` — optional string.
- `status` — `To Do`, `In Progress`, or `Done`; defaults to `To Do`.
- `priority` — `Low`, `Medium`, or `High`; defaults to `Medium`.
- `projectId` — required reference to a project owned by the current user.

**Create:** validate title and project; submit to API; add the returned task to the visible list/board.

**Read:** fetch tasks for the selected project.

**Update:** allow editing title, description, status, and priority; save to API.

**Status change:** provide a simple select/dropdown or button action. Drag-and-drop is not required.

**Delete:** ask for confirmation where appropriate; delete the task and update the UI.

**Errors:** display validation and API errors; do not silently pretend an unsuccessful save worked.

## 3. API contract

All endpoints use JSON request/response bodies unless otherwise stated. Exact response wrapper names may be aligned with the existing code after the ZIP is inspected.

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Register an account |
| POST | `/api/auth/login` | Authenticate a user |
| POST | `/api/auth/logout` | End the session |
| GET | `/api/auth/me` | Return the current authenticated user |

### Projects

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/projects` | List current user's projects |
| POST | `/api/projects` | Create a project |
| GET | `/api/projects/:id` | Read one owned project |
| PUT | `/api/projects/:id` | Update an owned project |
| DELETE | `/api/projects/:id` | Delete an owned project |

### Tasks

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/projects/:projectId/tasks` | List tasks for an owned project |
| POST | `/api/projects/:projectId/tasks` | Create a task in an owned project |
| GET | `/api/tasks/:id` | Read an owned task |
| PUT | `/api/tasks/:id` | Update an owned task |
| DELETE | `/api/tasks/:id` | Delete an owned task |

The backend must verify project/task ownership for every relevant request. A frontend-only check is not sufficient.

## 4. Validation rules

- Name and project name: non-empty after trimming.
- Email: required and valid format.
- Password: required; choose and document a reasonable minimum length.
- Task title: non-empty after trimming.
- Status and priority: accept only the listed values.
- IDs: reject malformed MongoDB IDs with a client error rather than returning a server crash.
- Never trust a user ID supplied by the frontend; derive the current user from the verified session/token.

## 5. Expected error behavior

- `400 Bad Request`: invalid input or malformed ID.
- `401 Unauthorized`: missing or invalid authentication.
- `404 Not Found`: record does not exist or is not accessible to this user.
- `409 Conflict`: duplicate email during signup.
- `500 Internal Server Error`: unexpected failure; return a generic message and log details server-side.

## 6. Interface states

Every data-driven page should handle:
- Loading: request is in progress.
- Success: records are shown.
- Empty: no records exist yet, with a relevant next action.
- Error: request failed, with a retry path where practical.

## 7. Authentication behavior

Authentication must use a standard token/session flow rather than a hard-coded user. Passwords must be hashed with `bcrypt`/`bcryptjs`. The backend must verify authentication for protected endpoints. The exact token transport and cookie configuration will be selected after inspecting the current code and setup constraints. Never commit secret keys or database credentials.

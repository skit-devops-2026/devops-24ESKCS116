# 01 — Research and Project Rationale

## 1. Project overview

**DevFlow** is a web-based project and task management application. It brings a user's projects and their tasks into one place, allowing progress to be tracked through simple task statuses.

The original concept describes a larger AI-assisted collaboration platform. For this academic submission, the project is deliberately scoped to a small, functional full-stack application that demonstrates concepts from the Full Stack Development syllabus.

## 2. Problem statement

When work is tracked informally through scattered notes or messages, it can be difficult to answer basic questions:

- What projects are currently active?
- Which tasks need to be completed?
- What is the status of each task?
- Has a task or project change been saved?

DevFlow addresses this basic problem by providing a single interface for projects and their tasks.

## 3. Intended users

- Students managing academic or personal projects.
- Individuals who need a simple overview of project tasks.
- Small teams in a future version.

The submitted version is primarily designed for a single authenticated user. Team collaboration is not required for the minimum viable product.

## 4. Project objectives

1. Preserve and repair the existing interface instead of rebuilding it unnecessarily.
2. Convert the frontend to React where practical and useful.
3. demonstrate client-side navigation and reusable components.
4. Provide a Node.js and Express backend with REST endpoints.
5. Store users, projects, and tasks in MongoDB using Mongoose.
6. Provide signup/login and protect user-specific data.
7. Implement practical CRUD operations.
8. Keep the code simple enough to explain during a live demonstration and viva.

## 5. Proposed solution

The user opens DevFlow, registers or logs in, and reaches the main application. The user can create projects and add tasks to them. Each task can include a title, description, priority, and status. Tasks can be edited, deleted, and moved between statuses. The data is saved in the database and loaded again when the application is refreshed.

## 6. Why this scope is appropriate

The course syllabus covers HTML, CSS, JavaScript, React, routing, Node.js, Express, REST APIs, MongoDB, Mongoose, authentication, and data storage. DevFlow can demonstrate these concepts directly without requiring a complex framework or many external services.

A smaller, working implementation is preferred over a large set of incomplete features. The project will prioritize reliable behavior, understandable code, and a repeatable demonstration.

## 7. Scope boundaries

### Included in the target version

- Existing landing/app design retained and repaired.
- React components and routing.
- Signup, login, logout, and protected application routes.
- Project create/read/update/delete.
- Task create/read/update/delete.
- Task status and priority.
- Dashboard counts or summaries derived from saved projects/tasks, if feasible without a chart library.
- Express REST API.
- MongoDB/Mongoose persistence.
- Input validation, loading/error feedback, and basic responsive behavior.

### Not included in the minimum version

- AI summaries or AI task generation.
- Real-time multi-user synchronization.
- Workspaces, teams, invitations, or complex role permissions.
- Sprints, recurring tasks, or custom workflow builders.
- File attachments, comments, mentions, or notifications.
- Calendar and Gantt views.
- Drag-and-drop library.
- Advanced analytics, charts, dark mode, mobile app, or external integrations.

## 8. Research note

The original project blueprint proposed a much broader system using Next.js, TypeScript, Supabase, PostgreSQL, Drizzle, realtime subscriptions, and multiple UI/state libraries. Those ideas remain possible future directions, but they are not mandatory for the scoped academic version. The chosen implementation favors the syllabus stack and the student's ability to explain it.

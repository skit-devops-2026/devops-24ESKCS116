# DevFlow — Project Documentation Pack

**Purpose:** A small, demonstrable full-stack project-management application for the Full Stack Development subject.

This documentation is the agreed implementation baseline. It is intentionally smaller than the original DevFlow research blueprint so the project can be completed, tested, and explained in a viva before the submission deadline.

## Document index

1. `01-research.md` — problem, audience, purpose, and scope rationale.
2. `02-requirements.md` — functional/non-functional requirements and acceptance criteria.
3. `03-functional-specification.md` — page behavior, user flows, validation, and error states.
4. `04-system-design.md` — technology choices, architecture, data model, APIs, and security.
5. `05-module-plan.md` — implementation order, dependencies, and testing checklist.
6. `06-viva-study-guide.md` — plain-language explanations and likely viva questions.

## Decisions already made

- **Project name:** DevFlow.
- **Source code:** Existing project will be provided as a ZIP.
- **Design:** Preserve the existing design and repair it; do not redesign without a clear reason.
- **Authentication:** Required.
- **Database:** Not decided yet. Recommended default: MongoDB Atlas if an account/network connection is available; otherwise local MongoDB if already installed.
- **Frontend migration:** Inspect and stabilize the current HTML/CSS/JavaScript before converting it into React. Do not discard working UI.
- **Implementation style:** Use the simplest code that can be demonstrated and explained. Avoid unnecessary dependencies and hidden abstractions.

## Important limitation

The source ZIP has not yet been inspected while these documents are being prepared. Therefore, folder paths, existing components, current bugs, and the exact migration steps must be confirmed after the ZIP is uploaded. These documents describe the target behavior and architecture, not a claim that the current code already implements it.

## Definition of a successful submission

A user can sign up, log in, reach the main app, create and manage projects and tasks, change task status, refresh the page without losing saved data, and log out. The main screens retain the existing visual design. The application runs locally using documented setup steps, and the student can explain the major files, React state, API calls, authentication flow, and database operations.

## Keep the scope under control

Do not add AI, realtime collaboration, workspace invitations, sprints, attachments, calendar integration, drag-and-drop libraries, complex roles, charts, dark mode, or third-party integrations unless every required feature is stable and there is verified time left.



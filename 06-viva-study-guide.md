# 06 — Viva Study Guide

Use this to study the implementation that is actually present. Do not memorize claims about features that were not built.

## 1. One-minute project explanation

“DevFlow is a project and task management web application. The frontend is built with React and preserves the original design. React handles the interface and user interactions. It sends HTTP requests using `fetch()` to a Node.js/Express REST API. The backend validates requests, checks authentication and ownership, and uses Mongoose to read or write data in MongoDB. Users can register and log in, then create projects and manage tasks with status and priority. The purpose is to demonstrate frontend development, React, REST APIs, backend routing, authentication, and database CRUD.”

Adapt this explanation to match the final implementation exactly.

## 2. Core concepts to understand

### HTML, CSS, and JavaScript
- **HTML:** describes page structure and semantic elements.
- **CSS:** controls layout, colors, spacing, typography, and responsive behavior.
- **JavaScript:** adds behavior, event handling, validation, and API communication.
- **DOM:** the browser's object representation of the page.
- **JSON:** a text format used to exchange structured data between frontend and backend.

### React
- **Component:** a reusable piece of UI.
- **JSX:** syntax that lets React components describe UI using HTML-like markup.
- **Props:** data passed from a parent component to a child component.
- **State:** component data that can change; updating it causes React to render the relevant UI again.
- **Event handler:** a function that runs after an action such as a click or form submission.
- **Controlled input:** a form field whose displayed value is managed by React state.
- **React Router:** maps URL paths to components in a single-page application, if used.
- **SPA:** a single-page application that updates its interface without a full document reload for each internal route.

### Node.js and Express
- **Node.js:** runs JavaScript outside the browser.
- **Express:** a framework for defining HTTP routes and middleware.
- **REST API:** an interface that uses HTTP methods and resource-oriented URLs.
- **Middleware:** a function that runs during the request/response pipeline, for example to authenticate a user.
- **`req`:** request data from the client.
- **`res`:** response sent back to the client.
- **`next()`:** passes control to the next middleware/handler when appropriate.
- **`fetch()`:** browser API for making HTTP requests.

### MongoDB and Mongoose
- **MongoDB:** document-oriented database.
- **Document:** one stored record, represented in a BSON/JSON-like structure.
- **Collection:** group of documents, broadly comparable to a table in a relational database.
- **Mongoose:** library that defines schemas/models and performs database operations.
- **Schema:** describes fields, types, defaults, and validation.
- **Model:** interface used to query and modify a collection.
- **CRUD:** Create, Read, Update, Delete.
- **ObjectId:** MongoDB identifier commonly used for document references.

### Authentication and security
- **Authentication:** confirms who the user is.
- **Authorization:** decides what that user is allowed to access.
- **Password hashing:** stores a one-way hash rather than the original password.
- **Token/session:** evidence used by the server to recognize an authenticated request.
- **Ownership check:** ensures the current user can only read or change their own data.
- **Environment variable:** configuration supplied outside source code, often used for secrets and database connection strings.

## 3. Common viva questions

**Q1. Why did you choose React?**  
React supports reusable components and state-driven UI updates. It also fits the syllabus and allows the existing interface to be split into manageable pieces.

**Q2. What is the difference between frontend and backend?**  
The frontend runs in the browser and presents the interface. The backend runs on the server, validates requests, applies application rules, authenticates requests, and accesses the database.

**Q3. What happens when you create a task?**  
The user submits a form; React checks required fields and sends a POST request with JSON. Express receives the request, authentication middleware identifies the user, the route validates the project and input, Mongoose saves the task in MongoDB, and the server returns JSON. React then updates the UI.

**Q4. Why is a backend needed if React can display data?**  
React can display and temporarily manage data, but the backend provides a controlled place to validate requests, authenticate users, enforce ownership, and save data to the database.

**Q5. What is CRUD? Give examples.**  
Create adds a project/task, Read lists or opens it, Update edits its fields/status, and Delete removes it.

**Q6. Why use MongoDB?**  
MongoDB stores records as documents and is part of the course syllabus. Mongoose adds schemas and convenient database methods.

**Q7. What is Mongoose?**  
It is an object data modeling library for MongoDB. We define schemas/models and use them to create, find, update, and delete documents.

**Q8. Why must passwords be hashed?**  
If the database is exposed, plain-text passwords would be immediately readable. A password hash avoids storing the original password. The application verifies a submitted password against the stored hash.

**Q9. What is authentication middleware?**  
It checks whether a request has valid authentication before allowing it to reach a protected route.

**Q10. Why validate on both frontend and backend?**  
Frontend validation improves user experience, but clients can bypass it. Backend validation protects the API and database.

**Q11. What is the difference between `GET`, `POST`, `PUT`, and `DELETE`?**  
`GET` retrieves data, `POST` creates a resource, `PUT` updates a resource, and `DELETE` removes a resource.

**Q12. What is JSON?**  
A lightweight text format for representing objects and arrays. It is commonly used as the request and response format for REST APIs.

**Q13. Why is ownership checking important?**  
A user might change a resource ID in a request. The server must verify that the requested project/task belongs to the authenticated user; hiding a link in the UI is not security.

**Q14. What is an HTTP status code?**  
A number that communicates the result of a request. For example, `200` means success, `201` created, `400` invalid request, `401` unauthenticated, `404` not found, and `500` server error.

**Q15. What is the purpose of `.env`?**  
It holds environment-specific configuration such as a database URI or token secret outside the committed source code.

**Q16. What are the limitations of this version?**  
The scoped version focuses on core single-user project/task management. Real-time collaboration, team roles, attachments, calendar, AI features, and advanced reporting are future scope, not claimed as implemented.

## 4. Code walkthrough checklist

For every important file, be ready to answer:
- What does this file do?
- What calls or imports it?
- What data comes into it?
- What data does it return or display?
- What happens on success?
- What happens on failure?
- How does it relate to React, Express, authentication, or MongoDB?

For one create-task flow, identify:
1. The form component.
2. The React state and submit handler.
3. The `fetch()` request.
4. The Express route.
5. The authentication/ownership check.
6. The Mongoose model call.
7. The JSON response.
8. The UI update.

## 5. Viva honesty rule

If a feature was not implemented, say so and explain it as future scope. Do not claim realtime, AI, advanced security, or team collaboration merely because they appear in the original blueprint.

# Project 24 – Online Course Management Dashboard

Comprehensive checklist documenting where each requirement from the brief is implemented in this Angular 17 workspace.

## 1. Environment Setup & TypeScript Fundamentals
- Angular CLI workspace using standalone APIs with application config ([src/app/app.config.ts](../src/app/app.config.ts)).
- Strongly typed domain models for courses, students, enrollments, and dashboard metrics ([src/app/shared/models](../src/app/shared/models)).
- Reusable utility classes/services (e.g., `CourseService`, `StudentService`) encapsulate domain logic.

## 2. Component Development
- Dashboard analytics: [src/app/features/dashboard/components](../src/app/features/dashboard/components).
- Course management views (`course-list`, `course-detail`, `course-form`): [src/app/features/courses/components](../src/app/features/courses/components).
- Student roster screens: [src/app/features/students/components](../src/app/features/students/components).
- Enrollment workflows (list + assign forms): [src/app/features/enrollments/components](../src/app/features/enrollments/components).
- Shared UI elements (dialogs, unauthorized/not-found, feedback widgets) live under [src/app/shared/components](../src/app/shared/components).

## 3. Routing & Navigation
- Application-level routing with lazy-loaded feature routes defined in [src/app/app.routes.ts](../src/app/app.routes.ts).
- Course child routes for `new`, `:id`, and `:id/edit` in [src/app/features/courses/courses.routes.ts](../src/app/features/courses/courses.routes.ts).
- Guards applied per requirement:
  - `authGuard` ensures authentication for every protected route ([src/app/core/guards/auth.guard.ts](../src/app/core/guards/auth.guard.ts)).
  - `roleGuard` restricts instructor/admin-only areas ([src/app/core/guards/role.guard.ts](../src/app/core/guards/role.guard.ts)).

## 4. Services & Dependency Injection
- REST-backed services: `CourseService`, `StudentService`, `EnrollmentService`, etc. in [src/app/features/*/services](../src/app/features).
- Services injected into components/dialogs to keep presentation logic lean.
- RxJS `Observable` patterns (`subscribe`, `forkJoin`, custom `filterPredicate`) drive asynchronous flows.

## 5. Forms & Validation
- Reactive Forms: course create/edit ([course-form.component.ts](../src/app/features/courses/components/course-form/course-form.component.ts)) and student registration ([student-form.component.ts](../src/app/features/students/components/student-form/student-form.component.ts)).
- Template-driven forms: feedback/contact module ([src/app/features/feedback/components](../src/app/features/feedback/components)).
- Validation messages + Material form-field hints surface inline errors across both approaches.

## 6. Data Fetching & HTTP Communication
- `HttpClient` usage centralized in services; CRUD helpers cover GET/POST/PUT/PATCH/DELETE.
- Interceptors stack (logging, auth token injection, global error handler) registered in [src/app/app.config.ts](../src/app/app.config.ts) via `provideHttpClient(withInterceptors(...))`.
- JSON Server mock API consumed from `src/assets/data/db.json` (see `package.json` scripts for dev server command).

## 7. Pipes & Directives
- Built-in pipes widely used (`date`, `currency`, `percent`).
- Custom pipes in [src/app/shared/pipes](../src/app/shared/pipes) (e.g., `duration`, `time-ago`, `filter`).
- Highlight directive now applied to course rows to emphasize high-popularity entries ([course-list.component.html](../src/app/features/courses/components/course-list/course-list.component.html)).

## 8. UI Design with Angular Material
- Material modules leveraged per feature: tables, dialogs, form fields, chips, tooltips, snack bars, cards.
- Dashboard redesign mirrors Coursera/Udemy admin aesthetics with stat cards, insights, charts, funnel, and alerts.
- Responsive layouts via CSS grid + Angular Material breakpoints ensure usability on tablet/desktop.

## 9. Dashboard & Analytics Highlights
- Dense KPI row with drill-down dialogs (`DashboardDetailDialogComponent`).
- Chart.js visualizations (trend line, revenue bars, doughnut charts) with fixed-height containers to preserve ratios.
- Engagement snapshot, learning funnel, and course alerts data derived client-side for instant insight.

## 10. Documentation & Screenshots
Capture or update the following screenshots (place files under `docs/images/`):
1. `docs/images/dashboard-overview.png` – Dashboard stat cards & charts.
2. `docs/images/course-management.png` – Course list filters + directive highlight.
3. `docs/images/forms.png` – Reactive course form and template-driven feedback form.

Add the images later and reference this document for presentations or portfolio submissions.

---
**Usage Tip:** Run `npm start` (Angular dev server) alongside `json-server --watch src/assets/data/db.json --port 3000` to exercise the entire workflow end-to-end.

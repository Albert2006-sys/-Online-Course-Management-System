# Online Course Management Dashboard

A comprehensive, production-ready Angular 17 application for managing online courses, students, and enrollments with powerful analytics and modern UI/UX.

## 🚀 Features

### Core Functionality
- **Course Management**: Create, read, update, delete courses with detailed information
- **Student Management**: Register students, track enrollment history, monitor performance
- **Enrollment System**: Enroll students in courses, track progress, submit grades
- **Analytics Dashboard**: Visual insights with Chart.js (pie, line, bar charts)
- **Feedback System**: Template-driven contact form with validation

### Technical Highlights
- ✅ **Angular 17** with standalone components API
- ✅ **TypeScript** with strict mode enabled
- ✅ **Angular Material** for consistent UI/UX
- ✅ **RxJS** for reactive programming
- ✅ **JSON Server** for mock REST API
- ✅ **Chart.js** for data visualization
- ✅ **Lazy Loading** for optimized performance
- ✅ **Route Guards** for authentication & authorization
- ✅ **HTTP Interceptors** for auth, error handling, logging
- ✅ **Custom Pipes & Directives** for reusable functionality

## 📋 Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Angular CLI**: v17.x

## 🛠️ Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd Online_Course
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Verify installation**:
   ```bash
   npm list --depth=0
   ```

## 🎯 Quick Start

### Option 1: Concurrent Mode (Recommended)

Run both development server and JSON Server simultaneously:

```bash
npm start
```

This will:
- Start Angular dev server on `http://localhost:4200`
- Start JSON Server on `http://localhost:3000`

### Option 2: Separate Terminals

**Terminal 1 - Angular Dev Server**:
```bash
ng serve
```

**Terminal 2 - JSON Server**:
```bash
npm run json-server
```

### Access the Application

- **Frontend**: http://localhost:4200
- **API**: http://localhost:3000
- **Mock Data**: http://localhost:3000/db

## 🏗️ Project Structure

```
src/
├── app/
│   ├── core/                          # Singleton services, guards, interceptors
│   │   ├── guards/
│   │   │   ├── auth.guard.ts          # Authentication guard
│   │   │   └── role.guard.ts          # Role-based authorization guard
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts    # JWT token injection
│   │   │   ├── error.interceptor.ts   # Global error handling
│   │   │   └── logging.interceptor.ts # HTTP request/response logging
│   │   └── services/
│   │       └── auth.service.ts        # Authentication service
│   │
│   ├── features/                      # Feature modules (lazy loaded)
│   │   ├── courses/
│   │   │   ├── components/
│   │   │   │   ├── course-list/       # MatTable with filters, pagination
│   │   │   │   ├── course-detail/     # Detailed course view with stats
│   │   │   │   ├── course-form/       # Reactive form for CRUD
│   │   │   │   └── course-delete-dialog/ # Confirmation dialog
│   │   │   ├── services/
│   │   │   │   └── course.service.ts  # Course CRUD operations
│   │   │   └── routes.ts              # Course routing
│   │   │
│   │   ├── students/
│   │   │   ├── components/
│   │   │   │   ├── student-list/      # Student management table
│   │   │   │   ├── student-detail/    # Student profile & enrollments
│   │   │   │   └── student-form/      # Student registration form
│   │   │   ├── services/
│   │   │   │   └── student.service.ts
│   │   │   └── routes.ts
│   │   │
│   │   ├── enrollments/
│   │   │   ├── components/
│   │   │   │   ├── enrollment-list/   # Enrollment tracking
│   │   │   │   └── enrollment-form/   # Create enrollments
│   │   │   ├── services/
│   │   │   │   └── enrollment.service.ts
│   │   │   └── routes.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   └── dashboard.component.ts # Analytics & charts
│   │   │   ├── services/
│   │   │   │   └── dashboard.service.ts
│   │   │   └── routes.ts
│   │   │
│   │   └── feedback/
│   │       ├── components/
│   │       │   └── feedback.component.ts # Template-driven form
│   │       ├── services/
│   │       │   └── feedback.service.ts
│   │       └── routes.ts
│   │
│   ├── shared/                        # Shared resources
│   │   ├── models/                    # TypeScript interfaces & enums
│   │   │   ├── course.model.ts
│   │   │   ├── student.model.ts
│   │   │   ├── enrollment.model.ts
│   │   │   ├── common.model.ts
│   │   │   └── index.ts
│   │   ├── pipes/                     # Custom pipes
│   │   │   ├── duration.pipe.ts       # Format hours
│   │   │   ├── truncate.pipe.ts       # Shorten text
│   │   │   ├── time-ago.pipe.ts       # Relative time
│   │   │   ├── safe-html.pipe.ts      # Sanitize HTML
│   │   │   ├── filter.pipe.ts         # Array filtering
│   │   │   ├── order-by.pipe.ts       # Array sorting
│   │   │   └── index.ts
│   │   └── directives/                # Custom directives
│   │       ├── highlight.directive.ts # Hover highlight
│   │       ├── auto-focus.directive.ts # Auto-focus inputs
│   │       ├── click-outside.directive.ts # Outside click detection
│   │       ├── tooltip.directive.ts   # Custom tooltips
│   │       ├── copy-to-clipboard.directive.ts # Copy functionality
│   │       ├── loading.directive.ts   # Loading state
│   │       └── index.ts
│   │
│   ├── app.component.ts               # Root component
│   ├── app.config.ts                  # App configuration
│   └── app.routes.ts                  # Main routing
│
├── assets/
│   └── data/
│       └── db.json                    # Mock database (JSON Server)
│
├── environments/
│   ├── environment.ts                 # Production config
│   └── environment.development.ts     # Development config
│
└── styles/
    ├── styles.scss                    # Global styles
    ├── _variables.scss                # SCSS variables
    └── _mixins.scss                   # SCSS mixins
```

## 📊 Data Models

### Course
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  duration: number; // hours
  price: number;
  instructor: string;
  thumbnail: string;
  rating: number;
  enrollmentCount: number;
  isActive: boolean;
  tags: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Student
```typescript
interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  address: Address;
  educationLevel: EducationLevel;
  interests: string[];
  enrolledCourses: string[];
  status: StudentStatus;
  profileImage?: string;
  totalCoursesCompleted: number;
  averageGrade?: number;
  createdAt: string;
  updatedAt: string;
}
```

### Enrollment
```typescript
interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  enrollmentDate: string;
  status: EnrollmentStatus;
  progress: number; // 0-100
  grade?: number; // 0-100
  completionDate?: string;
}
```

## 🎨 UI Components

### Dashboard
- 8 statistics cards with gradient backgrounds
- Category distribution pie chart
- Enrollment trends line chart (6 months)
- Course performance bar chart (Top 10)
- Quick action buttons

### Course Management
- **List View**: MatTable with search, filters (category, level, status), pagination
- **Detail View**: Course info, statistics, enrollment analytics
- **Form**: Reactive form with validation, chips for tags/prerequisites
- **Delete**: Confirmation dialog

### Student Management
- **List View**: MatTable with avatar display, status chips
- **Detail View**: Profile card, enrollment history, performance metrics
- **Form**: Nested address form, interests chips, education level

### Enrollment Management
- **List View**: Progress bars, grade display, date range filter
- **Form**: Course/student dropdowns, duplicate validation

## 🔒 Authentication & Authorization

### Login Credentials (Demo)
```typescript
// Admin Access
Username: admin
Password: admin123

// Instructor Access
Username: instructor
Password: inst123
```

### Route Protection
- `authGuard`: Protects all routes except login
- `roleGuard`: Restricts access based on user role (admin/instructor)

### Protected Routes
- `/students` - Requires admin or instructor role
- `/enrollments` - Requires admin or instructor role
- `/courses`, `/dashboard`, `/feedback` - Requires authentication

## 🛠️ Available Scripts

```bash
# Development
npm start                 # Start dev server + JSON server
ng serve                  # Start only Angular dev server
npm run json-server       # Start only JSON server

# Build
npm run build             # Production build
npm run build:dev         # Development build

# Testing
npm test                  # Run unit tests
npm run test:coverage     # Run tests with coverage

# Linting
npm run lint              # Run ESLint

# Other
ng generate component <name>  # Generate new component
ng generate service <name>    # Generate new service
```

## 🎯 Key Features Explained

### 1. Custom Pipes
- **duration**: `{{ 125 | duration }}` → "125 hours (5d 5h)"
- **truncate**: `{{ longText | truncate:50 }}` → "This is a very long text that will be trunca..."
- **timeAgo**: `{{ date | timeAgo }}` → "2 hours ago"
- **filter**: `{{ items | filter:searchTerm:'name' }}`
- **orderBy**: `{{ items | orderBy:'price':'desc' }}`

### 2. Custom Directives
- **appHighlight**: Hover highlighting with custom color
- **appAutoFocus**: Auto-focus form fields on load
- **clickOutside**: Detect clicks outside element
- **appTooltip**: Custom tooltip with positioning
- **appCopyToClipboard**: Copy text to clipboard
- **appLoading**: Loading state indicator

### 3. HTTP Interceptors
- **Auth Interceptor**: Adds JWT token to requests
- **Error Interceptor**: Global error handling with MatSnackBar
- **Logging Interceptor**: Logs all HTTP requests/responses

### 4. State Management
- BehaviorSubject caching in services
- RxJS operators (map, tap, catchError, switchMap, forkJoin)
- Optimistic UI updates

## 📈 Performance Optimizations

- ✅ Lazy loading for feature modules
- ✅ OnPush change detection strategy (where applicable)
- ✅ Pure pipes for data transformation
- ✅ TrackBy functions in *ngFor loops
- ✅ HTTP response caching with BehaviorSubject
- ✅ Chart.js instance cleanup in ngOnDestroy

## 🎨 Theming

The application uses Angular Material's theming system with a custom color palette:

```scss
$primary: #3f51b5;   // Indigo
$accent: #ff4081;    // Pink
$warn: #f44336;      // Red
```

## 🧪 Testing

Run unit tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

Output will be in `dist/online-course-management-dashboard/`.

### Environment Configuration
Update `src/environments/environment.ts` for production settings:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-url.com'
};
```

## 📝 Mock Data

The application includes realistic mock data in `src/assets/data/db.json`:
- **10 Courses**: Across 10 categories (Web Dev, Data Science, Cloud, etc.)
- **10 Students**: With addresses, enrollments, grades
- **22 Enrollments**: Various statuses and progress levels
- **5 Feedback**: Sample user feedback

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Change Angular port
ng serve --port 4300

# Change JSON Server port
json-server --watch src/assets/data/db.json --port 3001
```

### Module Not Found
```bash
npm install
npm cache clean --force
npm install
```

### CORS Issues
JSON Server automatically handles CORS. If issues persist, check browser console for specific errors.

## 📚 Technologies Used

| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 17.3.0 | Frontend framework |
| TypeScript | 5.4.2 | Type-safe JavaScript |
| Angular Material | 17.3.0 | UI component library |
| RxJS | 7.8.0 | Reactive programming |
| Chart.js | 4.4.0 | Data visualization |
| JSON Server | 0.17.4 | Mock REST API |
| SCSS | - | Styling |

## 🤝 Contributing

This is a demonstration project. For educational purposes, feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is created for educational and demonstration purposes.

## 👨‍💻 Author

Created as a comprehensive Angular 17 demonstration project.

## 🙏 Acknowledgments

- Angular Team for the amazing framework
- Material Design for UI/UX guidelines
- Chart.js for visualization capabilities
- JSON Server for easy mocking

---

**Happy Coding! 🚀**

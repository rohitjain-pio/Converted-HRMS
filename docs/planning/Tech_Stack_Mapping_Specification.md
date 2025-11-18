# Tech Stack Mapping Specification - Module 3 Attendance Management

**Version:** v1.0.0  
**Date:** November 13, 2025  
**Module:** Attendance Management  
**Migration Type:** React + .NET → Vue.js + Laravel  

---

## 📋 Overview

This document provides the comprehensive technology stack mapping for migrating Module 3 (Attendance Management) from the legacy React + .NET architecture to the modern Vue.js + Laravel stack. The mapping ensures 1:1 functional compatibility while modernizing the technology foundation.

---

## 🏗️ Architecture Layer Mapping

### Backend Architecture Migration

| Layer | Legacy Technology | Target Technology | Migration Strategy |
|-------|------------------|------------------|-------------------|
| **Web Framework** | .NET 6 Web API | Laravel 11 API | RESTful endpoint preservation |
| **ORM/Database** | Entity Framework Core | Eloquent ORM | Model relationship mapping |
| **Database Engine** | SQL Server | MySQL 8+ | Schema migration with data type conversion |
| **Authentication** | JWT + Custom Middleware | Laravel Sanctum | Token-based auth preservation |
| **Validation** | Data Annotations | Form Requests | Business rule replication |
| **Dependency Injection** | .NET DI Container | Laravel Service Container | Service registration mapping |
| **Logging** | Serilog | Laravel Log (Monolog) | Log level and format preservation |
| **Task Scheduling** | Quartz.NET | Laravel Task Scheduler | Cron job migration |
| **File Storage** | Local File System | Laravel Storage | Path structure preservation |

### Frontend Architecture Migration

| Layer | Legacy Technology | Target Technology | Migration Strategy |
|-------|------------------|------------------|-------------------|
| **Core Framework** | React 18 | Vue.js 3 (Composition API) | Component-based architecture |
| **UI Library** | Material-UI v6.5.0 | Vuetify 3 | Design system consistency |
| **State Management** | Redux Toolkit | Pinia | Store pattern preservation |
| **Form Management** | React Hook Form v7.52.2 | VeeValidate | Validation rule mapping |
| **HTTP Client** | Axios | Axios (Vue compatible) | Request/response format preservation |
| **Routing** | React Router v6 | Vue Router 4 | Route structure mapping |
| **Date Handling** | Moment.js | date-fns | Lightweight alternative |
| **Build Tool** | Vite | Vite | Build configuration preservation |
| **Testing** | React Testing Library | Vue Testing Library | Test strategy alignment |

---

## 🔧 Component Technology Mapping

### UI Component Migration Matrix

| Category | React Component (Material-UI) | Vue Component (Vuetify) | Props/Events Mapping |
|----------|-------------------------------|------------------------|---------------------|
| **Data Display** | `Table` → `MaterialReactTable` | `VDataTable` → `VDataTableServer` | Pagination, sorting, filtering |
| **Navigation** | `Breadcrumbs` | `VBreadcrumbs` | Items array structure |
| **Layout** | `Paper`, `Box`, `Stack` | `VCard`, `VContainer`, `VRow/VCol` | Elevation, spacing system |
| **Inputs** | `TextField`, `Select` | `VTextField`, `VSelect` | v-model, validation props |
| **Date/Time** | `DatePicker`, `TimePicker` | `VDatePicker`, `VTimePicker` | Format, locale, constraints |
| **Buttons** | `Button`, `IconButton` | `VBtn` | Variant, size, color mapping |
| **Feedback** | `Dialog`, `Snackbar`, `Alert` | `VDialog`, `VSnackbar`, `VAlert` | Show/hide state, message types |
| **Loading** | `CircularProgress`, `LinearProgress` | `VProgressCircular`, `VProgressLinear` | Size, color, indeterminate |

### Form Component Mapping

| React Form Element | Vue Form Element | Validation Mapping |
|-------------------|------------------|-------------------|
| `useForm()` hook | `useForm()` composable | Form state management |
| `Controller` component | `Field` component | Field registration |
| `watch()` function | `watchEffect()` | Value watching |
| `setValue()` method | `setFieldValue()` | Programmatic updates |
| `formState.errors` | `errors.value` | Error state access |
| `handleSubmit()` | `handleSubmit()` | Form submission |

---

## 🗄️ Database Technology Mapping

### Data Type Migration

| SQL Server Type | MySQL Type | Laravel Migration Type | Notes |
|-----------------|------------|----------------------|--------|
| `BIGINT IDENTITY` | `BIGINT AUTO_INCREMENT` | `id()` | Primary key |
| `NVARCHAR(MAX)` | `TEXT` | `text()` | Large text fields |
| `NVARCHAR(255)` | `VARCHAR(255)` | `string()` | Standard strings |
| `BIT` | `BOOLEAN` | `boolean()` | Boolean flags |
| `DATETIME` | `TIMESTAMP` | `timestamp()` | Date/time with timezone |
| `DATE` | `DATE` | `date()` | Date only |
| `TIME(7)` | `TIME` | `time()` | Time only |
| `DECIMAL(18,2)` | `DECIMAL(18,2)` | `decimal()` | Financial data |

### Relationship Mapping

| .NET Entity Relationship | Laravel Eloquent Relationship | Migration Notes |
|--------------------------|-------------------------------|-----------------|
| `public virtual Employee Employee { get; set; }` | `public function employee() { return $this->belongsTo(Employee::class); }` | Foreign key preservation |
| `public virtual ICollection<AttendanceAudit> Audits { get; set; }` | `public function audits() { return $this->hasMany(AttendanceAudit::class); }` | One-to-many mapping |
| `[ForeignKey("EmployeeId")]` | `$table->foreign('employee_id')->references('id')->on('employees')` | FK constraint migration |

---

## 🔐 Security and Authentication Mapping

### Authentication System Migration

| Legacy (.NET) | Target (Laravel) | Implementation Notes |
|---------------|-----------------|-------------------|
| `JWT Bearer Token` | `Laravel Sanctum Token` | Token structure preservation |
| `[Authorize]` attribute | `auth:sanctum` middleware | Route protection |
| `[HasPermission]` attribute | Custom permission middleware | Permission string preservation |
| `ClaimsPrincipal` | `Auth::user()` | User context access |
| `User.Identity.Name` | `auth()->user()->email` | User identification |

### Permission System Mapping

| .NET Permission System | Laravel Permission System | Migration Strategy |
|----------------------|---------------------------|------------------|
| `Permissions.CreateAttendance` | `permission:attendance.create` | String constant preservation |
| `PermissionHandler` | `PermissionMiddleware` | Logic replication |
| `RoleManager` | Spatie Permission Package | Role-based access control |

---

## 📡 API Layer Mapping

### Endpoint Structure Migration

| Legacy .NET Endpoint | Target Laravel Endpoint | Method | Parameters Preserved |
|---------------------|------------------------|--------|-------------------|
| `POST /api/Attendance/AddAttendance/{employeeId}` | `POST /api/attendance/add-attendance/{employeeId}` | ✅ | employeeId, request body |
| `GET /api/Attendance/GetAttendance/{employeeId}` | `GET /api/attendance/get-attendance/{employeeId}` | ✅ | employeeId, query params |
| `PUT /api/Attendance/UpdateAttendance/{employeeId}/{attendanceId}` | `PUT /api/attendance/update-attendance/{employeeId}/{attendanceId}` | ✅ | employeeId, attendanceId |

### Response Format Migration

| Response Element | Legacy Format | Target Format | Compatibility |
|-----------------|---------------|---------------|--------------|
| **Success Response** | `{ "statusCode": 200, "message": "Success", "data": {...} }` | `{ "success": true, "message": "Success", "data": {...} }` | ✅ Preserved |
| **Error Response** | `{ "statusCode": 400, "message": "Error", "errors": [...] }` | `{ "success": false, "message": "Error", "errors": [...] }` | ✅ Preserved |
| **Pagination** | `{ "totalRecords": 100, "data": [...] }` | `{ "totalRecords": 100, "data": [...] }` | ✅ Preserved |

---

## 🎨 Styling and Design System Mapping

### Design Token Migration

| Design Aspect | Material-UI (React) | Vuetify (Vue) | Migration Notes |
|--------------|-------------------|---------------|-----------------|
| **Color Palette** | `primary.main: #1976d2` | `primary: '#1976d2'` | Exact color preservation |
| **Typography** | `typography.h2` | `text-h2` | Heading hierarchy mapping |
| **Spacing** | `spacing(2)` = 16px | `pa-2` = 16px | Spacing unit preservation |
| **Elevation** | `elevation={3}` | `elevation="3"` | Shadow depth mapping |
| **Breakpoints** | `theme.breakpoints.md` | `$vuetify.display.md` | Responsive breakpoints |

### Component Styling Migration

| Style Category | Legacy Approach | Target Approach | Implementation |
|---------------|-----------------|-----------------|----------------|
| **Component Themes** | Material-UI `createTheme()` | Vuetify theme configuration | Theme object migration |
| **Custom Styles** | CSS-in-JS with `makeStyles` | Vue scoped styles | Style isolation preservation |
| **Responsive Design** | Material-UI breakpoints | Vuetify display helpers | Media query equivalents |
| **CSS Variables** | CSS custom properties | Vuetify CSS variables | Variable naming alignment |

---

## ⚡ Performance Optimization Mapping

### Client-Side Performance

| Optimization Technique | React Implementation | Vue Implementation | Performance Impact |
|-----------------------|---------------------|-------------------|------------------|
| **Code Splitting** | React.lazy + Suspense | defineAsyncComponent | Bundle size reduction |
| **Memoization** | React.memo, useMemo | computed, watchEffect | Render optimization |
| **Virtual Scrolling** | React-window | Virtual scrolling directive | Large dataset handling |
| **State Persistence** | Redux Persist | Pinia persistence plugin | Improved UX |

### Server-Side Performance

| Optimization Area | .NET Approach | Laravel Approach | Performance Notes |
|------------------|---------------|------------------|-----------------|
| **Query Optimization** | Entity Framework LINQ | Eloquent relationships | N+1 query prevention |
| **Caching** | Memory Cache | Laravel Cache | Response caching |
| **API Throttling** | Custom rate limiting | Laravel rate limiter | Request rate control |
| **Database Indexing** | SQL Server indexes | MySQL indexes | Query performance |

---

## 🧪 Testing Strategy Mapping

### Testing Framework Migration

| Test Category | Legacy Tools | Target Tools | Migration Strategy |
|---------------|-------------|--------------|------------------|
| **Unit Tests** | xUnit (.NET) | PHPUnit (Laravel) | Test case conversion |
| **Integration Tests** | .NET Test Host | Laravel Feature Tests | Endpoint testing |
| **Frontend Unit Tests** | Jest + React Testing Library | Vitest + Vue Testing Library | Component test migration |
| **E2E Tests** | Playwright (React) | Playwright (Vue) | User flow preservation |
| **API Tests** | Postman/Newman | Laravel HTTP Tests | API contract validation |

### Test Coverage Mapping

| Coverage Area | Legacy Target | Target Achievement | Validation Method |
|---------------|---------------|------------------|------------------|
| **Backend Code Coverage** | 80%+ | 80%+ | PHPUnit coverage reports |
| **Frontend Component Coverage** | 70%+ | 70%+ | Vitest coverage reports |
| **API Endpoint Coverage** | 100% | 100% | Feature test validation |
| **User Flow Coverage** | Critical paths | Critical paths | Playwright test suite |

---

## 🔄 State Management Migration

### Store Pattern Migration

| Redux Pattern | Pinia Pattern | Migration Notes |
|---------------|---------------|-----------------|
| **Store Creation** | `configureStore()` | `defineStore()` | Store definition |
| **State** | `initialState` | `state: () => ({})` | Initial state setup |
| **Actions** | `createAsyncThunk` | `async actions` | Async operation handling |
| **Selectors** | `createSelector` | `getters: {}` | Computed state |
| **Middleware** | Redux middleware | Pinia plugins | Side effect handling |

### Data Flow Migration

| Data Flow Aspect | Redux Flow | Pinia Flow | Implementation |
|------------------|------------|------------|----------------|
| **Component Connection** | `useSelector`, `useDispatch` | `useStore()`, direct access | Store integration |
| **Action Dispatching** | `dispatch(action())` | `store.action()` | Method invocation |
| **State Updates** | Immutable updates | Direct mutations | State modification |
| **DevTools** | Redux DevTools | Vue DevTools | Debug integration |

---

## 📦 Build and Deployment Mapping

### Build Configuration Migration

| Build Aspect | Legacy Configuration | Target Configuration | Migration Notes |
|--------------|-------------------|---------------------|-----------------|
| **Frontend Build** | Vite (React) | Vite (Vue) | Configuration preservation |
| **Backend Build** | .NET publish | Laravel deployment | Artifact generation |
| **Environment Variables** | `.env` (React) + `appsettings.json` | `.env` (Laravel + Vue) | Environment management |
| **Asset Optimization** | Vite optimization | Vite optimization | Bundle optimization |

### Deployment Strategy Migration

| Deployment Aspect | Legacy Approach | Target Approach | Migration Strategy |
|------------------|----------------|-----------------|------------------|
| **Backend Hosting** | IIS/.NET runtime | Apache/Nginx + PHP | Server configuration |
| **Frontend Hosting** | Static file serving | Static file serving | Asset delivery |
| **Database Migration** | Entity Framework | Laravel Artisan | Schema versioning |
| **Environment Setup** | PowerShell scripts | Bash/Docker scripts | Automation scripts |

---

## 🔧 Development Tools Migration

### IDE and Development Environment

| Tool Category | Legacy Tools | Target Tools | Productivity Impact |
|---------------|-------------|--------------|-------------------|
| **IDE** | Visual Studio / VS Code | VS Code + Vue extensions | Development efficiency |
| **Debugging** | .NET debugger | Xdebug + Vue DevTools | Debug capability |
| **Code Quality** | SonarQube (.NET) | SonarQube (PHP/Vue) | Quality metrics |
| **Version Control** | Git | Git | Source control |
| **Package Management** | NuGet + npm | Composer + npm | Dependency management |

### Development Workflow Migration

| Workflow Stage | Legacy Process | Target Process | Tool Alignment |
|---------------|----------------|----------------|----------------|
| **Local Development** | .NET run + React dev server | Laravel serve + Vite dev | Hot reload preservation |
| **Code Linting** | ESLint (React) | ESLint (Vue) + PHP CS Fixer | Code standards |
| **Pre-commit Hooks** | Husky + lint-staged | Husky + lint-staged | Quality gates |
| **Continuous Integration** | .NET CI + React CI | Laravel CI + Vue CI | Pipeline adaptation |

---

## 📈 Success Metrics and Validation

### Migration Success Criteria

| Metric Category | Success Criteria | Validation Method | Acceptance Threshold |
|-----------------|------------------|------------------|-------------------|
| **Functional Compatibility** | All legacy features working | Manual testing + automated tests | 100% feature parity |
| **Performance** | Response times maintained | Load testing comparison | ≤ 10% degradation |
| **User Experience** | UI/UX consistency | Visual regression testing | Pixel-perfect match |
| **Code Quality** | Maintainable codebase | Static analysis tools | ≥ 80% test coverage |
| **Documentation** | Complete documentation | Review checklist | 100% API documentation |

### Rollback Strategy

| Rollback Trigger | Legacy Fallback | Recovery Time | Risk Mitigation |
|------------------|----------------|---------------|-----------------|
| **Performance Issues** | .NET + React stack | < 30 minutes | Blue-green deployment |
| **Data Integrity Issues** | Database backup restore | < 60 minutes | Point-in-time recovery |
| **Functionality Regression** | Feature flag toggle | < 5 minutes | Gradual feature rollout |
| **Security Vulnerabilities** | Immediate rollback | < 15 minutes | Security monitoring |

---

## 📋 Implementation Checklist

### Pre-Migration Checklist
- [ ] Legacy system analysis completed
- [ ] Target architecture approved
- [ ] Development environment setup
- [ ] Database migration strategy validated
- [ ] Team training on new tech stack completed

### Migration Execution Checklist
- [ ] Backend API endpoints migrated and tested
- [ ] Frontend components migrated and styled
- [ ] State management implemented
- [ ] Authentication/authorization working
- [ ] Database migrated successfully
- [ ] Integration tests passing
- [ ] Performance benchmarks met

### Post-Migration Checklist
- [ ] User acceptance testing completed
- [ ] Production deployment successful
- [ ] Monitoring and logging configured
- [ ] Documentation updated
- [ ] Team handover completed
- [ ] Legacy system decommissioned

---

**End of Tech Stack Mapping Specification**

*This document serves as the authoritative reference for technology choices and migration patterns for Module 3 - Attendance Management. All implementation decisions should align with the mappings defined herein to ensure consistency and compatibility.*
# Technical Specification

## 1. Purpose and scope

Student Admin Portal UI is a browser-based Angular application for maintaining student records. It is the frontend only: persistence, validation beyond the client-side form, gender data, and profile-image storage are provided by a separate HTTP API.

## 2. Technology and runtime

| Concern | Technology |
| --- | --- |
| UI framework | Angular 22.2.3 |
| Language | TypeScript 6.0.3 |
| UI components | Angular Material 22.2.3 |
| Layout | Flexbox Grid 6.3.1 |
| HTTP and async operations | Angular `HttpClient`, RxJS 7.8 |
| Browser bootstrap | Angular NgModule bootstrap with `zone.js` |
| Unit tests | Angular unit-test builder, Vitest 4.1.12, jsdom 27.4 |
| Coverage | `@vitest/coverage-v8` 4.1.12 |

Dependency versions and npm scripts are defined in `package.json`; `package-lock.json` is the reproducible install manifest.

## 3. Application structure

- `src/main.ts` bootstraps `AppModule`.
- `src/app/app.module.ts` declares the root, navigation, student-list, and student-detail components, and imports routing, forms, HTTP, and Angular Material modules.
- `src/app/app-routing.module.ts` maps the list and detail views to routes.
- `src/app/layout/top-nav/` contains the shared top navigation.
- `src/app/students/students.component.*` displays, searches, sorts, and paginates the student list.
- `src/app/students/view-student/` contains the add/edit form and profile image controls.
- `src/app/students/student.service.ts` implements student API calls and maps form data to add/update request DTOs.
- `src/app/services/gender.service.ts` loads gender options for the form.
- `src/app/models/api-models/` contains API and UI model interfaces.
- `src/app/**/*.spec.ts` contains component and service tests.

The Angular application builder serves the app during development and produces the production files in `dist/studentadminportal-ui/browser/`.

## 4. Routes and behavior

| Route | View | Behavior |
| --- | --- | --- |
| `/` | Student list | Loads all students. |
| `/students` | Student list | Same list view as `/`. |
| `/students/add` | Student form | Treats the `id` value `Add` (case-insensitive) as add mode. |
| `/students/{id}` | Student form | Loads and edits the student with the given ID. |

The list uses Angular Material table, sort, and paginator components, plus client-side text filtering. The form requires the student name, date of birth, email, mobile, gender, physical address, and postal address. Existing students can be edited, deleted, and have their profile image changed; new students can be added.

## 5. Backend integration

### Base URLs

The student service uses `http://localhost:7255/`. The gender service uses `http://localhost:7255/api/Gender`. These are hardcoded in the service classes; there is no environment-specific API configuration at present.

Because requests originate in the browser, the API must be reachable from the browser and allow the frontend origin through CORS. For local development that origin is normally `http://localhost:4200`. A deployment should use an appropriate reachable API URL and HTTPS; `localhost` in a browser points to the end user's own machine, not the deployed server.

### Endpoints

| Operation | HTTP request | Service |
| --- | --- | --- |
| List students | `GET /api/Students/GetAllStudent` | `StudentService.getStudents()` |
| Get one student | `GET /api/Students/GetStudentById/{id}` | `StudentService.getStudent(id)` |
| Add a student | `POST /api/Students/AddStudent` | `StudentService.addStudent(student)` |
| Update a student | `PUT /api/Students/UpdateStudent/{id}` | `StudentService.updateStudent(id, student)` |
| Delete a student | `DELETE /api/Students/DeleteStudent/{id}` | `StudentService.deleteSudent(id)` |
| Upload profile image | `POST /api/Students/UploadProfile/{id}` | `StudentService.uploadImage(id, file)` |
| List genders | `GET /api/Gender/GetGenders` | `GenderService.getGender()` |

The image upload is sent as `multipart/form-data` with a `profileImage` field. The service expects the response body as text containing the image path. The UI prefixes that relative path with the student API base URL when displaying the image.

### Request fields and compatibility

Add and update request interfaces contain `studentFirstName`, `studentLastname`, `dob`, `mobile`, `email`, `genderId`, `streetAdress`, and `zipCode`. The `streetAdress` spelling is part of the current API-facing contract and should not be renamed without a coordinated backend change.

The UI and API models are declared as TypeScript interfaces; they do not perform runtime response validation. Coordinate any field or response-shape changes with the backend.

## 6. Build, run, and test

Use Node.js 22.22.3+ in the 22.x line or 24.15.0+ in the 24.x line and npm. From `studentadminportal-ui`:

```powershell
npm ci
npm start
```

Open <http://localhost:4200/>. Start the backend separately at `http://localhost:7255/` for live data and API-backed operations.

```powershell
npm run build
npm test
npm run test:ci
npm run test:ci -- --coverage
```

`npm test` starts watch mode. `npm run test:ci` runs once, and adding `-- --coverage` produces the HTML coverage report at `coverage/studentadminportal-ui/index.html`. Unit tests use mocked HTTP services and jsdom; a running backend is not required.

## 7. Configuration and operational notes

- API URLs are constants inside the service classes, not build-time environment settings.
- The frontend alone cannot persist records; the backend must be running for list, form lookup, CRUD, gender lookup, and image upload.
- Ensure the backend's CORS policy includes the exact browser origin used to open the frontend.
- No authentication flow or authorization configuration is implemented in this UI.
- An API failure on the list leaves the initially empty list in place and is logged to the browser console; the UI does not provide a dedicated list error state.
- Production hosting must serve the Angular application for client-side routes such as `/students/{id}` (for example, via SPA fallback to `index.html`).

## 8. Screenshots

The screenshots document the desktop list and add-form layouts. They were captured with the API unavailable, so no student rows or gender options appear.

- [Student list](screenshots/student-list.png)
- [Add student form](screenshots/add-student-form.png)

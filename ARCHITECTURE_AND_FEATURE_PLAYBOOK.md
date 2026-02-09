# Architecture and Feature Playbook

This document is the authoritative reference for recreating and extending this CMS application. It captures every architectural pattern, structural convention, data flow, and behavioral contract. A senior developer should be able to rebuild the entire system from this document alone, without seeing the original source code.

---

## 1. Project Philosophy

### Design Goals

- **Config-driven CRUD**: Every list, form, and modal in the CMS is assembled from declarative configuration objects. Components never contain hardcoded field definitions, table columns, or validation rules.
- **Zero-boilerplate feature creation**: Adding a new CMS entity (e.g., "Vehicles") requires creating a small, predictable set of files that follow an enforced contract. No framework plumbing is needed.
- **Single-modal-component architecture**: One shared modal component handles all create and edit operations across the entire CMS. Features only supply a configuration object; they never build their own modal UI.
- **Separation by responsibility, not by type**: Code is grouped by feature first (`feature/entities/`), with cross-cutting concerns centralized in `core/`, `pattern/`, and `ui/`.

### CMS Assumptions

- The backend exposes a RESTful JSON API for every entity.
- Every list endpoint returns `{ data: T[], pagination: Pagination }`.
- Every mutation endpoint returns `{ message: string }` (and optionally `{ data: T }` on create).
- Authentication is token-based (JWT Bearer), stored in `localStorage`.
- The CMS is multi-language, with translations loaded lazily per feature on route activation.

### Scaling Strategy

- New features are added by replicating the established file structure and wiring up the route.
- Shared components (`pattern/`, `ui/`) are never modified per-feature; features customize behavior through configuration objects and template overrides.
- The application is a single Angular project. If the product expands to multiple apps, the `projects/` directory supports multiple Angular applications sharing the same workspace.

---

## 2. High-Level Architecture

### Application Layers

```
┌─────────────────────────────────────────────────────┐
│                    Feature Layer                     │
│  (feature modules: pages, services, field configs)   │
├─────────────────────────────────────────────────────┤
│                    Pattern Layer                     │
│  (reusable smart components: table, crud-modal,      │
│   filters, form inputs, sidebar, content-layout)     │
├─────────────────────────────────────────────────────┤
│                      UI Layer                        │
│  (presentational components: field-errors, paginator,│
│   skeleton-form, page-header, display-cards)         │
├─────────────────────────────────────────────────────┤
│                     Core Layer                       │
│  (base services, interceptors, guards, decorators,   │
│   interfaces, enums, utilities, constants, theme)    │
├─────────────────────────────────────────────────────┤
│                    Layout Layer                      │
│  (shell components: private-layout, auth-layout)     │
└─────────────────────────────────────────────────────┘
```

### Responsibilities of Each Layer

| Layer       | Responsibility                                                                                 | May Depend On            |
| ----------- | ---------------------------------------------------------------------------------------------- | ------------------------ |
| **Feature** | Business logic, page components, API services, field definitions, i18n files                   | Pattern, UI, Core        |
| **Pattern** | Reusable smart components with behavior (table sorting, modal lifecycle, filter debounce)      | UI, Core                 |
| **UI**      | Pure presentational components with no business logic                                          | Core (interfaces only)   |
| **Core**    | Framework plumbing: base services, HTTP interceptors, guards, decorators, utilities, constants | Nothing (self-contained) |
| **Layout**  | Application shells that compose sidebar + router-outlet                                        | Pattern (sidebar)        |

### Dependency Flow Rules

- Dependencies flow strictly downward: Feature → Pattern → UI → Core.
- No lateral dependencies between features. Feature A must never import from Feature B.
- Pattern components must never import feature-specific code.
- UI components must never import Pattern or Feature code.

---

## 3. Folder and File Structure

### Full Tree

```
project-root/
├── projects/
│   └── {app-name}/
│       ├── public/
│       │   └── i18n/                          # Global translation files (one per language)
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/                      # Framework plumbing
│       │   │   │   ├── constants/             # App-wide constants (pagination defaults, breakpoints)
│       │   │   │   ├── decorators/            # Class decorators (AutoUnsubscribe)
│       │   │   │   ├── enum/                  # TypeScript enums for entity statuses
│       │   │   │   ├── guards/                # Route guards (auth, permissions)
│       │   │   │   ├── interceptors/          # HTTP interceptors (JWT, error handling)
│       │   │   │   ├── interface/             # All TypeScript interfaces and models
│       │   │   │   ├── pipes/                 # Custom pipes (duration, number-format, can)
│       │   │   │   ├── resolvers/             # Route resolvers (feature translation loader)
│       │   │   │   ├── services/              # Base and shared services
│       │   │   │   ├── styles/                # Shared SCSS (status-color classes)
│       │   │   │   ├── theme/                 # PrimeNG theme preset, icon registry, form factory config
│       │   │   │   ├── utils/                 # Pure utility functions
│       │   │   │   └── core.ts                # provideCore() function for app bootstrap
│       │   │   │
│       │   │   ├── feature/                   # One subfolder per CMS entity
│       │   │   │   └── {entity}/
│       │   │   │       ├── {entity}.routes.ts
│       │   │   │       ├── i18n/              # Per-feature translations
│       │   │   │       │   ├── en.json
│       │   │   │       │   └── {other-lang}.json
│       │   │   │       ├── services/
│       │   │   │       │   ├── {entity}.service.ts
│       │   │   │       │   └── {entity}-fields.service.ts
│       │   │   │       ├── pages/
│       │   │   │       │   ├── all-{entity}/
│       │   │   │       │   │   ├── all-{entity}.component.ts
│       │   │   │       │   │   └── all-{entity}.component.html
│       │   │   │       │   └── single-{entity}/           # Optional detail page
│       │   │   │       │       └── single-{entity}.component.ts
│       │   │   │       └── components/
│       │   │   │           ├── add-{entity}/
│       │   │   │           │   └── add-{entity}.config.ts  # Pure function returning CrudModalConfig
│       │   │   │           └── edit-{entity}/
│       │   │   │               └── edit-{entity}.config.ts
│       │   │   │
│       │   │   ├── layout/                    # Shell layouts
│       │   │   │   ├── private-layout/        # Authenticated shell (sidebar + outlet)
│       │   │   │   ├── auth-layout/           # Unauthenticated shell
│       │   │   │   └── public-layout/         # Public-facing shell (if needed)
│       │   │   │
│       │   │   ├── pattern/                   # Reusable smart components
│       │   │   │   ├── crud-modal/            # Generic create/edit modal
│       │   │   │   ├── simple-modal/          # Read-only display modal
│       │   │   │   ├── table/                 # Data table with sort, pagination, templates
│       │   │   │   ├── filters/               # Filter form wrapper !p-6
│       │   │   │   ├── table-filters/         # Advanced filters with URL sync
│       │   │   │   ├── content-layout/        # Page wrapper !p-6 (title, description, action button)
│       │   │   │   ├── sidebar/               # Navigation sidebar
│       │   │   │   ├── input/                 # Text/number input field
│       │   │   │   ├── select/                # Single-select dropdown
│       │   │   │   ├── multiselect/           # Multi-select with pagination
│       │   │   │   ├── textarea/              # Multi-line text field
│       │   │   │   ├── checkbox/              # Binary checkbox
│       │   │   │   ├── toggle/                # Toggle switch
│       │   │   │   ├── date-picker/           # Date picker
│       │   │   │   └── upload/                # File upload
│       │   │   │
│       │   │   ├── ui/                        # Presentational components
│       │   │   │   ├── field-error/           # Validation error messages
│       │   │   │   ├── paginator/             # Pagination controls
│       │   │   │   ├── page-header/           # Page header with title and actions
│       │   │   │   ├── skeleton-form/         # Loading skeleton for forms
│       │   │   │   ├── display-cards/         # Stats/summary cards
│       │   │   │   └── loading-toast/         # Loading indicator overlay
│       │   │   │
│       │   │   ├── app.component.ts           # Root component (toast containers, translation init)
│       │   │   ├── app.routes.ts              # Top-level route definitions
│       │   │   └── app.config.ts              # Application providers (calls provideCore)
│       │   │
│       │   ├── environments/                  # Environment files
│       │   └── styles/                        # Global stylesheets
│       └── angular.json / tsconfig.json / etc.
```

### Rules for Adding New Features

1. Create a folder under `feature/` named after the entity (kebab-case plural).
2. Every feature folder must contain at minimum: routes file, CRUD service, fields service, list page, i18n folder, and modal config functions.
3. Never place feature-specific code outside the feature folder except the interface (which goes in `core/interface/`) and the enum (which goes in `core/enum/`).
4. Wire the feature into `app.routes.ts` as a lazy-loaded child route under `PrivateLayoutComponent`.

---

## 4. Base Layout System

### Shell Layout Architecture

The application uses two top-level layout shells, selected by the router:

```
app.routes.ts
├── path: 'auth'     → AuthLayoutComponent (no sidebar, no guard)
└── path: ''         → PrivateLayoutComponent (sidebar + guard)
    └── children: [hubs, parking-spots, admins, ...]
```

### Private Layout (Authenticated Shell)

Structure:

```
┌──────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────────────────┐  │
│  │           │  │                      │  │
│  │  Sidebar  │  │    <router-outlet>   │  │
│  │           │  │                      │  │
│  │           │  │                      │  │
│  └──────────┘  └──────────────────────┘  │
│                                          │
│  <loading-toast />                       │
└──────────────────────────────────────────┘
```

- The sidebar is a fixed-width navigation panel rendered from a declarative menu item array.
- The content area is a scrollable container holding the `<router-outlet>`.
- A loading toast overlay is rendered at the layout level so it persists across route changes.
- The sidebar is responsive: below the mobile breakpoint it collapses or transforms.

### Auth Layout (Unauthenticated Shell)

A minimal wrapper !p-6 with only a `<router-outlet>`. No sidebar, no header. Used for login, forgot-password, and reset-password routes.

### Sidebar Composition

- Menu items are defined as a constant array in `core/sidebar.ts`.
- Each item specifies: label (translation key), icon name, router link, and optionally a permission key.
- The sidebar component reads this array, renders a navigation menu, and includes user info and a logout button.
- Adding a sidebar entry for a new feature means adding one object to this array.

### Router Outlet Strategy

- The root `app.routes.ts` defines layout-level routes.
- Each feature has its own `{entity}.routes.ts` that exports a `Routes` array as the default export.
- Feature routes are lazy-loaded via `loadChildren: () => import(...)`.
- Individual pages within a feature use `loadComponent` for further code splitting.

---

## 5. CRUD Architecture

This is the most critical section. Every CMS feature follows this exact pattern.

### Required Files Per CRUD Feature

| File                                                 | Purpose                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------- |
| `{entity}.routes.ts`                                 | Route definitions with translation resolver                         |
| `services/{entity}.service.ts`                       | API service extending `BaseCrudService<T>`                          |
| `services/{entity}-fields.service.ts`                | Declarative field definitions for filters, forms, and table columns |
| `pages/all-{entity}/all-{entity}.component.ts`       | List page component                                                 |
| `pages/all-{entity}/all-{entity}.component.html`     | List page template                                                  |
| `pages/single-{entity}/single-{entity}.component.ts` | Detail page (optional, for entities with nested resources)          |
| `components/add-{entity}/add-{entity}.config.ts`     | Pure function returning `CrudModalConfig` for create mode           |
| `components/edit-{entity}/edit-{entity}.config.ts`   | Pure function returning `CrudModalConfig` for edit mode             |
| `i18n/en.json`                                       | English translations                                                |
| `i18n/{other-lang}.json`                             | Additional language translations                                    |
| `core/interface/{entity}.interface.ts`               | TypeScript interface for the entity                                 |
| `core/enum/{entity}-status.enum.ts`                  | Status enum (if applicable)                                         |

### Component Responsibilities

**List Page Component (`all-{entity}.component.ts`):**

- Injects the CRUD service, fields service, FormFactoryService, DialogService, ToastService, LoadingToastService, Router, ActivatedRoute.
- On init: reads page/rows from query params, creates filter form from field definitions, fetches initial data and stats, subscribes to filter changes with 500ms debounce.
- Provides methods: `getData(page)`, `getStats()`, `onAdd()`, `onEdit(event)`, `onDelete(event)`, `onSort(event)`, `onPageChange(event)`, `onPreview(event)`.
- Uses `@AutoUnsubscribe('subs')` decorator for cleanup.
- Registers `DialogService` in component-level `providers`.

**Detail Page Component (`single-{entity}.component.ts`):**

- Fetches the parent entity and its nested resources in parallel (using `forkJoin`).
- Displays parent entity info and a table of child resources.
- May open edit modals for child resources.

### Service Responsibilities

**CRUD Service (`{entity}.service.ts`):**

- Extends `BaseCrudService<T>` which provides: `getAll()`, `getOne()`, `create()`, `update()`, `delete()`.
- Sets `protected endpoint = '{api-path}'`.
- Adds entity-specific methods (e.g., `getStats()`, `getNestedResources()`).

**Fields Service (`{entity}-fields.service.ts`):**

- Injectable, `providedIn: 'root'`.
- Exposes three arrays:
  - `filterFields`: Field definitions for the filter form.
  - `mainFields`: Field definitions for the create/edit modal form.
  - `tableHeader`: Column definitions for the data table.
- May expose additional arrays for detail page tables.

### Routing Patterns

Every feature route file follows this structure:

```typescript
export default <Routes>[
  {
    path: '',
    resolve: { translations: featureTranslationResolver },
    data: { feature: '{entity}' },
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/all-{entity}/...').then((m) => m.AllEntityComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/single-{entity}/...').then((m) => m.SingleEntityComponent),
      },
    ],
  },
];
```

Key rules:

- The parent route runs the `featureTranslationResolver` to load feature-specific i18n files before rendering.
- `data.feature` must match the feature folder name (used by the resolver to locate i18n files).
- Components are lazy-loaded with `loadComponent`.

### Data Lifecycle

```
LIST                          CREATE                        EDIT                          DELETE
────                          ──────                        ────                          ──────
1. getData(page)              1. onAdd() called             1. onEdit({id}) called        1. Table emits handleDelete
2. Service.getAll(            2. Build CrudModalConfig      2. Build CrudModalConfig      2. ConfirmService.confirm()
     page, perPage,              with mode:'add'               with mode:'edit',          3. User confirms
     filterForm.value)        3. DialogService.open(           entityId, getData,         4. Service.delete(id)
3. Response → set data,          CrudModalComponent,           updateData,                5. Toast success
   pagination                    { data: { config } })         mapDataForForm             6. getData() refreshes list
4. Table renders              4. Modal creates form         3. DialogService.open(...)     7. getStats() refreshes cards
                              5. User fills form            4. Modal fetches entity
                              6. onSubmit() validates       5. mapDataForForm transforms
                              7. Service.create(formValue)  6. patchForm populates
                              8. ref.close(true)            7. User edits
                              9. Parent refreshes data      8. onSubmit() validates
                                                            9. Service.update(id, value)
                                                           10. ref.close(true)
                                                           11. Parent refreshes data
```

### How Consistency Is Enforced

- `BaseCrudService` enforces the HTTP method contract (GET for list/detail, POST for create, PATCH for update, DELETE for delete).
- `CrudModalComponent` enforces the modal lifecycle (form creation, data fetching for edit, validation on submit, success/error handling).
- `TableComponent` enforces the table behavior (sorting, pagination, action buttons, skeleton loading).
- Field definitions use a factory function (`createField<T>`) that enforces the field configuration shape.
- Every list page follows the same composition: `ContentLayout > Filters + DisplayCards + Table`.

---

## 6. Modal System

### How Modals Are Declared

Modals are not declared in templates. They are opened programmatically using PrimeNG's `DialogService`:

```typescript
const ref = this.dialogService.open(CrudModalComponent, {
  contentStyle: { overflow: 'auto' },
  baseZIndex: 10000,
  maximizable: true,
  data: { config }, // CrudModalConfig object
});
```

`DialogService` must be provided at the component level (in `providers` array of the list component), not at root.

### How Data Is Injected

Data flows through the `DynamicDialogConfig.data` property:

1. The parent component constructs a `CrudModalConfig` object.
2. This config is passed as `data.config` when opening the dialog.
3. `CrudModalComponent` reads `this.dialogConfig.data.config` in its constructor.

### CrudModalConfig Interface

```typescript
interface CrudModalConfig {
  title: string; // Translation key
  description?: string; // Translation key
  formFields: InputField[]; // Field definitions (from fields service)
  submitButtonLabel: string; // Translation key
  cancelButtonLabel: string; // Translation key
  mode: 'add' | 'edit';
  entityId?: string; // Required for edit mode
  getData?: (id: string) => Observable<any>; // Fetch entity for edit
  createData?: (data: any) => Observable<{ message }>; // POST handler
  updateData?: (id: string, data: any) => Observable<{ message }>; // PATCH handler
  mapDataForForm?: (responseData: any) => Record<string, any>; // Transform API response before patching form
  onSuccess?: (response: any) => void; // Post-success callback
  repeatableFields?: RepeatableFieldConfig; // For array sub-forms
}
```

### How Results Are Returned

- `ref.close(true)` signals success. The parent's `onClose` subscriber receives `true` and refreshes data.
- `ref.close(false)` or closing via cancel signals no action. The parent ignores it.

### Modal Configuration Functions

Each feature provides two pure functions:

**Add config function:**

```typescript
export function getAdd{Entity}Config(
  service: EntityService,
  fieldsService: EntityFieldsService,
): CrudModalConfig {
  return {
    title: '{entity}.add.title',
    formFields: fieldsService.mainFields,
    mode: 'add',
    createData: (data) => service.create(data),
    // ...labels
  };
}
```

**Edit config function:**

```typescript
export function getEdit{Entity}Config(
  id: string,
  service: EntityService,
  fieldsService: EntityFieldsService,
): CrudModalConfig {
  return {
    title: '{entity}.edit.title',
    formFields: fieldsService.mainFields,
    mode: 'edit',
    entityId: id,
    getData: (id) => service.getOne(id),
    updateData: (id, data) => service.update(id, data),
    mapDataForForm: (data) => ({ ...data }),  // Transform if needed
    // ...labels
  };
}
```

### When Modals Are Used vs Routed Pages

- **Modals**: All create and edit operations. The list page stays visible behind the modal.
- **Routed pages**: Detail/preview pages (e.g., viewing a single entity's nested resources). These navigate to `/{entity}/:id`.

### Repeatable Fields

The modal supports a FormArray-based repeatable section for entities that contain lists of sub-items. Configuration:

```typescript
repeatableFields: {
  fields: InputField[],       // Field definitions for each repeated item
  addButtonLabel: string,     // Translation key
  removeButtonLabel: string,  // Translation key
  sectionTitle: string,       // Translation key
  minItems?: number,          // Minimum required items
  maxItems?: number,          // Maximum allowed items
}
```

---

## 7. Forms and Validation

### Form Construction Pattern

Forms are never built manually with `new FormGroup(...)` in feature code. Instead:

1. **Define fields** in the fields service using `createField<T>()`:

```typescript
createField<InputField>({
  colSize: 'col-span-12 md:col-span-6', // Responsive grid classes
  controlType: InputComponent, // Component class reference
  label: 'translation.key', // Translation key for label
  type: 'text', // HTML input type
  placeholder: 'translation.key', // Translation key for placeholder
  options: {
    formControlName: 'field_name', // Maps to FormControl name
    value: '', // Default value
    validators: [Validators.required], // Angular validators
  },
});
```

2. **Create the form** using FormFactoryService:

```typescript
this.form = this.formFactory.createForm(this.fieldsService.mainFields);
```

3. **Render the form** using `<ngx-form-factory>`:

```html
<ngx-form-factory [form]="form" [formFields]="config.formFields" />
```

The factory reads each field definition, creates the corresponding `FormControl` with validators, wraps them in a `FormGroup`, and renders each field using the specified `controlType` component.

### Field Component Contract

Every form input component:

- Extends `FormFactoryFieldComponent` from `ngx-dynamic-forms-factory`.
- Receives field configuration via a signal (`this.field()`).
- Provides `ControlContainer` via `viewProviders` using `FormGroupDirective`.
- Renders a label (translated), the PrimeNG input, and `<app-field-errors>`.
- Never contains business logic.

### Available Field Types

| controlType          | Renders                          | Key Properties                                             |
| -------------------- | -------------------------------- | ---------------------------------------------------------- |
| InputComponent       | Text/number input                | `type`, `placeholder`                                      |
| SelectComponent      | Single-select dropdown           | `selectOptions`, `optionLabel`, `optionValue`, `showClear` |
| MultiselectComponent | Multi-select with virtual scroll | `selectOptions` or `service` (for lazy loading)            |
| TextareaComponent    | Multi-line text                  | `rows`, `cols`, `autoResize`                               |
| CheckboxComponent    | Binary checkbox                  | -                                                          |
| ToggleComponent      | Toggle switch                    | -                                                          |
| DatePickerComponent  | Calendar date picker             | `selectionMode`                                            |
| UploadComponent      | File upload                      | Shows current file, download link                          |

### Validation Rules

- Validators are declared in the field definition's `options.validators` array.
- Supported validators: `required`, `min`, `max`, `minLength`, `maxLength`, `email`, `pattern`.
- The `FieldErrorsComponent` displays errors for: required, email, minlength, maxlength, pattern.
- Errors only show when the control is touched OR the parent form has been submitted.

### Error Display

The `FieldErrorsComponent` receives the control's errors object and the control itself:

```html
<app-field-errors [errors]="control?.errors" [control]="control" />
```

It shows errors only when `control.touched === true` or `control.parent.submitted === true`.

### Submit Lifecycle

1. `onSubmit()` is called.
2. If `form.invalid`, call `form.markAllAsTouched()` and return (this triggers error display).
3. Show loading toast.
4. Extract form value with `form.getRawValue()`.
5. Call the appropriate operation (create or update) from the config.
6. On success: close modal with `true`, show success toast, call optional `onSuccess` callback.
7. On error: show error toast, keep modal open.

---

## 8. Reusable UI and Abstractions

### Shared Pattern Components

**TableComponent** (`pattern/table/`):

- Wraps PrimeNG Table with sorting, pagination, custom column templates, action buttons, skeleton loading, row selection.
- Inputs: `tableHeader`, `tableData`, `paginator`, `loading`, `options` (showEdit/showDelete/showPreview), `customOptions`, `enableRowSelect`.
- Outputs: `handlePageChange`, `handleDelete`, `handleEdit`, `handlePreview`, `handleSort`, `handleSelect`.
- Custom column templates are injected via `ng-template` with `appColumnTemplate` directive.
- Sorting cycles through: none → ascending → descending → none.
- Page changes are synced to URL query params (`?page=N&rows=M`).

**FiltersComponent** (`pattern/filters/`):

- Accepts field definitions and a FormGroup.
- Renders the field array using `<ngx-form-factory>`.
- The parent component subscribes to `filterForm.valueChanges` with debounce for auto-search.

**ContentLayoutComponent** (`pattern/content-layout/`):

- Page wrapper !p-6 with title, description, and optional action button.
- Content is projected via `<ng-content>`.
- Action button can either navigate to a route or emit a click event.

**CrudModalComponent** (`pattern/crud-modal/`):

- Handles both create and edit modes.
- Creates form from config, fetches data in edit mode, submits, and closes.
- Supports repeatable field sections (FormArray).

**SidebarComponent** (`pattern/sidebar/`):

- Reads menu items from configuration.
- Responsive: detects mobile breakpoint.
- Includes user avatar and logout button.

### Shared UI Components

**FieldErrorsComponent**: Displays touched-state-aware validation error messages.
**PaginatorComponent**: Custom pagination with page/rows tracking and query param sync.
**DisplayCardsComponent**: Renders an array of stat cards with typed variants (positive, negative, neutral, etc.).
**SkeletonFormComponent**: Loading placeholder for form areas.
**LoadingToastComponent**: Overlay loading indicator.
**PageHeaderComponent**: Animated page header with title, back button, submit button.

### Shared Services

**BaseCrudService<T>**: Abstract service providing getAll, getOne, create, update, delete. Feature services extend it and set `protected endpoint`.
**ToastService**: Wraps PrimeNG MessageService. Methods: `addSuccess()`, `addWarn()`, `addError()`, `clearErrors()`.
**ConfirmService**: Wraps PrimeNG ConfirmationService for delete confirmation dialogs.
**LoadingToastService**: Shows/clears a loading toast. Methods: `showLoadingToast()`, `clearLoadingToast()`.
**AuthService**: Manages JWT token and user data via BehaviorSubjects persisted to localStorage.

### Utility Functions

- `createQueryParams(obj, allowEmptyValues)`: Converts an object to `HttpParams`, filtering nullish values.
- `resetData<T>()`: Returns an empty table data structure with default pagination.
- `enumToArray(enum)`: Converts a TypeScript enum to `{ label, value }[]`.
- `getOptions(enum, translationPrefix, translateService)`: Returns translated enum options for select dropdowns.
- `mapDate(dateString)`: Parses `dd.mm.yyyy` format to a Date object.
- `toFormData(obj)`: Converts an object to a `FormData` instance for file uploads.

### Anti-Duplication Strategies

- Field definitions are centralized in the fields service. The same `mainFields` array is used by both the add and edit modal configs.
- The `CrudModalComponent` is the single modal implementation for all CRUD operations across the entire CMS.
- The `TableComponent` is the single table implementation used by every list page.
- The `BaseCrudService` eliminates repeated HTTP method implementations.
- The `AutoUnsubscribe` decorator eliminates repeated ngOnDestroy cleanup code.

---

## 9. State and Side Effects

### How State Is Stored

| State Type                        | Storage Mechanism                                             |
| --------------------------------- | ------------------------------------------------------------- |
| Authentication (user, token)      | `BehaviorSubject` in AuthService, persisted to `localStorage` |
| List page data (rows, pagination) | Component instance properties, set after each API call        |
| Filter form state                 | Reactive `FormGroup` created from field definitions           |
| Sort state                        | Component instance property (`currentSort`)                   |
| Pagination position               | Component properties + URL query params                       |
| Loading indicators                | `LoadingToastService` (global)                                |
| Modal form state                  | `FormGroup` inside `CrudModalComponent` (destroyed on close)  |

There is no global state management library. Each component owns its data and refreshes it via API calls.

### How Refreshes Are Triggered

- After a successful create, edit, or delete: the list component calls `getData()` and `getStats()`.
- After filter changes: a debounced (500ms) subscription on `filterForm.valueChanges` calls `getData(1)` (reset to page 1).
- After sort changes: `getData(1)` is called with the new sort parameters.
- After page changes: `getData(page)` is called with the new page number.

### Optimistic vs Pessimistic Updates

The application uses **pessimistic updates exclusively**. Data is never modified locally before confirmation from the server. After every mutation:

1. Wait for the API response.
2. Show success toast.
3. Re-fetch the entire list from the server.

---

## 10. API Communication Pattern

### Request Flow

```
Component.getData()
  → Service.getAll(page, perPage, queryForm)
    → BaseCrudService builds URL: environment.apiUrl + '/' + endpoint
    → createQueryParams() converts query object to HttpParams
    → HttpClient.get() with params
      → jwtInterceptor adds Authorization header + locale headers
      → Server responds
      → errorInterceptor catches HTTP errors (401/403/404/500)
  → Component receives { data: T[], pagination: Pagination }
  → Component sets this.data and this.pagination
```

### HTTP Method Mapping

| Operation | HTTP Method | URL Pattern                         | Request Body | Response Shape                 |
| --------- | ----------- | ----------------------------------- | ------------ | ------------------------------ |
| List      | GET         | `/{endpoint}?page=N&per_page=M&...` | None         | `{ data: T[], pagination }`    |
| Detail    | GET         | `/{endpoint}/{id}`                  | None         | `{ data: T }` or `T`           |
| Create    | POST        | `/{endpoint}`                       | JSON body    | `{ message: string, data: T }` |
| Update    | PATCH       | `/{endpoint}/{id}`                  | JSON body    | `{ message: string }`          |
| Delete    | DELETE      | `/{endpoint}/{id}`                  | None         | `{ message: string }`          |
| Stats     | GET         | `/{endpoint}/stats`                 | None         | `{ data: StatEntry[] }`        |

### Error Normalization

The `errorInterceptor` catches errors at the HTTP level:

- **401**: Shows error toast, clears auth data, redirects to login.
- **403**: Shows "access forbidden" toast.
- **404**: Shows warning toast.
- **500**: Shows error toast.
- All errors are re-thrown as `error.error` (the response body), so components receive the server's error payload in their `error` callbacks.

### JWT Interceptor

Every outgoing request (when a token exists) is cloned with:

- `Authorization: Bearer {token}`
- `X-Locale: {current-language}`
- `X-Locale-Timezone: {browser-timezone}`
- `X-Client-Locale: {current-language}`

### Pagination and Filtering Strategy

- Pagination parameters are always `page` and `per_page`.
- Filter values come directly from `filterForm.getRawValue()` — the form control names must match the API query parameter names.
- Sort parameters are `sort` (field name) and `order` (`asc` or `desc`).
- All parameters are merged into a single query object and passed through `createQueryParams()`.
- Empty string, null, and undefined values are excluded from the query string.

### Pagination Response Shape

```typescript
interface Pagination {
  total: number;
  current_page: number;
  per_page: number;
  total_pages: number;
}
```

---

## 11. Feature Replication Guide

Follow this checklist to add a new CMS entity called `{Entity}` (e.g., "Vehicles").

### Step 1: Create the interface and enum

- [ ] Create `core/interface/{entity}.interface.ts` with the TypeScript interface.
- [ ] Create `core/enum/{entity}-status.enum.ts` if the entity has status values.

### Step 2: Create the feature service

- [ ] Create `feature/{entity}/services/{entity}.service.ts`:
  - Extend `BaseCrudService<Entity>`.
  - Set `protected endpoint = '{api-path}'`.
  - Add custom methods if needed (e.g., `getStats()`).
  - Decorate with `@Injectable({ providedIn: 'root' })`.

### Step 3: Create the fields service

- [ ] Create `feature/{entity}/services/{entity}-fields.service.ts`:
  - Decorate with `@Injectable({ providedIn: 'root' })`.
  - Define `filterFields: InputField[]` — one field per filter.
  - Define `mainFields: InputField[]` — one field per form field.
  - Define `tableHeader: TableHeader<Entity>[]` — one entry per table column.
  - Each field uses `createField<T>()` with the appropriate `controlType` component.

### Step 4: Create modal config functions

- [ ] Create `feature/{entity}/components/add-{entity}/add-{entity}.config.ts`:
  - Export a pure function that returns a `CrudModalConfig` with `mode: 'add'`.
- [ ] Create `feature/{entity}/components/edit-{entity}/edit-{entity}.config.ts`:
  - Export a pure function that returns a `CrudModalConfig` with `mode: 'edit'`.
  - Include `getData`, `updateData`, and optionally `mapDataForForm`.

### Step 5: Create the list page

- [ ] Create `feature/{entity}/pages/all-{entity}/all-{entity}.component.ts`:
  - Inject: entity service, fields service, FormFactoryService, DialogService, ToastService, LoadingToastService, TranslateService, Router, ActivatedRoute.
  - Add `providers: [DialogService]` to component metadata.
  - Add `@AutoUnsubscribe('subs')` decorator.
  - In `ngOnInit`: read query params, create filter form, call `getData()` and `getStats()`, subscribe to filter changes with debounce.
  - Implement: `getData()`, `getStats()`, `onAdd()`, `onEdit()`, `onDelete()`, `onSort()`, `onPageChange()`, `onPreview()`.
- [ ] Create `feature/{entity}/pages/all-{entity}/all-{entity}.component.html`:
  - Use `<app-content-layout>` as the root wrapper !p-6.
  - Add `<app-filters>` section, `<app-display-cards>` section, and `<app-table>` section.
  - Add custom `ng-template` blocks for any columns that need custom rendering.

### Step 6: Create the detail page (optional)

- [ ] If the entity has nested resources, create `feature/{entity}/pages/single-{entity}/single-{entity}.component.ts`.

### Step 7: Create translations

- [ ] Create `feature/{entity}/i18n/en.json` with keys for: title, description, filter labels, filter placeholders, table headers, field labels, add/edit modal titles.
- [ ] Create corresponding files for other supported languages.

### Step 8: Create the routes file

- [ ] Create `feature/{entity}/{entity}.routes.ts`:
  - Default export a `Routes` array.
  - Parent route: resolve with `featureTranslationResolver`, data.feature = `'{entity}'`.
  - Child route `''`: lazy-load the list component.
  - Child route `':id'`: lazy-load the detail component (if applicable).

### Step 9: Wire into the application

- [ ] Add the lazy-loaded route to `app.routes.ts` under `PrivateLayoutComponent` children.
- [ ] Add a sidebar menu entry to the sidebar items constant in `core/sidebar.ts`.

### Common Pitfalls

- Forgetting to add `providers: [DialogService]` to the list component.
- Forgetting the `@AutoUnsubscribe('subs')` decorator.
- Using `filterForm.value` instead of `filterForm.getRawValue()` (the former excludes disabled controls).
- Not resetting to page 1 when filters or sort changes.
- Not calling both `getData()` and `getStats()` after mutations.
- Not matching `data.feature` in routes to the actual i18n folder name.
- Creating a service without `providedIn: 'root'` when it should be a singleton.

---

## 12. What Must Never Be Changed

These are architectural invariants. Breaking any of these will cause inconsistencies across the CMS.

### Structural Invariants

1. **One CrudModalComponent for all features.** Features must never create custom modal components for create/edit operations. They supply a `CrudModalConfig` object and nothing more.
2. **One TableComponent for all features.** Features customize table behavior through `TableHeader` definitions and `ng-template` column overrides, never through component forks.
3. **All CRUD services extend BaseCrudService.** Custom HTTP methods are added alongside, never replacing the base methods.
4. **All form fields use the dynamic form factory.** Fields are declared in the fields service and rendered via `<ngx-form-factory>`. Manual form building in components is prohibited.
5. **All form input components extend FormFactoryFieldComponent.** No standalone form input components that bypass the form factory contract.

### Dependency Injection Invariants

6. **Always use `inject()` function.** Constructor-based injection is prohibited.
7. **DialogService is provided at component level**, not at root. This ensures each dialog instance is scoped correctly.

### State Invariants

8. **No global state management library.** State lives in services (for auth) or components (for page data). Signals are used for local reactive state.
9. **Pessimistic updates only.** Always re-fetch from the server after mutations.

### Routing Invariants

10. **Feature routes must use the translation resolver.** Every feature route's parent must resolve `featureTranslationResolver` with the correct `data.feature` value.
11. **Components are lazy-loaded.** Use `loadComponent` for pages, `loadChildren` for feature route modules.

### Styling Invariants

12. **Never use `::ng-deep`.** Override PrimeNG styles using CSS variables only.
13. **Prefer TailwindCSS utility classes** in templates over component-level SCSS.

### Form Invariants

14. **Always use Reactive Forms.** Template-driven forms are prohibited.
15. **Always mark form as all-touched** (`form.markAllAsTouched()`) on invalid submit to trigger error display.
16. **Validation errors are displayed by FieldErrorsComponent**, not by ad-hoc template logic.

### Cleanup Invariants

17. **Every component with subscriptions must use `@AutoUnsubscribe`.** This is the only acceptable cleanup pattern.

### Translation Invariants

18. **All user-facing text uses translation keys.** No hardcoded display strings in templates or components (except internal labels like "Loading...").
19. **Feature translations live in `feature/{entity}/i18n/`**, not in the global translation files.
20. **Global translations** (shared labels like buttons, confirmations, common enums) live in `public/i18n/`.

---

_This document is the single source of truth for the CMS architecture. When in doubt, follow the patterns described here. When adding a new feature, follow the Feature Replication Guide checklist exactly. When reviewing code, verify compliance with the invariants in Section 12._

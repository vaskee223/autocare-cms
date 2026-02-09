# Instructions for POC Generation

This document bridges the gap between `ARCHITECTURE_AND_FEATURE_PLAYBOOK.md` (architectural patterns) and `api-docs.md` (API contract) to produce a minimal, working proof-of-concept CMS application.

The target is: **Login + 1 CRUD (Users) + Dashboard**, using pure PrimeNG and Reactive Forms — no `ngx-dynamic-forms-factory`.

---

## 1. Scope Definition

### What to build

| Area                                      | What's included                                                                                            |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Auth**                                  | Login page only (no register, forgot-password, or reset-password)                                          |
| **Dashboard**                             | Single page showing 4 stat cards from `GET /api/admin/dashboard`                                           |
| **Users CRUD**                            | List with filters + pagination + sorting, create via modal, edit via detail page, delete with confirmation |
| **Profile**                               | Not included in POC                                                                                        |
| **Cars, Maintenances, Fuel Consumptions** | Not included in POC                                                                                        |
| **App (user-facing)**                     | Not included — admin CMS only                                                                              |

### What to skip entirely

- `ngx-dynamic-forms-factory` — replaced with direct Reactive Forms
- `@AutoUnsubscribe` decorator — use `DestroyRef` + `takeUntilDestroyed()` instead (Angular built-in)
- `AbilityService` / permission system — no RBAC in POC
- Feature translation resolver — use a single global translation file
- `DisplayCardsComponent` — build inline or as a simple component
- `LoadingToastService` — use a simple boolean loading signal
- Multiple toast keys — use a single `<p-toast>`

---

## 2. Project Setup

### Step 1: Create Angular project

```bash
ng new cms --style=scss --routing --ssr=false --skip-tests
cd cms
```

### Step 2: Install dependencies

```bash
# PrimeNG + theme
npm install primeng @primeng/themes

# Icons
npm install @ng-icons/core @ng-icons/heroicons

# Translation
npm install @ngx-translate/core @ngx-translate/http-loader

# TailwindCSS
npm install -D tailwindcss @tailwindcss/postcss postcss
```

### Step 3: Configure TailwindCSS

Create `.postcssrc.json` in root:

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

In `src/styles.scss`:

```scss
@import 'tailwindcss';
```

### Step 4: Configure PrimeNG

In `app.config.ts`:

```typescript
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: { darkModeSelector: '.dark' },
      },
    }),
    MessageService,
    ConfirmationService,
  ],
};
```

### Step 5: Configure translations

In `app.config.ts` add:

```typescript
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

function httpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './i18n/', '.json');
}

// Add to providers:
provideTranslateService({
  defaultLang: 'en',
  loader: {
    provide: TranslateLoader,
    useFactory: httpLoaderFactory,
    deps: [HttpClient],
  },
}),
```

Create `public/i18n/en.json` with all translation keys.

### Step 6: Environment file

Create `src/environments/environment.ts`:

```typescript
export const environment = {
  apiUrl: 'http://localhost:3000/api/admin',
  authUrl: 'http://localhost:3000/api/auth',
};
```

---

## 3. API Contract Mapping

The playbook patterns assume certain API conventions. Your actual API (from `api-docs.md`) differs in some ways. Here is the mapping:

### Pagination parameter

| Playbook pattern | Your API      |
| ---------------- | ------------- |
| `per_page`       | `limit`       |
| `page`           | `page` (same) |

**Action:** In `BaseCrudService.getAll()`, send `limit` instead of `per_page`:

```typescript
params: createQueryParams({ page, limit: perPage, ...queryForm }, true);
```

### Login endpoint and response

| Playbook pattern                          | Your API                                           |
| ----------------------------------------- | -------------------------------------------------- |
| `POST {apiUrl}/login`                     | `POST {authUrl}/login`                             |
| Response: `{ data: User, token: string }` | Response: `{ message, user: User, token: string }` |

**Action:** AuthService.login() must use `environment.authUrl` and read `res.user` instead of `res.data`.

### CRUD response shapes

| Operation | Your API response                       | Compatible with playbook?                                  |
| --------- | --------------------------------------- | ---------------------------------------------------------- |
| List      | `{ data: T[], pagination: Pagination }` | Yes, exact match                                           |
| Detail    | `{ data: T }`                           | Yes                                                        |
| Create    | `{ message: string, data: T }`          | Yes                                                        |
| Update    | `{ message: string, data: T }`          | Yes (playbook expects `{ message }`, extra `data` is fine) |
| Delete    | `{ message: string }`                   | Yes, exact match                                           |

### User model field naming

The API uses **camelCase** (`firstName`, `lastName`, `dateOfBirth`). This is standard and requires no transformation.

---

## 4. Replacing ngx-dynamic-forms-factory with Pure PrimeNG

This is the biggest architectural change from the playbook. Instead of declarative field configs rendered by a form factory, forms are built explicitly.

### What changes

| Playbook approach                                          | POC approach                                                                       |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `FormFactoryService.createForm(fields)`                    | Build `FormGroup` directly with `FormBuilder` or `new FormGroup({...})`            |
| `<ngx-form-factory [form]="form" [formFields]="fields" />` | Write PrimeNG inputs directly in the template                                      |
| `FormFactoryFieldComponent` base class                     | Not needed — inputs are used directly                                              |
| `InputComponent`, `SelectComponent` etc. as `controlType`  | Not needed — use `<input pInputText>`, `<p-select>` directly                       |
| Fields service returns `InputField[]`                      | Fields service returns `{ form: FormGroup, ... }` or component builds its own form |

### Fields service pattern (pure approach)

Instead of returning field definition arrays, the fields service provides:

- A method to create the filter FormGroup
- A method to create the main (create/edit) FormGroup
- The table header array (this stays the same — it's just data)

```typescript
@Injectable({ providedIn: 'root' })
export class UsersFieldsService {
  private fb = inject(FormBuilder);

  createFilterForm(): FormGroup {
    return this.fb.group({
      search: [''],
      dateRangeFrom: [null],
      dateRangeTo: [null],
    });
  }

  createMainForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  // For edit mode — same fields but password is optional
  createEditForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  tableHeaders: TableHeader[] = [
    {
      field: 'id',
      header: 'users.table.id',
      sort: { sortParam: 'id', sortDirection: '', activeSort: false },
    },
    { field: 'firstName', header: 'users.table.firstName' },
    { field: 'lastName', header: 'users.table.lastName' },
    { field: 'email', header: 'users.table.email' },
    { field: 'createdAt', header: 'users.table.createdAt', date: true },
  ];
}
```

### Template pattern (pure PrimeNG forms)

Instead of `<ngx-form-factory>`, write explicit templates:

```html
<form [formGroup]="form" class="grid grid-cols-12 gap-4">
  <div class="col-span-12 md:col-span-6">
    <label class="text-sm mb-1 block">{{ 'users.fields.firstName' | translate }}</label>
    <input pInputText formControlName="firstName" class="w-full" />
    <small
      class="text-red-500"
      *ngIf="form.get('firstName')?.touched && form.get('firstName')?.errors?.['required']"
    >
      {{ 'validation.required' | translate }}
    </small>
  </div>

  <div class="col-span-12 md:col-span-6">
    <label class="text-sm mb-1 block">{{ 'users.fields.lastName' | translate }}</label>
    <input pInputText formControlName="lastName" class="w-full" />
  </div>

  <div class="col-span-12 md:col-span-6">
    <label class="text-sm mb-1 block">{{ 'users.fields.email' | translate }}</label>
    <input pInputText formControlName="email" type="email" class="w-full" />
  </div>

  <div class="col-span-12 md:col-span-6">
    <label class="text-sm mb-1 block">{{ 'users.fields.dateOfBirth' | translate }}</label>
    <p-datepicker fluid formControlName="dateOfBirth" dateFormat="yy-mm-dd" styleClass="w-full" />
  </div>
</form>
```

### CrudModal adaptation

The `CrudModalComponent` still works with this approach but is simplified:

- Instead of receiving `formFields: InputField[]` and using `formFactory.createForm()`, it receives a pre-built `FormGroup` and a template reference (or the modal content is inlined in each feature).
- **Simpler alternative for POC:** Skip the generic `CrudModalComponent` entirely. Open PrimeNG `DynamicDialog` directly with a feature-specific modal component that has its own template.

**Recommended POC approach:**

```typescript
// users/components/user-form-modal.component.ts
@Component({
  template: `
    <form [formGroup]="form" class="grid grid-cols-12 gap-4 p-4">
      <!-- explicit PrimeNG fields here -->
    </form>
    <div class="flex justify-end gap-2 p-4">
      <p-button label="Cancel" variant="outlined" (onClick)="onCancel()" />
      <p-button label="Save" (onClick)="onSubmit()" />
    </div>
  `,
})
export class UserFormModalComponent implements OnInit {
  // Same lifecycle as CrudModalComponent from playbook:
  // - reads config from DynamicDialogConfig
  // - fetches data in edit mode
  // - patches form
  // - submits and closes with ref.close(true/false)
}
```

This is less DRY than the playbook's generic modal but eliminates the form factory dependency entirely. Once the POC is proven, you can refactor toward a generic modal with dynamic content projection.

---

## 5. Simplified Component Patterns

### Replace AutoUnsubscribe with DestroyRef

The playbook uses a custom `@AutoUnsubscribe` decorator. For the POC, use Angular's built-in:

```typescript
export class MyComponent {
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.myService.getData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(...)
  }
}
```

### Replace LoadingToastService with signals

```typescript
export class AllUsersComponent {
  loading = signal(false);

  getData() {
    this.loading.set(true);
    this.usersService.getAll(...).subscribe({
      next: (res) => { this.data.set(res.data); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
  }
}
```

### Replace DisplayCardsComponent with inline template

```html
<div class="grid grid-cols-4 gap-4">
  @for (card of dashboardStats(); track card.label) {
  <div class="p-4 rounded-lg border">
    <span class="text-sm text-gray-500">{{ card.label | translate }}</span>
    <p class="text-2xl font-bold">{{ card.value }}</p>
  </div>
  }
</div>
```

---

## 6. File Structure for POC

```
src/app/
├── core/
│   ├── constants.ts                    # Pagination defaults
│   ├── guards/
│   │   └── auth.guard.ts
│   ├── interceptors/
│   │   ├── jwt.interceptor.ts
│   │   └── error.interceptor.ts
│   ├── interfaces/
│   │   ├── pagination.interface.ts
│   │   ├── table-header.interface.ts
│   │   └── user.interface.ts
│   ├── services/
│   │   ├── base-crud.service.ts
│   │   ├── auth.service.ts
│   │   ├── toast.service.ts
│   │   └── confirm.service.ts
│   └── utils.ts                        # createQueryParams, etc.
│
├── layout/
│   ├── private-layout.component.ts     # Sidebar + outlet
│   ├── auth-layout.component.ts        # Minimal outlet
│   └── sidebar.component.ts            # Navigation menu
│
├── shared/
│   ├── table/
│   │   ├── table.component.ts
│   │   ├── table.component.html
│   │   └── column-table.directive.ts
│   ├── paginator.component.ts
│   ├── field-errors.component.ts
│   └── content-layout.component.ts
│
├── feature/
│   ├── auth/
│   │   ├── auth.routes.ts
│   │   └── login/
│   │       ├── login.component.ts
│   │       └── login.component.html
│   ├── dashboard/
│   │   ├── dashboard.routes.ts
│   │   └── dashboard.component.ts
│   └── users/
│       ├── users.routes.ts
│       ├── services/
│       │   ├── users.service.ts
│       │   └── users-fields.service.ts
│       ├── pages/
│       │   ├── all-users/
│       │   │   ├── all-users.component.ts
│       │   │   └── all-users.component.html
│       │   └── single-user/
│       │       ├── single-user.component.ts
│       │       └── single-user.component.html
│       └── components/
│           └── user-form-modal/
│               ├── user-form-modal.component.ts
│               └── user-form-modal.component.html
│
├── app.component.ts
├── app.config.ts
└── app.routes.ts

public/
└── i18n/
    └── en.json
```

Note: Compared to the playbook, `pattern/` and `ui/` are merged into `shared/` for the POC. The separation can be restored later if the project grows.

---

## 7. Implementation Order

Build files in this exact order to avoid broken imports:

### Phase 1: Core (no UI)

1. `core/interfaces/pagination.interface.ts`
2. `core/interfaces/table-header.interface.ts`
3. `core/interfaces/user.interface.ts`
4. `core/constants.ts`
5. `core/utils.ts` (createQueryParams)
6. `core/services/auth.service.ts`
7. `core/services/toast.service.ts`
8. `core/services/confirm.service.ts`
9. `core/services/base-crud.service.ts`
10. `core/interceptors/jwt.interceptor.ts`
11. `core/interceptors/error.interceptor.ts`
12. `core/guards/auth.guard.ts`
13. `src/environments/environment.ts`

### Phase 2: Shared components

14. `shared/field-errors.component.ts`
15. `shared/paginator.component.ts`
16. `shared/content-layout.component.ts`
17. `shared/table/column-table.directive.ts`
18. `shared/table/table.component.ts` + `.html`

### Phase 3: Layouts

19. `layout/sidebar.component.ts`
20. `layout/private-layout.component.ts`
21. `layout/auth-layout.component.ts`

### Phase 4: Auth feature

22. `feature/auth/login/login.component.ts` + `.html`
23. `feature/auth/auth.routes.ts`

### Phase 5: Dashboard

24. `feature/dashboard/dashboard.component.ts`
25. `feature/dashboard/dashboard.routes.ts`

### Phase 6: Users CRUD

26. `feature/users/services/users.service.ts`
27. `feature/users/services/users-fields.service.ts`
28. `feature/users/components/user-form-modal/user-form-modal.component.ts` + `.html`
29. `feature/users/pages/all-users/all-users.component.ts` + `.html`
30. `feature/users/pages/single-user/single-user.component.ts` + `.html`
31. `feature/users/users.routes.ts`

### Phase 7: Wiring

32. `app.routes.ts`
33. `app.config.ts`
34. `app.component.ts`
35. `public/i18n/en.json`

---

## 8. Key Behavioral Rules

These rules from the playbook apply to the POC without modification:

1. **All services use `inject()`** — never constructor injection (except DynamicDialogRef/DynamicDialogConfig in modals, which require constructor injection by PrimeNG).
2. **Pessimistic updates only** — always re-fetch after mutations.
3. **Filter changes debounced at 500ms** and reset to page 1.
4. **Sorting cycles: none → asc → desc → none.**
5. **Delete always goes through ConfirmService** (confirmation popup).
6. **Modal close returns `true` for success, parent re-fetches.**
7. **Error interceptor handles 401 → logout + redirect to login.**
8. **All user-facing text uses translation keys.**
9. **Page/rows are synced to URL query params.**
10. **Loading state shown as skeleton rows in table, not a spinner.**

---

## 9. What NOT to Include in the Backend Folder

The `api-docs.md` file is sufficient. You do **not** need to include the backend project. The API docs provide:

- Every endpoint URL and HTTP method
- Every request body shape
- Every response shape with examples
- Every query parameter for filtering/pagination
- All enum values
- All model field definitions

The only thing you need from the backend is: **it must be running** at the configured `apiUrl` when testing the frontend.

---

## 10. Translation File Structure

Single file `public/i18n/en.json`:

```
{
  "sidebar": { ... menu labels },
  "login": { ... login page labels },
  "dashboard": { ... dashboard labels },
  "users": {
    "title": "...",
    "description": "...",
    "filter": { "search": "...", "placeholders": { ... } },
    "fields": { "firstName": "...", "lastName": "...", ... },
    "table": { "id": "...", "firstName": "...", ... },
    "add": { "title": "..." },
    "edit": { "title": "..." }
  },
  "buttons": { "save": "...", "cancel": "...", "delete": "...", "add": "..." },
  "validation": { "required": "...", "email": "...", "minlength": "..." },
  "confirmations": { "delete": "..." },
  "common": { "actions": "...", "noData": "..." }
}
```

---

## Summary

Place these three files in the empty folder:

1. `ARCHITECTURE_AND_FEATURE_PLAYBOOK.md` — architectural source of truth
2. `api-docs.md` — API contract
3. `INSTRUCTIONS.md` — this file (setup, adaptations, build order)

Then instruct: _"Using these three documents, generate a minimal Angular CMS with login and Users CRUD. Follow the architecture from the playbook, the API contract from api-docs.md, and the adaptations from INSTRUCTIONS.md."_

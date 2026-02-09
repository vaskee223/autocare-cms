# CLAUDE.md - Project Development Guidelines

This document provides comprehensive guidelines for AI-assisted development in this Angular project. Follow these patterns to maintain consistency with the existing codebase.

This file defines conventions for AI-assisted code generation and review to ensure consistency and maintainability across the codebase.

Claude or any AI assistant should never introduce code violating these rules, even if user examples differ.

## Quick Reference

**Tech Stack:**

- Angular 20.3.2 with standalone components
- PrimeNG 20.2.0 for UI components
- TailwindCSS 4.1.7 for styling
- ngx-dynamic-forms-factory for dynamic forms
- @ngx-translate/core for i18n
- TypeScript 5.9.3 with strict mode

**Key Commands:**

```bash
npm start          # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
```

## CRITICAL: Common Pitfalls to Avoid

### ❌ NEVER DO THIS:

1. **Never use constructor injection** - Always use `inject()`
2. **Never use `::ng-deep`** - Use CSS variables instead
3. **Never use template-driven forms** - Always use Reactive Forms
4. **Never skip error handling** - Always handle errors with ToastService
5. **Never use `any` type** - Always provide proper types
6. **Never create files unless necessary** - Prefer editing existing files
7. **Never use BehaviorSubject for state** - Use signals instead
8. **Never commit without user request** - Only commit when explicitly asked
9. **Never skip validation** - Validate both frontend and backend
10. **Never hardcode API URLs** - Use environment variables
11. **You must never call Object.keys(...) directly in the template.** - Use a computed as a getter or signal

### ✅ ALWAYS DO THIS:

1. **Always extend BaseCrudService** for CRUD operations
2. **Always use standalone components** with explicit imports
3. **Always use signals for state management**
4. **Always handle loading states** with skeletons
5. **Always use AutoUnsubscribe decorator** for cleanup
6. **Always mark form fields as touched** before showing errors
7. **Always use TranslatePipe** for i18n
8. **Always follow existing patterns** in libs/ folder
9. **Always use FormFactoryService** for dynamic forms
10. **Always inject services with inject()** function

## 1. Project Structure & Architecture

### Key Directory Organization

```
project-root/
├── libs/                    # Shared libraries (reusable across projects)
│   ├── core/               # Core utilities, services, interfaces
│   ├── feature/            # Feature modules
│   ├── ui/                 # UI components (buttons, headers, skeletons)
│   ├── patterns/           # Form patterns & input components
│   ├── layouts/            # Layout components & containers
│   └── auth/               # Authentication components & services
├── projects/               # Standalone applications
│   ├── app-1/              # First application
│   └── app-2/              # Second application
```

**Library Separation Logic:**

- `libs/core`: Framework-agnostic utilities, base services, interfaces, validators
- `libs/feature`: Complete feature modules that can be imported into any project
- `libs/ui`: Presentational components without business logic
- `libs/patterns`: Form-related components and input patterns
- `libs/layouts`: Application shells and layout containers
- `libs/auth`: Authentication flows and guards

**Projects Separation:**

- Each project in `projects/` is a complete Angular application
- Projects import and reuse components from `libs/`
- Project-specific features go in `projects/[name]/src/app/feature/`

## 2. PrimeNG Implementation Guidelines

### General Patterns

**Module Import Pattern:**

```typescript
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
```

**CSS Variable Theming:**

- Override PrimeNG styles using CSS variables in `.p-component` class
- Main theme colors defined as `--main-color` and `--main-color-dark`
- Never use `::ng-deep`, use CSS variables instead

```scss
.p-component {
  --p-inputtext-focus-border-color: #000000;
  --p-button-background: var(--main-color);
  --p-checkbox-checked-background: var(--main-color);
}
```

**Common PrimeNG Components Used:**

- Forms: `InputTextModule`, `SelectModule`, `TextareaModule`, `PasswordModule`
- Data: `TableModule`, `PaginatorModule`
- Feedback: `ToastModule`, `ConfirmPopupModule`, `TooltipModule`
- Misc: `SkeletonModule`, `ButtonModule`, `ToggleSwitchModule`

## 3. Form & Input Field Patterns

### Dynamic Form Factory Pattern

**Using FormFactoryService:**

```typescript
import { FormFactoryService } from 'ngx-dynamic-forms-factory';

// In component
formFactory = inject(FormFactoryService);

// Create form from field definitions
const form = this.formFactory.createForm(fields);
```

### Input Component Pattern

All input components extend `FormFactoryFieldComponent`:

```typescript
@Component({
  selector: 'app-input',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    FieldErrorsComponent,
    TranslatePipe,
  ],
  template: `...`,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { optional: true, skipSelf: true }),
    },
  ],
})
export class InputComponent extends FormFactoryFieldComponent {
  private injector = inject(Injector);

  // Use computed signal for control access
  private controlSignal = computed<FormControl | null>(() => {
    const fieldValue = this.field();
    const controlName = fieldValue?.options?.formControlName;
    // ... control resolution logic
  });

  override get control(): FormControl | null {
    return this.controlSignal();
  }
}
```

### Field Types (FormFieldType enum)

```typescript
export enum FormFieldType {
  INPUT = 'input',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  TEXTAREA = 'textarea',
  CHECKBOX = 'checkbox',
  CHECKBOX_GROUP = 'checkbox-group',
  RADIO = 'radio',
  DATE_PICKER = 'date-picker',
  INPUT_NUMBER = 'input-number',
  INPUT_PHONE = 'input-phone',
  INPUT_WEBSITE = 'input-website',
  INFO_BLOCK = 'info-block',
  UPLOAD = 'upload',
  DURATION = 'duration',
}
```

### Validation Pattern

```typescript
// Show required asterisk
showRequired() {
  return (
    this.field()?.options.validators &&
    this.field()?.options.validators.includes(Validators.required)
  );
}

// Field errors component usage
<app-field-errors [errors]="control?.errors" [control]="control" />
```

## 4. Component Development Standards

### Angular 20 Signals & Lifecycle

**Signal Pattern:**

```typescript
import { signal, computed, effect } from '@angular/core';

export class MyComponent {
  // State management with signals
  currentSectionIndex = signal<number>(0);

  // Computed values
  private controlSignal = computed<FormControl | null>(() => {
    // Derivation logic
  });

  // Side effects
  constructor() {
    effect(() => {
      const ctrl = this.control;
      if (!ctrl) return;
      // React to control changes
    });
  }
}
```

**Component Structure:**

```typescript
@Component({
  selector: 'app-component-name',
  imports: [
    // All imports listed explicitly (standalone components)
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    // ... PrimeNG modules
    // ... custom components
  ],
  templateUrl: './component-name.component.html', // or template: ``
  viewProviders: [
    // Component-level providers
  ],
})
```

**Lifecycle & Decorators:**

```typescript
@AutoUnsubscribe('subs') // Custom decorator for subscription cleanup
export class MyComponent implements OnInit, OnDestroy {
  subs = new Subscription();

  ngOnInit() {
    this.subs.add(
      this.service.getData().subscribe(...)
    );
  }
}
```

## 5. Service & State Management

### Base CRUD Service Pattern

```typescript
@Injectable()
export abstract class BaseCrudService<T> {
  protected http = inject(HttpClient);
  protected abstract endpoint: string;
  protected environment = inject<Environment>(ENVIRONMENT);

  getAll(
    page: number,
    perPage: number,
    queryForm: Record<string, any>,
  ): Observable<{ data: T[]; pagination: Pagination }> {
    return this.http.get<{ data: T[]; pagination: Pagination }>(
      `${this.environment.apiUrl}/${this.endpoint}`,
      { params: createQueryParams({ page, per_page: perPage, ...queryForm }, true) },
    );
  }

  getOne(id: string): Observable<T | { data: T }> {}
  create(data: T): Observable<{ message: string; data: T }> {}
  update(id: string, data: T): Observable<{ message: string }> {}
  delete(id: string | number): Observable<{ message: string }> {}
}
```

**Service Implementation:**

```typescript
@Injectable({ providedIn: 'root' })
export class MyFeatureService extends BaseCrudService<MyModel> {
  protected endpoint = 'my-feature';
}
```

### Dependency Injection Pattern

Always use `inject()` function instead of constructor injection:

```typescript
export class MyComponent {
  // Services
  private router = inject(Router);
  private toastService = inject(ToastService);
  private translate = inject(TranslateService);

  // Don't use constructor injection
  // constructor(private router: Router) { } // ❌
}
```

### State Management

- No global state management library (NgRx, Akita) used
- Services hold state when needed
- Components manage local state with signals
- Form state managed by ReactiveFormsModule

## 6. Styling & Theming Approach

### TailwindCSS + PrimeNG Variables

**TailwindCSS Classes:**

```html
<!-- Spacing and layout -->
<div class="flex flex-col gap-4 p-4">
  <!-- Typography -->
  <span class="text-sm mb-1 block text-gray-800">
    <!-- Responsive -->
    <div class="w-full lg:w-1/2"></div
  ></span>
</div>
```

**PrimeNG Theming:**

```scss
// In styles.scss
:root {
  --main-color: #your-primary-color;
  --main-color-dark: #your-primary-dark;
}

.p-component {
  --p-primary-color: var(--main-color);
  --p-button-background: var(--main-color);
}
```

**Component Styles:**

- Prefer TailwindCSS utility classes in templates
- Use `:host` for component-specific styles
- Never use `::ng-deep` - use CSS variables instead

## 7. i18n & Translation Patterns

### Translation Setup

**Using TranslatePipe:**

```typescript
// In component imports
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [TranslatePipe],
  template: `{{ 'key.path' | translate }}`
})
```

**Dynamic Language Content:**

```typescript
// Get current language
lang = this.translate.getCurrentLang();

// Listen to language changes
this.translate.onLangChange.subscribe((event) => {
  this.lang = event.lang;
  this.retransformContent();
});
```

### Multi-language Form Fields

```typescript
// Helper function for fallback
getWithFallback(obj: any, lang: string, fallbackLang = 'en'): string {
  return obj?.[lang] || obj?.[fallbackLang] || '';
}

// In template
{{ getWithFallback(field.label, lang) }}
```

### Translation File Structure

```
projects/[app]/src/app/feature/[feature]/i18n/
├── en.json
├── sr.json
└── cyr.json
```

**JSON Structure:**

```json
{
  "feature_name": {
    "title": "Feature Title",
    "buttons": {
      "save": "Save",
      "cancel": "Cancel"
    }
  }
}
```

## 8. Custom Patterns & Utilities

### AutoUnsubscribe Decorator

```typescript
@AutoUnsubscribe('subs')
export class MyComponent {
  subs = new Subscription();
  // Automatically unsubscribes on component destroy
}
```

### Toast Service Pattern

```typescript
toastService = inject(ToastService);

// Success
this.toastService.addSuccess({ detail: 'Operation successful' });

// Error
this.toastService.addError({ detail: err.error.message });
```

### Confirm Service

```typescript
confirmService = inject(ConfirmService);

deleteItem(event: Event, id: number) {
  this.confirmService.confirm(event, {
    accept: () => {
      // Perform deletion
    }
  });
}
```

### Query Params Helper

```typescript
import { createQueryParams } from 'libs/core/src/public-api';

// Creates HttpParams from object, filtering nullish values
const params = createQueryParams({ page: 1, search: 'test' }, true);
```

## 9. File Naming & Organization

### Component File Structure

```
component-name/
├── component-name.component.ts    # Component logic
├── component-name.component.html  # Template (if not inline)
├── component-name.component.scss  # Styles (rarely used, prefer Tailwind)
└── component-name.component.spec.ts # Tests
```

### Service Naming

```typescript
// Feature service
feature - name.service.ts;

// Field definition service
feature - name - fields.service.ts;

// Helper service
feature - name - helpers.service.ts;

// State service
feature - name - state.service.ts;
```

### Import Organization

```typescript
// Angular imports first
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

// PrimeNG imports
import { InputTextModule } from 'primeng/inputtext';

// Library imports
import { ToastService } from 'libs/core/src/public-api';

// Relative imports last
import { MyService } from '../services/my.service';
```

## 10. Best Practices & Code Guidelines

### Component Best Practices

1. **Always use standalone components** - include all imports in the imports array
2. **Use signals for state** - prefer `signal()` over BehaviorSubject
3. **Inject services with inject()** - not constructor injection
4. **Implement proper cleanup** - use AutoUnsubscribe decorator
5. **Handle loading states** - show skeletons or loading indicators
6. **Handle errors gracefully** - use ToastService for user feedback

### Form Best Practices

1. **Use Reactive Forms** - not template-driven forms
2. **Validate on backend and frontend** - duplicate validation logic
3. **Mark fields as touched** - before showing errors
4. **Use FormFactoryService** - for dynamic forms
5. **Show required indicators** - asterisk for required fields

### Service Best Practices

1. **Extend BaseCrudService** - for CRUD operations
2. **Return typed Observables** - specify return types
3. **Handle errors in components** - not in services
4. **Use environment variables** - for API URLs
5. **Create query params properly** - use createQueryParams helper

### Performance Guidelines

1. **Use OnPush change detection** - where possible
2. **Implement trackBy functions** - for ngFor loops
3. **Lazy load features** - use loadChildren in routes
4. **Use computed signals** - for derived state
5. **Avoid unnecessary subscriptions** - use async pipe when possible

### Security Guidelines

1. **Sanitize user input** - prevent XSS
2. **Use typed HTTP responses** - avoid `any` type
3. **Implement proper authentication** - use guards
4. **Validate on server** - never trust client validation alone
5. **Handle sensitive data carefully** - don't log tokens

### Code Style

1. **Use TypeScript strict mode** - enable all strict checks
2. **Avoid any type** - use proper typing
3. **Format with Prettier** - maintain consistent formatting
4. **Follow Angular style guide** - official conventions
5. **Write descriptive variable names** - self-documenting code

## Example Implementation

Here's a complete example following all guidelines:

```typescript
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';

import { AutoUnsubscribe, ToastService, TableHeader } from 'libs/core/src/public-api';
import { TableComponent } from 'libs/patterns/src/public-api';
import { MyService } from '../services/my.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-feature',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    TranslatePipe,
    TableComponent,
  ],
  templateUrl: './my-feature.component.html',
})
@AutoUnsubscribe('subs')
export class MyFeatureComponent {
  // Service injection
  private myService = inject(MyService);
  private toastService = inject(ToastService);

  // State management with signals
  loading = signal(false);
  data = signal<any[]>([]);
  currentPage = signal(1);

  // Computed values
  hasData = computed(() => this.data().length > 0);

  // Subscriptions
  subs = new Subscription();

  // Table configuration
  tableHeaders: TableHeader<any>[] = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'status', header: 'Status' },
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);

    this.subs.add(
      this.myService.getAll(this.currentPage(), 10, {}).subscribe({
        next: (response) => {
          this.data.set(response.data);
          this.loading.set(false);
        },
        error: (err) => {
          this.toastService.addError({ detail: err.error.message });
          this.loading.set(false);
        },
      }),
    );
  }

  handleDelete(event: { id: number }) {
    this.myService.delete(event.id).subscribe({
      next: () => {
        this.toastService.addSuccess({ detail: this.translate.instant('common.deleted') });
        this.loadData();
      },
      error: (err) => {
        this.toastService.addError({ detail: err.error.message });
      },
    });
  }
}
```

---

This documentation should be used as a reference for maintaining consistency across the codebase. When in doubt, look for existing implementations in the `libs/` folder for patterns to follow.

## AI Behavior Guidelines

- Prefer updating existing files over creating new ones.
- Follow project import order strictly.
- Always include all standalone imports explicitly.
- Do not suggest unrelated optimizations unless requested.

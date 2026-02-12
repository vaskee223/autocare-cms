import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FilterField } from '../../../core/interfaces/filter-field.interface';
import { TableHeader } from '../../../core/interfaces/table-header.interface';

@Injectable({ providedIn: 'root' })
export class UsersFieldsService {
  private fb = inject(FormBuilder);

  filterFields: FilterField[] = [
    {
      type: 'text',
      formControlName: 'search',
      label: 'users.filter.search',
      placeholder: 'users.filter.placeholders.search',
      colSpan: 4,
    },
    {
      type: 'date',
      formControlName: 'dateRangeFrom',
      label: 'users.filter.dateFrom',
      placeholder: 'users.filter.placeholders.dateFrom',
      colSpan: 4,
    },
    {
      type: 'date',
      formControlName: 'dateRangeTo',
      label: 'users.filter.dateTo',
      placeholder: 'users.filter.placeholders.dateTo',
      colSpan: 4,
    },
  ];

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
      password_confirmation: ['', [Validators.required]],
    });
  }

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

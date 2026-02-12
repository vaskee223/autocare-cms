import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { FilterField } from '../../../core/interfaces/filter-field.interface';
import { TableHeader } from '../../../core/interfaces/table-header.interface';

@Injectable({ providedIn: 'root' })
export class MaintenancesFieldsService {
  private fb = inject(FormBuilder);
  private translate = inject(TranslateService);

  readonly maintenanceNameToInt: Record<string, number> = {
    small_service: 1,
    big_service: 2,
    tire_change: 3,
    clutch_set: 4,
    other: 5,
  };

  getMaintenanceNameOptions() {
    return [
      {
        label: this.translate.instant('maintenances.types.small_service'),
        value: 'small_service',
      },
      {
        label: this.translate.instant('maintenances.types.big_service'),
        value: 'big_service',
      },
      {
        label: this.translate.instant('maintenances.types.tire_change'),
        value: 'tire_change',
      },
      {
        label: this.translate.instant('maintenances.types.clutch_set'),
        value: 'clutch_set',
      },
      {
        label: this.translate.instant('maintenances.types.other'),
        value: 'other',
      },
    ];
  }

  filterFields: FilterField[] = [
    {
      type: 'text',
      formControlName: 'search',
      label: 'maintenances.filter.search',
      placeholder: 'maintenances.filter.placeholders.search',
      colSpan: 4,
    },
    {
      type: 'number',
      formControlName: 'mileageFrom',
      label: 'maintenances.filter.mileageFrom',
      placeholder: 'maintenances.filter.placeholders.mileageFrom',
      colSpan: 4,
    },
    {
      type: 'number',
      formControlName: 'mileageTo',
      label: 'maintenances.filter.mileageTo',
      placeholder: 'maintenances.filter.placeholders.mileageTo',
      colSpan: 4,
    },
    {
      type: 'date',
      formControlName: 'dateRangeFrom',
      label: 'maintenances.filter.dateFrom',
      placeholder: 'maintenances.filter.placeholders.dateFrom',
      colSpan: 4,
    },
    {
      type: 'date',
      formControlName: 'dateRangeTo',
      label: 'maintenances.filter.dateTo',
      placeholder: 'maintenances.filter.placeholders.dateTo',
      colSpan: 4,
    },
  ];

  createFilterForm(): FormGroup {
    return this.fb.group({
      search: [''],
      mileageFrom: [null],
      mileageTo: [null],
      dateRangeFrom: [null],
      dateRangeTo: [null],
    });
  }

  createMainForm(): FormGroup {
    return this.fb.group({
      carId: [null, [Validators.required]],
      name: ['', [Validators.required]],
      mileage: [null, [Validators.required]],
      date: [null, [Validators.required]],
      replacedParts: this.fb.array([]),
      servicePrice: [null, [Validators.required]],
    });
  }

  createEditForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      mileage: [null, [Validators.required]],
      date: [null, [Validators.required]],
      replacedParts: this.fb.array([]),
      servicePrice: [null, [Validators.required]],
    });
  }

  createPartGroup(name = '', price: number | null = null): FormGroup {
    return this.fb.group({
      name: [name, [Validators.required]],
      price: [price, [Validators.required]],
    });
  }

  tableHeaders: TableHeader[] = [
    {
      field: 'id',
      header: 'maintenances.table.id',
      sort: { sortParam: 'id', sortDirection: '', activeSort: false },
    },
    { field: 'carId', header: 'maintenances.table.car' },
    { field: 'name', header: 'maintenances.table.name' },
    { field: 'mileage', header: 'maintenances.table.mileage' },
    { field: 'servicePrice', header: 'maintenances.table.servicePrice' },
    { field: 'date', header: 'maintenances.table.date', date: true },
  ];

  nestedTableHeaders: TableHeader[] = [
    { field: 'id', header: 'maintenances.table.id' },
    { field: 'name', header: 'maintenances.table.name' },
    { field: 'mileage', header: 'maintenances.table.mileage' },
    { field: 'servicePrice', header: 'maintenances.table.servicePrice' },
    { field: 'date', header: 'maintenances.table.date', date: true },
  ];
}

import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FilterField } from '../../../core/interfaces/filter-field.interface';
import { TableHeader } from '../../../core/interfaces/table-header.interface';

@Injectable({ providedIn: 'root' })
export class FuelConsumptionsFieldsService {
  private fb = inject(FormBuilder);

  filterFields: FilterField[] = [
    {
      type: 'text',
      formControlName: 'search',
      label: 'fuelConsumptions.filter.search',
      placeholder: 'fuelConsumptions.filter.placeholders.search',
      colSpan: 4,
    },
    {
      type: 'date',
      formControlName: 'dateRangeFrom',
      label: 'fuelConsumptions.filter.dateFrom',
      placeholder: 'fuelConsumptions.filter.placeholders.dateFrom',
      colSpan: 4,
    },
    {
      type: 'date',
      formControlName: 'dateRangeTo',
      label: 'fuelConsumptions.filter.dateTo',
      placeholder: 'fuelConsumptions.filter.placeholders.dateTo',
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
      carId: [null, [Validators.required]],
      refuelDate: [null, [Validators.required]],
      litersRefueled: [null, [Validators.required]],
      pricePerLiter: [null, [Validators.required]],
      startMileage: [null, [Validators.required]],
    });
  }

  createEditForm(): FormGroup {
    return this.fb.group({
      refuelDate: [null, [Validators.required]],
      litersRefueled: [null, [Validators.required]],
      pricePerLiter: [null, [Validators.required]],
      startMileage: [null, [Validators.required]],
      emptyDate: [null],
      endMileage: [null],
    });
  }

  tableHeaders: TableHeader[] = [
    {
      field: 'id',
      header: 'fuelConsumptions.table.id',
      sort: { sortParam: 'id', sortDirection: '', activeSort: false },
    },
    { field: 'carId', header: 'fuelConsumptions.table.car' },
    {
      field: 'refuelDate',
      header: 'fuelConsumptions.table.refuelDate',
      date: true,
    },
    {
      field: 'litersRefueled',
      header: 'fuelConsumptions.table.litersRefueled',
    },
    { field: 'totalCost', header: 'fuelConsumptions.table.totalCost' },
    { field: 'completed', header: 'fuelConsumptions.table.completed' },
  ];

  nestedTableHeaders: TableHeader[] = [
    { field: 'id', header: 'fuelConsumptions.table.id' },
    {
      field: 'refuelDate',
      header: 'fuelConsumptions.table.refuelDate',
      date: true,
    },
    {
      field: 'litersRefueled',
      header: 'fuelConsumptions.table.litersRefueled',
    },
    { field: 'totalCost', header: 'fuelConsumptions.table.totalCost' },
    { field: 'completed', header: 'fuelConsumptions.table.completed' },
  ];
}

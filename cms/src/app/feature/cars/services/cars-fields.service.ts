import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FilterField } from '../../../core/interfaces/filter-field.interface';
import { TableHeader } from '../../../core/interfaces/table-header.interface';

@Injectable({ providedIn: 'root' })
export class CarsFieldsService {
  private fb = inject(FormBuilder);

  fuelTypeOptions = [
    { label: 'Petrol', value: 'petrol' },
    { label: 'Diesel', value: 'diesel' },
    { label: 'Petrol + LPG', value: 'petrol_lpg' },
    { label: 'Petrol + CNG', value: 'petrol_cng' },
  ];

  bodyTypeOptions = [
    { label: 'Sedan', value: 'sedan' },
    { label: 'Wagon', value: 'wagon' },
    { label: 'Hatchback', value: 'hatchback' },
    { label: 'SUV', value: 'suv' },
    { label: 'Coupe', value: 'coupe' },
    { label: 'Convertible', value: 'convertible' },
    { label: 'MPV', value: 'mpv' },
    { label: 'Pickup', value: 'pickup' },
  ];

  filterFields: FilterField[] = [
    {
      type: 'text',
      formControlName: 'search',
      label: 'cars.filter.search',
      placeholder: 'cars.filter.placeholders.search',
      colSpan: 4,
    },
    {
      type: 'number',
      formControlName: 'mileageFrom',
      label: 'cars.filter.mileageFrom',
      placeholder: 'cars.filter.placeholders.mileageFrom',
      colSpan: 4,
    },
    {
      type: 'number',
      formControlName: 'mileageTo',
      label: 'cars.filter.mileageTo',
      placeholder: 'cars.filter.placeholders.mileageTo',
      colSpan: 4,
    },
    {
      type: 'date',
      formControlName: 'registrationDateFrom',
      label: 'cars.filter.registrationDateFrom',
      placeholder: 'cars.filter.placeholders.registrationDateFrom',
      colSpan: 3,
    },
    {
      type: 'date',
      formControlName: 'registrationDateTo',
      label: 'cars.filter.registrationDateTo',
      placeholder: 'cars.filter.placeholders.registrationDateTo',
      colSpan: 3,
    },
    {
      type: 'select',
      formControlName: 'fuelType',
      label: 'cars.filter.fuelType',
      placeholder: 'cars.filter.placeholders.fuelType',
      colSpan: 3,
      options: this.fuelTypeOptions,
    },
    {
      type: 'select',
      formControlName: 'bodyType',
      label: 'cars.filter.bodyType',
      placeholder: 'cars.filter.placeholders.bodyType',
      colSpan: 3,
      options: this.bodyTypeOptions,
    },
  ];

  createFilterForm(): FormGroup {
    return this.fb.group({
      search: [''],
      dateRangeFrom: [null],
      dateRangeTo: [null],
      mileageFrom: [null],
      mileageTo: [null],
      registrationDateFrom: [null],
      registrationDateTo: [null],
      fuelType: [null],
      bodyType: [null],
    });
  }

  createMainForm(): FormGroup {
    return this.fb.group({
      userId: [null, [Validators.required]],
      brand: ['', [Validators.required]],
      model: ['', [Validators.required]],
      year: [null, [Validators.required]],
      fuelType: ['', [Validators.required]],
      engineCode: [''],
      transmissionCode: [''],
      vinNumber: ['', [Validators.required]],
      color: ['', [Validators.required]],
      bodyType: ['', [Validators.required]],
      mileage: [null, [Validators.required]],
      registrationDate: [null, [Validators.required]],
    });
  }

  createEditForm(): FormGroup {
    return this.fb.group({
      userId: [null, [Validators.required]],
      brand: ['', [Validators.required]],
      model: ['', [Validators.required]],
      year: [null, [Validators.required]],
      fuelType: ['', [Validators.required]],
      engineCode: [''],
      transmissionCode: [''],
      vinNumber: ['', [Validators.required]],
      color: ['', [Validators.required]],
      bodyType: ['', [Validators.required]],
      mileage: [null, [Validators.required]],
      registrationDate: [null, [Validators.required]],
    });
  }

  tableHeaders: TableHeader[] = [
    {
      field: 'id',
      header: 'cars.table.id',
      sort: { sortParam: 'id', sortDirection: '', activeSort: false },
    },
    { field: 'brand', header: 'cars.table.brand' },
    { field: 'model', header: 'cars.table.model' },
    { field: 'year', header: 'cars.table.year' },
    { field: 'fuelType', header: 'cars.table.fuelType' },
    { field: 'bodyType', header: 'cars.table.bodyType' },
    { field: 'mileage', header: 'cars.table.mileage' },
    {
      field: 'registrationDate',
      header: 'cars.table.registrationDate',
      date: true,
    },
  ];
}

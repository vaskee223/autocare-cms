import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { FilterField } from '../../../core/interfaces/filter-field.interface';
import { TableHeader } from '../../../core/interfaces/table-header.interface';

@Injectable({ providedIn: 'root' })
export class CarsFieldsService {
  private fb = inject(FormBuilder);
  private translate = inject(TranslateService);

  readonly fuelTypeToInt: Record<string, number> = {
    petrol: 1,
    diesel: 2,
    petrol_lpg: 3,
    petrol_cng: 4,
  };

  readonly bodyTypeToInt: Record<string, number> = {
    sedan: 1,
    wagon: 2,
    hatchback: 3,
    suv: 4,
    coupe: 5,
    convertible: 6,
    mpv: 7,
    pickup: 8,
  };

  getFuelTypeOptions() {
    return [
      {
        label: this.translate.instant('cars.fuelTypes.petrol'),
        value: 'petrol',
      },
      {
        label: this.translate.instant('cars.fuelTypes.diesel'),
        value: 'diesel',
      },
      {
        label: this.translate.instant('cars.fuelTypes.petrol_lpg'),
        value: 'petrol_lpg',
      },
      {
        label: this.translate.instant('cars.fuelTypes.petrol_cng'),
        value: 'petrol_cng',
      },
    ];
  }

  getBodyTypeOptions() {
    return [
      { label: this.translate.instant('cars.bodyTypes.sedan'), value: 'sedan' },
      { label: this.translate.instant('cars.bodyTypes.wagon'), value: 'wagon' },
      {
        label: this.translate.instant('cars.bodyTypes.hatchback'),
        value: 'hatchback',
      },
      { label: this.translate.instant('cars.bodyTypes.suv'), value: 'suv' },
      { label: this.translate.instant('cars.bodyTypes.coupe'), value: 'coupe' },
      {
        label: this.translate.instant('cars.bodyTypes.convertible'),
        value: 'convertible',
      },
      { label: this.translate.instant('cars.bodyTypes.mpv'), value: 'mpv' },
      {
        label: this.translate.instant('cars.bodyTypes.pickup'),
        value: 'pickup',
      },
    ];
  }

  get filterFields(): FilterField[] {
    return [
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
        options: this.getFuelTypeOptions(),
      },
      {
        type: 'select',
        formControlName: 'bodyType',
        label: 'cars.filter.bodyType',
        placeholder: 'cars.filter.placeholders.bodyType',
        colSpan: 3,
        options: this.getBodyTypeOptions(),
      },
    ];
  }

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

  nestedTableHeaders: TableHeader[] = [
    { field: 'id', header: 'cars.table.id' },
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

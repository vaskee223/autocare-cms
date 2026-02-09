import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseCrudService } from '../../../core/services/base-crud.service';
import { Car } from '../../../core/interfaces/car.interface';
import { Maintenance } from '../../../core/interfaces/maintenance.interface';
import { FuelConsumption } from '../../../core/interfaces/fuel-consumption.interface';
import { Pagination } from '../../../core/interfaces/pagination.interface';
import { environment } from '../../../../environments/environment';
import { createQueryParams } from '../../../core/utils';

@Injectable({ providedIn: 'root' })
export class CarsService extends BaseCrudService<Car> {
  protected endpoint = 'cars';

  getCarMaintenances(
    carId: string | number,
    page: number,
    perPage: number,
    queryForm: Record<string, unknown>,
  ): Observable<{ data: Maintenance[]; pagination: Pagination }> {
    return this.http.get<{ data: Maintenance[]; pagination: Pagination }>(
      `${environment.apiUrl}/cars/${carId}/maintenances`,
      {
        params: createQueryParams(
          { page, limit: perPage, ...queryForm },
          false,
        ),
      },
    );
  }

  getCarFuelConsumptions(
    carId: string | number,
    page: number,
    perPage: number,
    queryForm: Record<string, unknown>,
  ): Observable<{ data: FuelConsumption[]; pagination: Pagination }> {
    return this.http.get<{ data: FuelConsumption[]; pagination: Pagination }>(
      `${environment.apiUrl}/cars/${carId}/fuel-consumptions`,
      {
        params: createQueryParams(
          { page, limit: perPage, ...queryForm },
          false,
        ),
      },
    );
  }
}

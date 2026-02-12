import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseCrudService } from '../../../core/services/base-crud.service';
import { User } from '../../../core/interfaces/user.interface';
import { Car } from '../../../core/interfaces/car.interface';
import { Pagination } from '../../../core/interfaces/pagination.interface';
import { environment } from '../../../../environments/environment';
import { createQueryParams } from '../../../core/utils';

@Injectable({ providedIn: 'root' })
export class UsersService extends BaseCrudService<User> {
  protected endpoint = 'users';

  getUserCars(
    userId: string | number,
    page: number,
    perPage: number,
    queryForm: Record<string, unknown>,
  ): Observable<{ data: Car[]; pagination: Pagination }> {
    return this.http.get<{ data: Car[]; pagination: Pagination }>(
      `${environment.apiUrl}/users/${userId}/cars`,
      {
        params: createQueryParams(
          { page, limit: perPage, ...queryForm },
          false,
        ),
      },
    );
  }
}

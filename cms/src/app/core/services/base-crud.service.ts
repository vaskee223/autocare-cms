import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Pagination } from '../interfaces/pagination.interface';
import { createQueryParams } from '../utils';

export abstract class BaseCrudService<T> {
  protected http = inject(HttpClient);
  protected abstract endpoint: string;

  getAll(
    page: number,
    perPage: number,
    queryForm: Record<string, unknown>,
  ): Observable<{ data: T[]; pagination: Pagination }> {
    return this.http.get<{ data: T[]; pagination: Pagination }>(
      `${environment.apiUrl}/${this.endpoint}`,
      {
        params: createQueryParams(
          { page, limit: perPage, ...queryForm },
          false,
        ),
      },
    );
  }

  getOne(id: string | number): Observable<{ data: T }> {
    return this.http.get<{ data: T }>(
      `${environment.apiUrl}/${this.endpoint}/${id}`,
    );
  }

  create(data: Partial<T>): Observable<{ message: string; data: T }> {
    return this.http.post<{ message: string; data: T }>(
      `${environment.apiUrl}/${this.endpoint}`,
      data,
    );
  }

  update(
    id: string | number,
    data: Partial<T>,
  ): Observable<{ message: string; data: T }> {
    return this.http.patch<{ message: string; data: T }>(
      `${environment.apiUrl}/${this.endpoint}/${id}`,
      data,
    );
  }

  delete(id: string | number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${environment.apiUrl}/${this.endpoint}/${id}`,
    );
  }
}

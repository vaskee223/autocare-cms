import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { User } from '../../../core/interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);

  getProfile(): Observable<{ data: User }> {
    return this.http.get<{ data: User }>(`${environment.apiUrl}/profile`);
  }

  updateProfile(
    data: Partial<User & { password: string; passwordConfirm: string }>,
  ): Observable<{ message: string; data: User }> {
    return this.http.patch<{ message: string; data: User }>(
      `${environment.apiUrl}/profile`,
      data,
    );
  }

  deleteProfile(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${environment.apiUrl}/profile`,
    );
  }
}

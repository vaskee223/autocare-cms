import { Injectable } from '@angular/core';

import { BaseCrudService } from '../../../core/services/base-crud.service';
import { User } from '../../../core/interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class UsersService extends BaseCrudService<User> {
  protected endpoint = 'users';
}

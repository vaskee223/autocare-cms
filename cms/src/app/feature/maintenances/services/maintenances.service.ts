import { Injectable } from '@angular/core';

import { BaseCrudService } from '../../../core/services/base-crud.service';
import { Maintenance } from '../../../core/interfaces/maintenance.interface';

@Injectable({ providedIn: 'root' })
export class MaintenancesService extends BaseCrudService<Maintenance> {
  protected endpoint = 'maintenances';
}

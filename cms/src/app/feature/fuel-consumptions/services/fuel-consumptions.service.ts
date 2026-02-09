import { Injectable } from '@angular/core';

import { BaseCrudService } from '../../../core/services/base-crud.service';
import { FuelConsumption } from '../../../core/interfaces/fuel-consumption.interface';

@Injectable({ providedIn: 'root' })
export class FuelConsumptionsService extends BaseCrudService<FuelConsumption> {
  protected endpoint = 'fuel-consumptions';
}

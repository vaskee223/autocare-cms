export interface FuelConsumption {
  id: number;
  carId: number;
  refuelDate: string;
  emptyDate: string | null;
  litersRefueled: number;
  pricePerLiter: number;
  startMileage: number;
  endMileage: number | null;
  distanceTraveled: number | null;
  consumptionPer100km: number | null;
  costPer100km: number | null;
  totalCost: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

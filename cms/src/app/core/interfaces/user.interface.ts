export interface User {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalCars: number;
  totalMaintenances: number;
  totalFuelConsumptions: number;
}

export interface ReplacedPart {
  name: string;
  price: number;
}

export interface Maintenance {
  id: number;
  carId: number;
  name: string;
  mileage: number;
  date: string;
  replacedParts: ReplacedPart[];
  servicePrice: number;
  createdAt: string;
  updatedAt: string;
}

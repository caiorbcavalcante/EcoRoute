import { Point } from './point.model';

export interface ChargingStation {
  id: number;
  name: string;
  location: Point;
  power: number;
}
import { Item } from './item.model';

export interface Vehicle {
  id: number,
  maxBattery: number,
  currentBattery: number,
  consumptionRate: number,
  cargo: Item[],
}

export interface Location {
  x: number;
  y: number;
}

export interface ChargingStation {
  id?: number;
  name: string;
  location: Location;
  power: number;
}
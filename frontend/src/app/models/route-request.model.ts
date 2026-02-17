export interface DeliveryDTO {
  id: number;
  x: number;
  y: number;
}

export interface RouteRequest {
  vehicleId: number;
  vehicleMaxAutonomy: number;
  depotX: number;
  depotY: number;
  deliveries: DeliveryDTO[];
}

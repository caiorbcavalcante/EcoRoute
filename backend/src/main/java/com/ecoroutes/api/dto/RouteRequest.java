package com.ecoroutes.api.dto;

import lombok.Data;
import java.util.List;

@Data
public class RouteRequest {

    private Long vehicleId;
    private double vehicleMaxAutonomy;

    private double depotX;
    private double depotY;

    private List<DeliveryDTO> deliveries;

}

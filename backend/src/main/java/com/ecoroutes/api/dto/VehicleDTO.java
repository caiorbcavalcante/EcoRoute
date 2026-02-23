package com.ecoroutes.api.dto;

import java.util.List;

public class VehicleDTO {
    Long id;
    double maxBattery;
    double currentBattery;
    double consumptionRate;
    List<ItemDTO> cargo;
}

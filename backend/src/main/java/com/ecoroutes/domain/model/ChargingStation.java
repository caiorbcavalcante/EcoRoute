package com.ecoroutes.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChargingStation {
    private Long id;
    private String name;
    private Coordinate location;
    private double power; // kW (potência de recarga)
}
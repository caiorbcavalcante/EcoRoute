package com.ecoroutes.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChargingStationDTO {
    private Long id;
    private String name;
    private double x;
    private double y;
    private double power;
}
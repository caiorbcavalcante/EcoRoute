package com.ecoroutes.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Vehicle {

    private Long id;
    private double maxAutonomy;

}

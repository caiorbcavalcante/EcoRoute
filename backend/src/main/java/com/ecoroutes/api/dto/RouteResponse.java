package com.ecoroutes.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class RouteResponse {

    private List<PointDTO> path;
    private double totalDistance;

}

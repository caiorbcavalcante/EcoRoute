package com.ecoroutes.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class Route {
    private Vehicle vehicle;
    private List<Coordinate> path;
    private double totalDistance;
    private double energyUsed;
    private double remainingEnergy;

    public Route(Vehicle vehicle, List<Coordinate> path, double totalDistance) {
        this.vehicle = vehicle;
        this.path = path;
        this.totalDistance = totalDistance;

        // Taxa de consumo ajustada para 0.05 (igual ao frontend)
        double consumptionRate = 0.05;
        this.energyUsed = totalDistance * consumptionRate;
        this.remainingEnergy = vehicle.getMaxAutonomy() - energyUsed;
    }
}
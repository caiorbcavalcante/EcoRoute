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

    // Construtor principal: já calcula energia gasta e restante
    public Route(Vehicle vehicle, List<Coordinate> path, double totalDistance) {
        this.vehicle = vehicle;
        this.path = path;
        this.totalDistance = totalDistance;

        double consumptionRate = 0.05; // consumo por unidade de distância
        this.energyUsed = totalDistance * consumptionRate;
        this.remainingEnergy = vehicle.getMaxBattery() - energyUsed;
    }
}
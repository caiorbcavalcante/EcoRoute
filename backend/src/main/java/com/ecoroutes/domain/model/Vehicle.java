package com.ecoroutes.domain.model;

import java.util.List;

import com.ecoroutes.exceptions.BusinessException;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Vehicle {

    private Long id;

    private double maxBattery;
    private double currentBattery;
    private double consumptionRate;

    private List<Item> cargo = new ArrayList<>();

    public void consume(double distance) {
        double energyUsed = distance * consumptionRate;

        if (currentBattery < energyUsed) {
            throw new BusinessException("Not enough battery.");
        }

        currentBattery -= energyUsed;
    }

    public void deliverOneItem() {
        if (cargo.isEmpty()) {
            throw new BusinessException("Vehicle has no items.");
        }
        cargo.remove(0);
    }
}
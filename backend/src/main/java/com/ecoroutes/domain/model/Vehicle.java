package com.ecoroutes.domain.model;

import com.ecoroutes.exceptions.BusinessException;
import com.ecoroutes.exceptions.EmptyCargoException;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    private Long id;
    private double maxBattery;
    private double currentBattery;
    private double consumptionRate;
    private List<Item> cargo = new ArrayList<>();

    public Vehicle(Long id, double maxBattery) {
        this.id = id;
        this.maxBattery = maxBattery;
        this.currentBattery = maxBattery;
        this.consumptionRate = 0.05;
        this.cargo = new ArrayList<>();
    }

    // Reduz a bateria conforme a distância percorrida
    public void consume(double distance) {
        double energyUsed = distance * consumptionRate;
        if (currentBattery < energyUsed) {
            throw new BusinessException("Not enough battery.");
        }
        currentBattery -= energyUsed;
    }

    // Entrega um item do veículo (remove do início da lista)
    public void deliverOneItem(){
        if (cargo == null || cargo.isEmpty()){
            throw new EmptyCargoException("The cargo doesn't seem to have any items...");
        }

        cargo.remove(0);
    }
}
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
    private double maxBattery;          // capacidade máxima da bateria
    private double currentBattery;       // carga atual
    private double consumptionRate;       // consumo por unidade de distância
    private List<Item> cargo = new ArrayList<>();

    // Construtor adicional para facilitar criação com valores padrão
    public Vehicle(Long id, double maxBattery) {
        this.id = id;
        this.maxBattery = maxBattery;
        this.currentBattery = maxBattery;        // começa com bateria cheia
        this.consumptionRate = 0.05;              // valor padrão (ajuste conforme necessidade)
        this.cargo = new ArrayList<>();
    }

    public void consume(double distance) {
        double energyUsed = distance * consumptionRate;
        if (currentBattery < energyUsed) {
            throw new BusinessException("Not enough battery.");
        }
        currentBattery -= energyUsed;
    }

    public void deliverOneItem(){
        if (cargo == null || cargo.isEmpty()){
            throw new EmptyCargoException("The cargo doesn't seem to have any items...");
        }

        cargo.remove(0);
    }
}
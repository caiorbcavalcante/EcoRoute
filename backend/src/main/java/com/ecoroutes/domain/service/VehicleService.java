package com.ecoroutes.domain.service;

import com.ecoroutes.domain.model.Vehicle;
import com.ecoroutes.domain.model.Item;
import com.ecoroutes.exceptions.BusinessException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class VehicleService {

    private final List<Vehicle> vehicles = new ArrayList<>();

    public Vehicle createVehicle(Long id, double maxAutonomy, List<Item> items) {
        // Usa o novo construtor que aceita id e maxBattery
        Vehicle vehicle = new Vehicle(id, maxAutonomy);
        // Adiciona os itens ao cargo (substitui a lista vazia)
        vehicle.setCargo(new ArrayList<>(items));
        vehicles.add(vehicle);
        return vehicle;
    }

    public Vehicle getVehicle(Long id) {
        return vehicles.stream()
                .filter(v -> v.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new BusinessException("Vehicle not found"));
    }
}
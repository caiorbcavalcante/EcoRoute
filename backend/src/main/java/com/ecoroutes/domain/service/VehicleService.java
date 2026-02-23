package com.ecoroutes.domain.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ecoroutes.domain.model.Vehicle;
import com.ecoroutes.exceptions.BusinessException;
import com.ecoroutes.domain.model.Item;

@Service
public class VehicleService {

    private final List<Vehicle> vehicles = new ArrayList<>();

    public Vehicle createVehicle(Long id, double maxAutonomy, List<Item> items) {
        Vehicle vehicle = new Vehicle(id, maxAutonomy, new ArrayList<>(items));
        vehicles.add(vehicle);
        return vehicle;
    }

    public Vehicle getVehicle(Long id) {
        return vehicles.stream()
                .filter(v -> v.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> 
                    new BusinessException("Vehicle not found"));
    }
}
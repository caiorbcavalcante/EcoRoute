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

    // Cria um veículo com autonomia máxima e carga inicial
    public Vehicle createVehicle(Long id, double maxAutonomy, List<Item> items) {
        Vehicle vehicle = new Vehicle(id, maxAutonomy);
        vehicle.setCargo(new ArrayList<>(items));
        vehicles.add(vehicle);
        return vehicle;
    }

    // Busca veículo por ID; lança exceção se não existir
    public Vehicle getVehicle(Long id) {
        return vehicles.stream()
                .filter(v -> v.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new BusinessException("Vehicle not found"));
    }

    // Entrega um item do veículo (remove o primeiro da lista)
    public void deliverOneItem(Long vehicleId){
        Vehicle vehicle = getVehicle(vehicleId);
        vehicle.deliverOneItem();
    }
}
package com.ecoroutes.application.service;

import com.ecoroutes.domain.model.ChargingStation;
import com.ecoroutes.domain.model.Coordinate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ChargingStationService {
    private final ConcurrentHashMap<Long, ChargingStation> store = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(1);

    public List<ChargingStation> findAll() {
        return new ArrayList<>(store.values());
    }

    public ChargingStation create(String name, double x, double y, double power) {
        Long id = idGenerator.getAndIncrement();
        ChargingStation station = new ChargingStation(id, name, new Coordinate(x, y), power);
        store.put(id, station);
        return station;
    }

    public void delete(Long id) {
        store.remove(id);
    }

    public void generateRandomStations(int count) {
        for (int i = 0; i < count; i++) {
            String name = "Station " + (i + 1);
            double x = Math.random() * 200 - 100;
            double y = Math.random() * 200 - 100;
            double power = 50 + Math.random() * 100;
            create(name, x, y, power);
        }
    }
}
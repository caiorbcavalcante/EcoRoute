package com.ecoroutes.application.service;

import com.ecoroutes.domain.model.ChargingStation;
import com.ecoroutes.domain.model.Coordinate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import jakarta.annotation.PostConstruct;

@Service
public class ChargingStationService {
    // Armazena estações em memória (simula um banco de dados)
    private final ConcurrentHashMap<Long, ChargingStation> store = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(1);

    // Retorna todas as estações cadastradas
    public List<ChargingStation> findAll() {
        return new ArrayList<>(store.values());
    }

    // Cria uma nova estação com os dados fornecidos
    public ChargingStation create(String name, double x, double y, double power) {
        Long id = idGenerator.getAndIncrement();
        ChargingStation station = new ChargingStation(id, name, new Coordinate(x, y), power, false);
        store.put(id, station);
        return station;
    }

    // Remove uma estação pelo ID
    public void delete(Long id) {
        store.remove(id);
    }

    // Gera estações aleatórias para testes (coordenadas entre -100 e 100)
    public void generateRandomStations(int count) {
        for (int i = 0; i < count; i++) {
            String name = "Station " + (i + 1);
            double x = Math.random() * 200 - 100;  // intervalo [-100, 100]
            double y = Math.random() * 200 - 100;
            double power = 50 + Math.random() * 100; // entre 50 e 150
            create(name, x, y, power);
        }
    }

    // Apenas para confirmar que o bean foi criado (pode ser removido depois)
    @PostConstruct
    public void init() {
        System.out.println("ChargingStationService bean CREATED");
    }
}
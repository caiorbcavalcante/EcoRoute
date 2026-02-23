package com.ecoroutes.domain.service;

import com.ecoroutes.domain.model.*;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class RouteCalculator {

    public Route calculate(
            Vehicle vehicle,
            Depot depot,
            List<Delivery> deliveries
    ) {

        List<Coordinate> path = new ArrayList<>();

        // Reset dos status de visita
        deliveries.forEach(d -> d.setVisited(false));

        Coordinate current = depot.getLocation();
        path.add(current);

        double totalDistance = 0;

        // Número de entregas não visitadas (já que começamos todas como não visitadas)
        int totalUnvisited = (int) deliveries.stream().filter(d -> !d.isVisited()).count();

        // Loop exatamente o número de entregas (cada iteração encontra a mais próxima)
        for (int i = 0; i < totalUnvisited; i++) {
            Coordinate currentPosition = current; // cópia efetivamente final para a lambda

            Delivery nearest = deliveries.stream()
                    .filter(d -> !d.isVisited())
                    .min((d1, d2) -> Double.compare(
                            currentPosition.distanceTo(d1.getLocation()),
                            currentPosition.distanceTo(d2.getLocation())
                    ))
                    .orElse(null);

            // Segurança: se não encontrar, interrompe (improvável, mas evita NullPointer)
            if (nearest == null) break;

            double distance = current.distanceTo(nearest.getLocation());
            totalDistance += distance;
            current = nearest.getLocation();
            path.add(current);
            nearest.setVisited(true);
        }

        // Retorno ao depósito (fecha o ciclo)
        totalDistance += current.distanceTo(depot.getLocation());
        path.add(depot.getLocation());

        // Cria e retorna o objeto Route
        return new Route(vehicle, path, totalDistance);
    }
}
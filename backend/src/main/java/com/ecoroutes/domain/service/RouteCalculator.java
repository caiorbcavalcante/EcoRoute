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

        // Garantir que nenhuma entrega comece como visitada
        deliveries.forEach(d -> d.setVisited(false));

        // Ponto de partida: o depósito
        Coordinate current = depot.getLocation();
        path.add(current);

        double totalDistance = 0;

        // Número total de entregas que precisam ser feitas
        int totalUnvisited = (int) deliveries.stream().filter(d -> !d.isVisited()).count();

        // Enquanto houver entregas, vai escolhendo a mais próxima
        for (int i = 0; i < totalUnvisited; i++) {
            Coordinate currentPosition = current;

            // Pega a entrega não visitada mais perto da posição atual
            Delivery nearest = deliveries.stream()
                    .filter(d -> !d.isVisited())
                    .min((d1, d2) -> Double.compare(
                            currentPosition.distanceTo(d1.getLocation()),
                            currentPosition.distanceTo(d2.getLocation())
                    ))
                    .orElse(null);

            if (nearest == null) break; // Por segurança, não que deva acontecer

            vehicle.deliverOneItem();

            // Calcula distância percorrida até essa entrega
            double distance = current.distanceTo(nearest.getLocation());
            totalDistance += distance;

            // Atualiza posição atual e marca como visitada
            current = nearest.getLocation();
            path.add(current);
            nearest.setVisited(true);
        }

        // Depois de todas as entregas, volta pro depósito
        totalDistance += current.distanceTo(depot.getLocation());
        path.add(depot.getLocation());

        // Monta o objeto final com rota e distância total
        return new Route(vehicle, path, totalDistance);
    }
}
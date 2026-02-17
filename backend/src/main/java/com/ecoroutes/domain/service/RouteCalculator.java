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

        deliveries.forEach(d -> d.setVisited(false));

        Coordinate current = depot.getLocation();
        path.add(current);

        double totalDistance = 0;

    while (deliveries.stream().anyMatch(d -> !d.isVisited())) {

        Coordinate currentPosition = current; // effectively final copy

        Delivery nearest = deliveries.stream()
                .filter(d -> !d.isVisited())
                .min((d1, d2) -> Double.compare(
                        currentPosition.distanceTo(d1.getLocation()),
                        currentPosition.distanceTo(d2.getLocation())
                ))
                .orElse(null);

        if (nearest == null) break;

        double distance = current.distanceTo(nearest.getLocation());
        totalDistance += distance;

        current = nearest.getLocation();
        path.add(current);
        nearest.setVisited(true);
    }

        // Closed loop
        totalDistance += current.distanceTo(depot.getLocation());
        path.add(depot.getLocation());

        return new Route(vehicle, path, totalDistance);
    }
}

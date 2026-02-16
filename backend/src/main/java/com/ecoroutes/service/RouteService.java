package com.ecoroutes.service;

import com.ecoroutes.model.Point;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RouteService {

    public List<Point> calculateNearestNeighborRoute(List<Point> points) {
        if (points.isEmpty()) return new ArrayList<>();

        List<Point> route = new ArrayList<>();
        
        // Reset visited status for a fresh calculation
        points.forEach(p -> p.setVisited(false));

        Point current = points.get(0);
        current.setVisited(true);
        route.add(current);

        // Find nearest unvisited neighbor
        for (int i = 1; i < points.size(); i++) {
            Point nearest = null;
            double shortestDistance = Double.MAX_VALUE;

            for (Point p : points) {
                if (!p.isVisited()) {
                    double dist = current.distanceTo(p);
                    if (dist < shortestDistance) {
                        shortestDistance = dist;
                        nearest = p;
                    }
                }
            }

            if (nearest != null) {
                nearest.setVisited(true);
                current = nearest;
                route.add(current);
            }
        }

        // Return to Start (Closed Loop)
        // We create a new object to avoid reference issues in JSON serialization
        Point startPoint = route.get(0);
        route.add(new Point(startPoint.getX(), startPoint.getY()));

        return route;
    }
}
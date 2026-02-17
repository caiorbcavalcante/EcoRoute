package com.ecoroutes.application.service;

import com.ecoroutes.domain.model.*;
import com.ecoroutes.domain.service.RouteCalculator;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RouteApplicationService {

    private final RouteCalculator routeCalculator;

    public RouteApplicationService(RouteCalculator routeCalculator) {
        this.routeCalculator = routeCalculator;
    }

    public Route execute(
            Vehicle vehicle,
            Depot depot,
            List<Delivery> deliveries
    ) {
        return routeCalculator.calculate(vehicle, depot, deliveries);
    }
}

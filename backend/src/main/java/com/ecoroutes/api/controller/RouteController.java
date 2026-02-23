package com.ecoroutes.api.controller;

import com.ecoroutes.api.dto.*;
import com.ecoroutes.application.service.RouteApplicationService;
import com.ecoroutes.domain.model.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = "http://localhost:4200")
public class RouteController {

    private final RouteApplicationService routeService;

    public RouteController(RouteApplicationService routeService) {
        this.routeService = routeService;
    }

    @PostMapping("/optimize")
    public RouteResponse optimize(@RequestBody RouteRequest request) {
        // Cria o veículo com id e autonomia máxima (bateria inicial = máxima)
        Vehicle vehicle = new Vehicle(
                request.getVehicleId(),
                request.getVehicleMaxAutonomy()
        );

        Depot depot = new Depot(
                new Coordinate(request.getDepotX(), request.getDepotY())
        );

        List<Delivery> deliveries = request.getDeliveries()
                .stream()
                .map(d -> new Delivery(
                        d.getId(),
                        new Coordinate(d.getX(), d.getY()),
                        false
                ))
                .collect(Collectors.toList());

        // Chama o serviço de rota (ainda não passamos charging stations, pode ser lista vazia)
        Route route = routeService.execute(vehicle, depot, deliveries);

        List<PointDTO> path = route.getPath()
                .stream()
                .map(p -> new PointDTO(p.getX(), p.getY()))
                .collect(Collectors.toList());

        return new RouteResponse(path, route.getTotalDistance());
    }
}
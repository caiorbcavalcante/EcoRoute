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

    // Endpoint que recebe os pontos de entrega e devolve a rota otimizada
    @PostMapping("/optimize")
    public RouteResponse optimize(@RequestBody RouteRequest request) {

        // Cria o veículo com base no ID e autonomia informados
        Vehicle vehicle = new Vehicle(
                request.getVehicleId(),
                request.getVehicleMaxAutonomy()
        );

        // Cada entrega vira um item no estoque do veículo
        List<Item> cargo = request.getDeliveries().stream()
                .map(d -> new Item("Package " + d.getId(), 1))
                .collect(Collectors.toList());

        // Carrega a carga no veículo
        vehicle.setCargo(cargo);

        // Define o depósito (ponto de partida e retorno)
        Depot depot = new Depot(
                new Coordinate(request.getDepotX(), request.getDepotY())
        );

        // Converte as entregas para o formato usado no cálculo
        List<Delivery> deliveries = request.getDeliveries()
                .stream()
                .map(d -> new Delivery(
                        d.getId(),
                        new Coordinate(d.getX(), d.getY()),
                        false
                ))
                .collect(Collectors.toList());

        // Executa o algoritmo de rota
        Route route = routeService.execute(vehicle, depot, deliveries);

        // Extrai apenas as coordenadas do caminho percorrido
        List<PointDTO> path = route.getPath()
                .stream()
                .map(p -> new PointDTO(p.getX(), p.getY()))
                .collect(Collectors.toList());

        // Retorna a resposta com o caminho e a distância total
        return new RouteResponse(path, route.getTotalDistance());
    }
}
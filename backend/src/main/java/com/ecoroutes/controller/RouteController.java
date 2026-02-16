package com.ecoroutes.controller;

import com.ecoroutes.model.Point;
import com.ecoroutes.service.RouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = "http://localhost:4200") // Allow Angular Access
public class RouteController {

    @Autowired
    private RouteService routeService;

    @PostMapping("/optimize")
    public List<Point> optimizeRoute(@RequestBody List<Point> points) {
        return routeService.calculateNearestNeighborRoute(points);
    }
}
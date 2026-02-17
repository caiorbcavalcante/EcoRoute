package com.ecoroutes.api.controller;

import com.ecoroutes.api.dto.ChargingStationDTO;
import com.ecoroutes.application.service.ChargingStationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stations")
@CrossOrigin(origins = "http://localhost:4200")
public class ChargingStationController {

    private final ChargingStationService stationService;

    public ChargingStationController(ChargingStationService stationService) {
        this.stationService = stationService;
    }

    @GetMapping
    public List<ChargingStationDTO> getAllStations() {
        return stationService.findAll().stream()
                .map(s -> new ChargingStationDTO(
                        s.getId(),
                        s.getName(),
                        s.getLocation().getX(),
                        s.getLocation().getY(),
                        s.getPower()))
                .collect(Collectors.toList());
    }

    @PostMapping
    public ChargingStationDTO createStation(@RequestBody ChargingStationDTO dto) {
        var station = stationService.create(
                dto.getName(),
                dto.getX(),
                dto.getY(),
                dto.getPower()
        );
        return new ChargingStationDTO(
                station.getId(),
                station.getName(),
                station.getLocation().getX(),
                station.getLocation().getY(),
                station.getPower()
        );
    }

    @DeleteMapping("/{id}")
    public void deleteStation(@PathVariable Long id) {
        stationService.delete(id);
    }
}
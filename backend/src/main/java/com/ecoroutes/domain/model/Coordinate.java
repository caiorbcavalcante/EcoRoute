package com.ecoroutes.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Coordinate {
    private double x;
    private double y;
    private boolean visited;

    // Construtor para criar coordenadas rapidamente
    public Coordinate(double x, double y) {
        this.x = x;
        this.y = y;
        this.visited = false;
    }

    // Calcula a distância euclidiana até outra coordenada
    public double distanceTo(Coordinate other) {
        return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
    }
}
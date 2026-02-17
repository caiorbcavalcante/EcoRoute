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

    // Custom constructor for easier instantiation
    public Coordinate(double x, double y) {
        this.x = x;
        this.y = y;
        this.visited = false;
    }

    public double distanceTo(Coordinate other) {
        return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
    }
}
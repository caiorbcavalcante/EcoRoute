package com.ecoroutes.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Point {
    private double x;
    private double y;
    private boolean visited;

    // Custom constructor for easier instantiation
    public Point(double x, double y) {
        this.x = x;
        this.y = y;
        this.visited = false;
    }

    public double distanceTo(Point other) {
        return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
    }
}
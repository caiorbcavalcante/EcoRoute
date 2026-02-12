package com.ecoroutes.model;

public class Ponto {
    double x;
    double y;
    boolean visitado = false;
    
    public Ponto(double x, double y){
        this.x = x;
        this.y = y;
    }

    public double distancia(Ponto outro){
        double dx = this.x - outro.x;
        double dy = this.y - outro.y;
        return Math.sqrt(dx*dx + dy*dy);
    }

    public boolean isVisitado() {
        return visitado;
    }

    public void setVisitado(boolean visitado) {
        this.visitado = visitado;
    }

    public double getX() {
        return x;
    }

    public double getY() {
        return y;
    }
}

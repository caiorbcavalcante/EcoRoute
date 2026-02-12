package com.ecoroutes.service;

import java.util.ArrayList;

import com.ecoroutes.model.Ponto;

public class TspService {
    
    public static ArrayList<Ponto> vizinhoMaisProximo(ArrayList<Ponto> pontos){
        ArrayList<Ponto> rota = new ArrayList<>();

        Ponto atual = pontos.get(0);
        atual.setVisitado(true);
        rota.add(atual);

        for (int i = 1; i < pontos.size(); i++){
            Ponto maisProximo = null;
            double menorDistancia = Double.MAX_VALUE;

            for (Ponto p : pontos){
                if (!p.isVisitado()){
                    double dist = atual.distancia(p);
                    if (dist < menorDistancia){
                        menorDistancia = dist;
                        maisProximo = p;
                    }
                }
            }

            atual = maisProximo;
            atual.setVisitado(true);
            rota.add(atual);
        }

        return rota;
    }
}

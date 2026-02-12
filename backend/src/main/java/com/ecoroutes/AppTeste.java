package com.ecoroutes;

import java.util.ArrayList;

import com.ecoroutes.model.Ponto;
import com.ecoroutes.service.TspService;

public class AppTeste {
    public static void main(String[] args) {

        ArrayList<Ponto> pontos = new ArrayList<>();

        // Adicionando pontos manualmente
        pontos.add(new Ponto(0, 0));
        pontos.add(new Ponto(2, 3));
        pontos.add(new Ponto(5, 1));
        pontos.add(new Ponto(6, 4));
        pontos.add(new Ponto(8, 2));

        // Gerar rota pelo vizinho mais próximo
        ArrayList<Ponto> rota = TspService.vizinhoMaisProximo(pontos);

        // Fechar o ciclo (voltar ao ponto inicial)
        rota.add(rota.get(0));

        // Calcular distância total
        double distanciaTotal = calcularDistancia(rota);

        // Mostrar rota
        System.out.println("===== ROTA =====");
        for (int i = 0; i < rota.size(); i++) {
            System.out.println(
                i + " -> (" + rota.get(i).getX() + ", " + rota.get(i).getY() + ")"
            );
        }

        System.out.println("\nDistância total: " + distanciaTotal);
    }

    public static double calcularDistancia(ArrayList<Ponto> rota) {
        double total = 0;

        for (int i = 0; i < rota.size() - 1; i++) {
            total += rota.get(i).distancia(rota.get(i + 1));
        }

        return total;
    }
}

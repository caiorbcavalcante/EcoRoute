import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnimationStateService {
  // Índice do trecho atual da rota (começa em 0)
  currentSegmentIndex$ = new BehaviorSubject<number>(0);
  
  // Distância (em unidades) até o próximo ponto de entrega
  distanceToNext$ = new BehaviorSubject<number>(0);
  
  // Distância total que ainda falta percorrer até o fim da rota
  remainingDistance$ = new BehaviorSubject<number>(0);
}
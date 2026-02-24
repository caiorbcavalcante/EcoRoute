import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnimationStateService {
  // Índice do segmento atual (0-based)
  currentSegmentIndex$ = new BehaviorSubject<number>(0);
  
  // Distância até o próximo ponto (no segmento atual)
  distanceToNext$ = new BehaviorSubject<number>(0);
  
  // Distância total restante (inclui o restante do segmento atual + todos os seguintes)
  remainingDistance$ = new BehaviorSubject<number>(0);
}
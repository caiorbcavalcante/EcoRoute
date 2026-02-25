import { Injectable } from '@angular/core';
import Chart from 'chart.js/auto';
import { Point } from '../models/point.model';
import { ChargingStation } from '../models/charging-station.model';
import { BatteryService } from './battery.service';
import { AnimationStateService } from './animation-state.service';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  private animationFrameId?: number;
  private baseSpeed = 0.01;
  private currentAngle = 0;
  private cameraX = 0;
  private cameraY = 0;
  private isRecharging = false;
  private consumptionRate = 0.01; // mesmo valor do backend/BatteryService

  constructor(
    private batteryService: BatteryService,
    private animationState: AnimationStateService
  ) {}

  setSpeed(value: number): void {
    this.baseSpeed = value * 0.01;
  }

  clearAnimation(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }

  animateVan(chart: Chart, route: Point[], chargingStations: ChargingStation[], isDetour = false): void {
    if (!chart || route.length < 2) return;

    this.clearAnimation();

    if (!isDetour){
      this.batteryService.resetBattery();
    }

    let segmentIndex = 0;
    let progress = 0;
    this.cameraX = route[0].x;
    this.cameraY = route[0].y;

    // Função para calcular distância entre dois pontos
    const distance = (a: Point, b: Point): number =>
      Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);

    // Função para encontrar a estação mais próxima de um ponto
    const findNearestStation = (pos: Point): ChargingStation | null => {
      let nearest: ChargingStation | null = null;
      let minDist = Infinity;
      for (const station of chargingStations) {
        const d = distance(pos, { x: station.location.x, y: station.location.y });
        if (d < minDist) {
          minDist = d;
          nearest = station;
        }
      }
      return nearest;
    };

    // Função para verificar se a bateria é suficiente para um segmento
    const hasEnoughBattery = (from: Point, to: Point): boolean => {
      const distToNext = distance(from, to);
      const nextStation = findNearestStation(to); // estação perto do destino

      if (!nextStation) return true; // se não houver estação, continua (evita travar)

      const distToStation = distance(to, { x: nextStation.location.x, y: nextStation.location.y });

      // Gasto total = (ida ao ponto + ida à estação) * taxa * margem de segurança
      const totalRequired = (distToNext + distToStation) * this.consumptionRate * 1.5;

      return this.batteryService.getBatteryLevel() >= totalRequired;
    };

    // Função para inserir um desvio na rota
    const insertDetour = (currentPos: Point, nextTarget: Point): Point[] => {
      const station = findNearestStation(currentPos);
      if (!station) return route; // sem estação, mantém rota original (talvez falhe)

      // Ponto da estação
      const stationPoint: Point = { x: station.location.x, y: station.location.y };

      // Nova rota: posição atual -> estação -> próximo destino -> restante
      const newRoute = [currentPos, stationPoint, nextTarget, ...route.slice(segmentIndex + 2)];
      return newRoute;
    };

    const animate = () => {
      const start = route[segmentIndex];
      const end = route[segmentIndex + 1];
      if (!start || !end) return;

      if (this.isRecharging) {
        this.animationFrameId = requestAnimationFrame(animate);
        return;
      }

      // --- Verificação de bateria antes de iniciar um novo segmento ---
      const currentBattery = this.batteryService.getBatteryLevel();
      const batteryThreshold = 30; // Desvia se cair abaixo de 30%

      if (currentBattery < batteryThreshold && !isDetour && !this.isRecharging) {
        const currentPos = { x: this.cameraX || start.x, y: this.cameraY || start.y };
        const nearest = findNearestStation(currentPos);

        if (nearest) {
          console.log('Bateria crítica! Mudando rota para estação próxima.');
          this.clearAnimation();

          const stationPoint = { x: nearest.location.x, y: nearest.location.y };

          // Nova rota: onde estou agora -> estação -> ponto que eu ia -> resto da rota
          const newRoute = [currentPos, stationPoint, end, ...route.slice(segmentIndex + 2)];

          chart.data.datasets[2].data = newRoute;
          chart.update('none');

          this.animateVan(chart, newRoute, chargingStations, true);
          return;
        }
      }
      // ----------------------------------------------------------------

      progress += this.baseSpeed;

      if (progress >= 1) {
        progress = 0;
        segmentIndex++;
        if (segmentIndex >= route.length - 1) {
          this.clearAnimation();
          return;
        }
      }

      const eased = this.ease(progress);
      const currentX = start.x + (end.x - start.x) * eased;
      const currentY = start.y + (end.y - start.y) * eased;

      // Verifica se está em uma estação (para recarga)
      const nearbyStation = chargingStations.find((station) => {
        const dx = currentX - station.location.x;
        const dy = currentY - station.location.y;
        return Math.sqrt(dx * dx + dy * dy) < 3; // raio de detecção
      });

      if (nearbyStation && !this.isRecharging && currentBattery < 98) {
        this.isRecharging = true;
        this.batteryService.recharge(() => {
          this.isRecharging = false;
          console.log('battery full, heading back');
        });
      }

      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);
      const distanceStep = segmentLength * this.baseSpeed;
      this.batteryService.consume(distanceStep);

      if (this.batteryService.getBatteryLevel() <= 0) {
        console.error('The battery ended in the middle of the route');
        this.clearAnimation();
        return;
      }

      // Atualiza estado da animação (para o painel)
      const distanceToNext = segmentLength * (1 - progress);
      const remainingDistance = this.calculateRemainingDistance(route, segmentIndex, progress);
      this.animationState.currentSegmentIndex$.next(segmentIndex);
      this.animationState.distanceToNext$.next(distanceToNext);
      this.animationState.remainingDistance$.next(remainingDistance);

      // Cálculo do ângulo da van
      const xAxis = chart.scales['x'];
      const yAxis = chart.scales['y'];
      const startPixelX = xAxis.getPixelForValue(start.x);
      const startPixelY = yAxis.getPixelForValue(start.y);
      const endPixelX = xAxis.getPixelForValue(end.x);
      const endPixelY = yAxis.getPixelForValue(end.y);
      const targetAngle = Math.atan2(endPixelY - startPixelY, endPixelX - startPixelX);
      const diff = this.normalizeAngle(targetAngle - this.currentAngle);
      this.currentAngle += diff * 0.15;
      const rotationDegrees = (this.currentAngle * 180) / Math.PI + 90;

      // Atualiza dataset da van
      (chart.data.datasets[3].data as any) = [{ x: currentX, y: currentY }];
      (chart.data.datasets[3] as any).rotation = rotationDegrees;

      // Câmera segue a van
      this.cameraX += (currentX - this.cameraX) * 0.08;
      this.cameraY += (currentY - this.cameraY) * 0.08;
      const range = 60;

      const xScale = chart.options.scales?.['x'];
      const yScale = chart.options.scales?.['y'];
      if (xScale && yScale) {
        xScale.min = this.cameraX - range;
        xScale.max = this.cameraX + range;
        yScale.min = this.cameraY - range;
        yScale.max = this.cameraY + range;
      }

      chart.update('none');
      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  private calculateRemainingDistance(route: Point[], currentSeg: number, progress: number): number {
    let remaining = 0;
    // Distância restante no segmento atual
    const start = route[currentSeg];
    const end = route[currentSeg + 1];
    const segLength = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
    remaining += segLength * (1 - progress);

    // Soma dos segmentos seguintes
    for (let i = currentSeg + 1; i < route.length - 1; i++) {
      const a = route[i];
      const b = route[i + 1];
      remaining += Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
    }
    return remaining;
  }

  private ease(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private normalizeAngle(angle: number): number {
    return Math.atan2(Math.sin(angle), Math.cos(angle));
  }
}
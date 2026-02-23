import { Injectable } from '@angular/core';
import Chart from 'chart.js/auto';
import { Point } from '../models/point.model';
import { ChargingStation } from '../models/charing-station.model';
import { BatteryService } from './battery.service';

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

  constructor(private batteryService: BatteryService) {}

  setSpeed(value: number): void {
    this.baseSpeed = value * 0.01;
  }

  clearAnimation(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }

  animateVan(chart: Chart, route: Point[], chargingStations: ChargingStation[]): void {
    if (!chart || route.length < 2) return;

    this.clearAnimation();
    this.batteryService.resetBattery();

    let segmentIndex = 0;
    let progress = 0;
    this.cameraX = route[0].x;
    this.cameraY = route[0].y;

    const animate = () => {
      const start = route[segmentIndex];
      const end = route[segmentIndex + 1];
      if (!start || !end) return;

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

      // Handle Charging Station logic
      const nearbyStation = chargingStations.find(station => {
        const dx = currentX - station.location.x;
        const dy = currentY - station.location.y;
        return Math.sqrt(dx * dx + dy * dy) < 5;
      });

      if (nearbyStation && !this.isRecharging) {
        this.isRecharging = true;
        this.batteryService.recharge();
        setTimeout(() => { this.isRecharging = false; }, 2000);
      }

      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);
      const distanceStep = segmentLength * this.baseSpeed;
      this.batteryService.consume(distanceStep);

      if (this.batteryService.getBatteryLevel() <= 0) {
        this.clearAnimation();
        return;
      }

      // Calculate Van Angle
      const xAxis = chart.scales['x'];
      const yAxis = chart.scales['y'];

      const startPixelX = xAxis.getPixelForValue(start.x);
      const startPixelY = yAxis.getPixelForValue(start.y);
      const endPixelX = xAxis.getPixelForValue(end.x);
      const endPixelY = yAxis.getPixelForValue(end.y);
      const targetAngle = Math.atan2(endPixelY - startPixelY, endPixelX - startPixelX);
      const diff = this.normalizeAngle(targetAngle - this.currentAngle);
      
      this.currentAngle += diff * 0.15;
      const rotationDegrees = (this.currentAngle * 180 / Math.PI) + 90;

      // Update Chart Data (Dataset 3 is the Van)
      (chart.data.datasets[3].data as any) = [{ x: currentX, y: currentY }];
      (chart.data.datasets[3] as any).rotation = rotationDegrees;

      // Camera Tracking
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

      // Trigger high-performance re-render
      chart.update('none');
      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  private ease(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private normalizeAngle(angle: number): number {
    return Math.atan2(Math.sin(angle), Math.cos(angle));
  }
}
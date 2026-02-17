import { Injectable } from '@angular/core';
import Chart from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Point } from '../models/point.model';
import { BatteryService } from './battery.service';
import { ChargingStation } from '../models/charing-station.model';

Chart.register(zoomPlugin);

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private chart?: Chart;
  private vanImage = new Image();
  private animationFrameId?: number;
  private baseSpeed = 0.01;
  private currentAngle = 0;
  private cameraX = 0;
  private cameraY = 0;

  private chargingStations: ChargingStation[] = [];
  private isRecharging = false;
  private currentRoute: Point[] = [];

  constructor(private batteryService: BatteryService) {
    this.vanImage.src = '/van-updated.png';
    this.vanImage.onload = () => console.log('Van image loaded');
    this.vanImage.onerror = () => console.warn('Van image failed to load');
  }

  setChargingStations(stations: ChargingStation[]): void {
    this.chargingStations = stations;
  }

  initialize(canvas: HTMLCanvasElement, points: Point[]): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const depot = points.length > 0 ? points[0] : { x: 0, y: 0 };
    const deliveryPoints = points.slice(1);

    this.chart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Delivery Points',
            data: deliveryPoints,
            backgroundColor: '#ff4081',
            pointRadius: 6,
            showLine: false
          },
          {
            label: 'Depot',
            data: [depot],
            backgroundColor: '#ffaa00',
            pointStyle: 'rect',
            pointRadius: 8,
            showLine: false
          },
          {
            label: 'Route',
            data: [],
            borderColor: '#00ffcc',
            backgroundColor: 'transparent',
            showLine: true,
            pointRadius: 0,
            borderWidth: 3
          },
          {
            label: 'Van',
            data: [{ x: depot.x, y: depot.y }],
            pointStyle: this.vanImage,
            pointRadius: 14,
            showLine: false,
            rotation: 0
          } as any,
          {
            label: 'Charging Stations',
            data: [],
            backgroundColor: '#4caf50',
            pointStyle: 'rectRounded',
            pointRadius: 8,
            showLine: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
          x: { type: 'linear', min: -100, max: 100 },
          y: { type: 'linear', min: -100, max: 100 }
        },
        plugins: {
          legend: { display: false },
          zoom: {
            pan: { enabled: true, mode: 'xy' },
            zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'xy' }
          }
        }
      },
      plugins: [
        {
          id: 'glowTrail',
          beforeDraw: (chart) => {
            const ctx = chart.ctx;
            ctx.save();
            ctx.shadowColor = '#00ffcc';
            ctx.shadowBlur = 20;
          },
          afterDraw: (chart) => {
            chart.ctx.restore();
          }
        },
        {
          id: 'vanShadow',
          beforeDatasetDraw: (chart, args) => {
            if (args.index === 3) {
              const ctx = chart.ctx;
              ctx.save();
              ctx.shadowColor = 'rgba(0,0,0,0.4)';
              ctx.shadowBlur = 15;
              ctx.shadowOffsetY = 6;
            }
          },
          afterDatasetDraw: (chart, args) => {
            if (args.index === 3) {
              chart.ctx.restore();
            }
          }
        },
        {
          id: 'directionArrows',
          afterDraw: (chart) => {
            if (this.currentRoute.length < 2) return;
            const ctx = chart.ctx;
            const xAxis = chart.scales['x'];
            const yAxis = chart.scales['y'];

            ctx.save();
            ctx.fillStyle = '#00ffcc';
            ctx.strokeStyle = '#00ffcc';
            ctx.lineWidth = 2;

            for (let i = 0; i < this.currentRoute.length - 1; i++) {
              const start = this.currentRoute[i];
              const end = this.currentRoute[i + 1];

              const startX = xAxis.getPixelForValue(start.x);
              const startY = yAxis.getPixelForValue(start.y);
              const endX = xAxis.getPixelForValue(end.x);
              const endY = yAxis.getPixelForValue(end.y);

              const midX = (startX + endX) / 2;
              const midY = (startY + endY) / 2;
              const angle = Math.atan2(endY - startY, endX - startX);
              const arrowSize = 15;

              ctx.save();
              ctx.translate(midX, midY);
              ctx.rotate(angle);
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(-arrowSize, -arrowSize / 2);
              ctx.lineTo(-arrowSize, arrowSize / 2);
              ctx.closePath();
              ctx.fillStyle = '#00ffcc';
              ctx.fill();
              ctx.restore();
            }
            ctx.restore();
          }
        }
      ]
    });
  }

  setSpeed(value: number): void {
    this.baseSpeed = value * 0.01;
  }

  getChart(): Chart | undefined {
    return this.chart;
  }

  updatePoints(points: Point[]): void {
    if (!this.chart) return;
    const depot = points.length > 0 ? points[0] : { x: 0, y: 0 };
    const deliveryPoints = points.slice(1);
    this.chart.data.datasets[0].data = deliveryPoints;
    this.chart.data.datasets[1].data = [depot];
    this.chart.update();
  }

  drawRoute(route: Point[], totalDistance?: number): void {
    if (!this.chart) return;
    this.clearAnimation();
    this.currentRoute = route;
    this.chart.data.datasets[2].data = route;
    this.chart.update();
    if (route.length > 1) {
      this.animateVan(route);
    }
    this.batteryService.resetBattery();
  }

  clearRoute(): void {
    if (!this.chart) return;
    this.clearAnimation();
    this.currentRoute = [];
    this.chart.data.datasets[2].data = [];
    const depot = this.chart.data.datasets[1].data[0] as Point;
    (this.chart.data.datasets[3].data as any) = [depot];
    this.chart.update();
  }

  updateChargingStations(stations: ChargingStation[]): void {
    if (!this.chart) return;
    this.chart.data.datasets[4].data = stations.map(s => s.location);
    this.chart.update();
  }

  private clearAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }

  private ease(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private normalizeAngle(angle: number): number {
    return Math.atan2(Math.sin(angle), Math.cos(angle));
  }

  private animateVan(route: Point[]): void {
    if (!this.chart) return;

    let segmentIndex = 0;
    let progress = 0;
    this.cameraX = route[0].x;
    this.cameraY = route[0].y;

    const animate = () => {
      if (!this.chart) return;

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

      // Verificar estação de recarga
      const nearbyStation = this.chargingStations.find(station => {
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

      // Ângulo da van: apontar para a direção do movimento
      const targetAngle = Math.atan2(end.y - start.y, end.x - start.x);
      const diff = this.normalizeAngle(targetAngle - this.currentAngle);
      this.currentAngle += diff * 0.15;
      const rotationDegrees = (this.currentAngle * 180 / Math.PI) + 90; // +90 se imagem apontar para cima

      (this.chart.data.datasets[3].data as any) = [{ x: currentX, y: currentY }];
      (this.chart.data.datasets[3] as any).rotation = rotationDegrees;

      // Câmera segue a van
      this.cameraX += (currentX - this.cameraX) * 0.08;
      this.cameraY += (currentY - this.cameraY) * 0.08;
      const range = 60;

      const xScale = this.chart.options.scales?.['x'];
      const yScale = this.chart.options.scales?.['y'];
      if (xScale && yScale) {
        xScale.min = this.cameraX - range;
        xScale.max = this.cameraX + range;
        yScale.min = this.cameraY - range;
        yScale.max = this.cameraY + range;
      }

      this.chart.update('none');
      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }
}
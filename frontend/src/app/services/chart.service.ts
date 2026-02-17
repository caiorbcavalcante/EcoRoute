import { Injectable } from '@angular/core';
import Chart from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Point } from '../models/point.model';

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

  // smooth camera
  private cameraX = 0;
  private cameraY = 0;

  initialize(canvas: HTMLCanvasElement, points: Point[]): void {
    this.vanImage.src = '/van-updated.png';

    this.vanImage.onload = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      this.chart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [
            {
              label: 'Points',
              data: points,
              backgroundColor: '#ff4081',
              pointRadius: 6,
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
              data: [{ x: 0, y: 0 }],
              pointStyle: this.vanImage,
              pointRadius: 14,
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
              pan: {
                enabled: true,
                mode: 'xy'
              },
              zoom: {
                wheel: { enabled: true },
                pinch: { enabled: true },
                mode: 'xy'
              }
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
              if (args.index === 2) {
                const ctx = chart.ctx;
                ctx.save();
                ctx.shadowColor = 'rgba(0,0,0,0.4)';
                ctx.shadowBlur = 15;
                ctx.shadowOffsetY = 6;
              }
            },
            afterDatasetDraw: (chart, args) => {
              if (args.index === 2) {
                chart.ctx.restore();
              }
            }
          }
        ]
      });
    };
  }

  setSpeed(value: number): void {
    this.baseSpeed = value * 0.01;
  }

  getChart(): Chart | undefined {
    return this.chart;
  }

  updatePoints(points: Point[]): void {
    if (!this.chart) return;
    this.chart.data.datasets[0].data = points;
    this.chart.update();
  }

  drawRoute(route: Point[]): void {
    if (!this.chart) return;

    this.clearAnimation();

    this.chart.data.datasets[1].data = route;
    this.chart.update();

    if (route.length > 1) {
      this.animateVan(route);
    }
  }

  clearRoute(): void {
    if (!this.chart) return;

    this.clearAnimation();

    this.chart.data.datasets[1].data = [];
    this.chart.data.datasets[2].data = [{ x: 0, y: 0 }];
    this.chart.update();
  }

  private clearAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }

  private ease(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
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

      // ---- Smooth rotation (no flip)
      const targetAngle = Math.atan2(
        end.y - start.y,
        end.x - start.x
      );

      const diff = this.normalizeAngle(targetAngle - this.currentAngle);
      this.currentAngle += diff * 0.15;

      const rotationDegrees =
        (this.currentAngle * 180 / Math.PI) + 90;

      // ---- Update van position
      this.chart.data.datasets[2].data = [{
        x: currentX,
        y: currentY
      }];

      (this.chart.data.datasets[2] as any).pointRotation =
        rotationDegrees;

      // ---- Smooth camera follow (lerp)
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

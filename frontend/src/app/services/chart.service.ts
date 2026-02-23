import { Injectable } from '@angular/core';
import Chart from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Point } from '../models/point.model';
import { ChargingStation } from '../models/charing-station.model';
import { AnimationService } from './animation.service';
import { glowTrailPlugin, vanShadowPlugin, getDirectionArrowsPlugin } from './chart-plugins';

Chart.register(zoomPlugin);

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private chart?: Chart;
  private vanImage = new Image();
  private chargingStations: ChargingStation[] = [];
  private currentRoute: Point[] = []; 

  constructor(private animationService: AnimationService) {
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
        glowTrailPlugin,
        vanShadowPlugin,
        getDirectionArrowsPlugin(() => this.currentRoute)
      ]
    });
  }

  setSpeed(value: number): void {
    this.animationService.setSpeed(value);
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
    
    this.animationService.clearAnimation();
    this.currentRoute = route;
    this.chart.data.datasets[2].data = route;
    this.chart.update();
    
    if (route.length > 1) {
      this.animationService.animateVan(this.chart, route, this.chargingStations);
    }
  }

  clearRoute(): void {
    if (!this.chart) return;
    
    this.animationService.clearAnimation();
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
}
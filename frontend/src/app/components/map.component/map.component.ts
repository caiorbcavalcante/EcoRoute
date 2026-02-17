import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteService } from '../../services/route.service';
import { ChartService } from '../../services/chart.service';
import { BatteryService } from '../../services/battery.service';
import { ChargingStationService } from '../../services/charging-station.service';
import { Point } from '../../models/point.model';
import { RouteInfoComponent } from '../route-info.component/route-info.component';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, RouteInfoComponent],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
  @ViewChild('routeCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  points: Point[] = [{ x: 0, y: 0 }];
  optimizedRoute: Point[] = [];
  manualMode = false;
  remainingEnergy = 100;
  totalDistance: number = 0;
  currentSegment?: number;
  distanceToNext?: number;
  remainingDistance?: number;

  constructor(
    private routeService: RouteService,
    private chartService: ChartService,
    private batteryService: BatteryService,
    private chargingStationService: ChargingStationService
  ) {}

  ngAfterViewInit(): void {
    this.chartService.initialize(this.canvasRef.nativeElement, this.points);
    this.remainingEnergy = this.batteryService.getBatteryLevel();
    this.batteryService.batteryDepleted$.subscribe(() => {
      alert('⚡ Vehicle ran out of battery!');
    });

    // Carregar estações de recarga
    this.chargingStationService.getAll().subscribe({
      next: (stations) => {
        this.chartService.setChargingStations(stations);
        this.chartService.updateChargingStations(stations);
      },
      error: (err) => console.error('Erro ao carregar estações', err)
    });

    setInterval(() => {
      this.remainingEnergy = this.batteryService.getBatteryLevel();
    }, 100);
  }

  toggleManualMode(): void {
    this.manualMode = !this.manualMode;
  }

  addRandomPoint(): void {
    const newPoint: Point = {
      x: Math.floor(Math.random() * 200 - 100),
      y: Math.floor(Math.random() * 200 - 100)
    };
    this.points.push(newPoint);
    this.chartService.updatePoints(this.points);
    this.chartService.clearRoute();
  }

  generate20RandomPoints(): void {
    this.points = [{ x: 0, y: 0 }];
    for (let i = 0; i < 19; i++) {
      this.points.push({
        x: Math.floor(Math.random() * 200 - 100),
        y: Math.floor(Math.random() * 200 - 100)
      });
    }
    this.chartService.updatePoints(this.points);
    this.chartService.clearRoute();
  }

  clear(): void {
    this.points = [{ x: 0, y: 0 }];
    this.chartService.updatePoints(this.points);
    this.chartService.clearRoute();
  }

  onCanvasClick(event: MouseEvent): void {
    if (!this.manualMode) return;
    const chart = this.chartService.getChart();
    if (!chart) return;
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const xScale = chart.scales['x'];
    const yScale = chart.scales['y'];
    const xValue = xScale.getValueForPixel(event.clientX - rect.left);
    const yValue = yScale.getValueForPixel(event.clientY - rect.top);
    if (xValue !== undefined && yValue !== undefined && !isNaN(xValue) && !isNaN(yValue)) {
      const newPoint: Point = { x: Math.round(xValue), y: Math.round(yValue) };
      this.points.push(newPoint);
      this.chartService.updatePoints(this.points);
      this.chartService.clearRoute();
    }
  }

  changeSpeed(event: any): void {
    const value = parseFloat(event.target.value);
    this.chartService.setSpeed(value);
  }

  // Otimização vizinho mais próximo
  optimize(): void {
    if (this.points.length < 2) return;
    const depot = this.points[0];
    const deliveries = this.points.slice(1).map((p, index) => ({
      id: index + 1,
      x: p.x,
      y: p.y
    }));
    const request = {
      vehicleId: 1,
      vehicleMaxAutonomy: 100,
      depotX: depot.x,
      depotY: depot.y,
      deliveries
    };
    this.routeService.optimize(request).subscribe({
      next: (response) => {
        this.optimizedRoute = response.path;
        this.batteryService.resetBattery();
        this.totalDistance = response.totalDistance;
        this.chartService.drawRoute(response.path, response.totalDistance);
        console.log('Total Distance:', response.totalDistance);
      },
      error: (err) => console.error(err)
    });
  }

  // Rota FIFO (ordem de inserção)
  fifoRoute(): void {
    if (this.points.length < 2) return;
    const depot = this.points[0];
    // A rota FIFO é simplesmente a ordem dos pontos (sem otimização)
    const fifoPath = [depot, ...this.points.slice(1), depot];
    // Calcula a distância total (para exibir)
    let totalDist = 0;
    for (let i = 0; i < fifoPath.length - 1; i++) {
      const a = fifoPath[i];
      const b = fifoPath[i + 1];
      totalDist += Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
    }
    this.optimizedRoute = fifoPath;
    this.totalDistance = totalDist;
    this.batteryService.resetBattery();
    this.chartService.drawRoute(fifoPath, totalDist);
  }

  // Gerar estações aleatórias (para teste)
  generateStations(): void {
    // Cria 5 estações aleatórias via backend
    for (let i = 0; i < 5; i++) {
      const station = {
        name: `Station ${Math.floor(Math.random() * 100)}`,
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        power: 50 + Math.random() * 100
      };
      this.chargingStationService.create(station).subscribe(() => {
        this.refreshStations();
      });
    }
  }

  clearStations(): void {
    this.chargingStationService.getAll().subscribe(stations => {
      stations.forEach(s => {
        this.chargingStationService.delete(s.id).subscribe();
      });
      this.refreshStations();
    });
  }

  private refreshStations(): void {
    this.chargingStationService.getAll().subscribe(stations => {
      this.chartService.setChargingStations(stations);
      this.chartService.updateChargingStations(stations);
    });
  }
}
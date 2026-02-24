import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { RouteService } from '../../services/route.service';
import { ChartService } from '../../services/chart.service';
import { BatteryService } from '../../services/battery.service';
import { ChargingStationService } from '../../services/charging-station.service';
import { AnimationStateService } from '../../services/animation-state.service';
import { Point } from '../../models/point.model';
import { ChargingStation } from '../../models/charging-station.model';
import { RouteInfoComponent } from '../route-info.component/route-info.component';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, RouteInfoComponent],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('routeCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  points: Point[] = [{ x: 0, y: 0 }];
  optimizedRoute: Point[] = [];
  manualMode = false;
  remainingEnergy = 100;
  totalDistance: number = 0;
  currentSegment?: number;
  distanceToNext?: number;
  remainingDistance?: number;

  fixedStations: ChargingStation[] = [
    { name: '1', location: { x: 50, y: 50 }, power: 100 },
    { name: '2', location: { x: -50, y: -50 }, power: 100 },
    { name: '3', location: { x: 50, y: -50 }, power: 100 },
    { name: '4', location: { x: -50, y: 50 }, power: 100 }
  ];

  private batterySub?: Subscription;
  private segmentSub?: Subscription;
  private distanceSub?: Subscription;
  private remainingSub?: Subscription;

  constructor(
    private routeService: RouteService,
    private chartService: ChartService,
    private batteryService: BatteryService,
    private chargingStationService: ChargingStationService,
    private animationState: AnimationStateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.chartService.initialize(this.canvasRef.nativeElement, this.points);
    this.chartService.setChargingStations(this.fixedStations);
    this.chartService.updateChargingStations(this.fixedStations);

    this.batterySub = this.batteryService.batteryLevel$.subscribe(level => {
      this.remainingEnergy = level;
      this.cdr.detectChanges();
    });

    this.batteryService.batteryDepleted$.subscribe(() => {
      alert('⚡ Vehicle ran out of battery!');
    });

    this.segmentSub = this.animationState.currentSegmentIndex$.subscribe(index => {
      this.currentSegment = index + 1;
      this.cdr.detectChanges();
    });

    this.distanceSub = this.animationState.distanceToNext$.subscribe(dist => {
      this.distanceToNext = Math.round(dist * 100) / 100;
      this.cdr.detectChanges();
    });

    this.remainingSub = this.animationState.remainingDistance$.subscribe(dist => {
      this.remainingDistance = Math.round(dist * 100) / 100;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.batterySub?.unsubscribe();
    this.segmentSub?.unsubscribe();
    this.distanceSub?.unsubscribe();
    this.remainingSub?.unsubscribe();
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
      },
      error: (err) => console.error(err)
    });
  }

  fifoRoute(): void {
    if (this.points.length < 2) return;
    const depot = this.points[0];
    const fifoPath = [depot, ...this.points.slice(1), depot];
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
}
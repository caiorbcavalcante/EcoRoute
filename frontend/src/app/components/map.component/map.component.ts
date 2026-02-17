import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteService } from '../../services/route.service';
import { ChartService } from '../../services/chart.service';
import { Point } from '../../models/point.model';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

  @ViewChild('routeCanvas')
  canvasRef!: ElementRef<HTMLCanvasElement>;

  points: Point[] = [{ x: 0, y: 0 }];
  optimizedRoute: Point[] = [];
  manualMode = false;

  constructor(
    private routeService: RouteService,
    private chartService: ChartService
  ) {}

  ngAfterViewInit(): void {
    this.chartService.initialize(
      this.canvasRef.nativeElement,
      this.points
    );
  }

  // --------------------------
  // UI INTERACTION METHODS
  // --------------------------

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

    if (
      xValue !== undefined &&
      yValue !== undefined &&
      !isNaN(xValue) &&
      !isNaN(yValue)
    ) {
      const newPoint: Point = {
        x: Math.round(xValue),
        y: Math.round(yValue)
      };

      this.points.push(newPoint);
      this.chartService.updatePoints(this.points);
      this.chartService.clearRoute();
    }
  }

  changeSpeed(event: any) {
  const value = parseFloat(event.target.value);
  this.chartService.setSpeed(value);
}


  // --------------------------
  // BACKEND INTEGRATION
  // --------------------------

  optimize(): void {
    if (this.points.length < 2) return;

    this.routeService.optimize(this.points).subscribe({
      next: (route) => {
        this.optimizedRoute = route;
        this.chartService.drawRoute(route);
      },
      error: (err) => {
        console.error('Backend error:', err);
      }
    });
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteService } from '../../services/route.service';
import { Point } from '../../models/point.model';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent {

  points: Point[] = [];
  optimizedRoute: Point[] = [];

  svgWidth = 600;
  svgHeight = 400;
  scaleFactor = 3;

  constructor(private routeService: RouteService) {}

  addRandomPoint() {
    const newPoint: Point = {
      x: Math.floor(Math.random() * 100),
      y: Math.floor(Math.random() * 100)
    };

    this.points.push(newPoint);
  }

  clear() {
    this.points = [];
    this.optimizedRoute = [];
  }

  optimize() {
    if (this.points.length < 2) return;

    this.routeService.optimize(this.points).subscribe({
      next: (route) => {
        this.optimizedRoute = route;
      },
      error: (err) => {
        console.error('Backend error:', err);
      }
    });
  }
}

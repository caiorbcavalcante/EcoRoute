import { Component } from '@angular/core';
import { RouteService } from './services/route.service';
import { Point } from './models/point.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  points: Point[] = [];
  optimizedRoute: Point[] = [];

  svgWidth = 600;
  svgHeight = 400;
  scaleFactor = 5;

  constructor(private routeService: RouteService) {}

  addRandomPoint() {
    const newPoint: Point = {
      x: Math.floor(Math.random() * 100),
      y: Math.floor(Math.random() * 100),
      visited: false
    };

    this.points.push(newPoint);
  }

  clear() {
    this.points = [];
    this.optimizedRoute = [];
  }

  optimize() {
    if (this.points.length < 2) return;

    this.routeService.optimize(this.points)
      .subscribe(route => {
        this.optimizedRoute = route;
      });
  }
}

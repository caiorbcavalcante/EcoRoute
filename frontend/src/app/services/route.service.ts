import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Point } from '../models/point.model';

@Injectable({
  providedIn: 'root'
})
export class RouteService {

  private apiUrl = 'http://localhost:8080/api/routes/optimize';

  constructor(private http: HttpClient) {}

  optimize(points: Point[]): Observable<Point[]> {
    return this.http.post<Point[]>(this.apiUrl, points);
  }
}

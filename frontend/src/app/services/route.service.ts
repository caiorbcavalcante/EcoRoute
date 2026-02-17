import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RouteRequest } from '../models/route-request.model';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private apiUrl = 'http://localhost:8080/api/routes/optimize';

  constructor(private http: HttpClient) {}

  optimize(request: RouteRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, request);
  }
}
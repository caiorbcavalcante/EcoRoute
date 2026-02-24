import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChargingStation } from '../models/charging-station.model';

@Injectable({
  providedIn: 'root'
})
export class ChargingStationService {
  private apiUrl = 'http://localhost:8080/api/stations';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ChargingStation[]> {
    return this.http.get<ChargingStation[]>(this.apiUrl);
  }

  create(station: Partial<ChargingStation>): Observable<ChargingStation> {
    return this.http.post<ChargingStation>(this.apiUrl, station);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
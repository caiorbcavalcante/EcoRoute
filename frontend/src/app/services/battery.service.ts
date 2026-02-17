import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BatteryService {
  private readonly MAX_BATTERY = 100;
  private readonly CONSUMPTION_RATE = 0.05;
  private batteryLevel = this.MAX_BATTERY;
  private batteryDepletedSubject = new Subject<void>();
  batteryDepleted$ = this.batteryDepletedSubject.asObservable();

  getBatteryLevel(): number {
    return this.batteryLevel;
  }

  resetBattery(): void {
    this.batteryLevel = this.MAX_BATTERY;
  }

  consume(distance: number): void {
    this.batteryLevel -= distance * this.CONSUMPTION_RATE;
    if (this.batteryLevel <= 0) {
      this.batteryLevel = 0;
      this.batteryDepletedSubject.next();
    }
  }

  recharge(): void {
    this.batteryLevel = this.MAX_BATTERY;
  }
}
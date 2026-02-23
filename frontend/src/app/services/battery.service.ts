import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BatteryService {
  private readonly MAX_BATTERY = 100;
  private readonly CONSUMPTION_RATE = 0.05;
  
  // BehaviorSubject holds the current state and emits it immediately to any new subscribers
  private batteryLevelSubject = new BehaviorSubject<number>(this.MAX_BATTERY);
  batteryLevel$ = this.batteryLevelSubject.asObservable();

  private batteryDepletedSubject = new Subject<void>();
  batteryDepleted$ = this.batteryDepletedSubject.asObservable();

  getBatteryLevel(): number {
    return this.batteryLevelSubject.value;
  }

  resetBattery(): void {
    this.batteryLevelSubject.next(this.MAX_BATTERY);
  }

  consume(distance: number): void {
    let currentLevel = this.batteryLevelSubject.value;
    currentLevel -= distance * this.CONSUMPTION_RATE;
    
    if (currentLevel <= 0) {
      currentLevel = 0;
      this.batteryLevelSubject.next(currentLevel);
      this.batteryDepletedSubject.next();
    } else {
      this.batteryLevelSubject.next(currentLevel);
    }
  }

  recharge(): void {
    this.batteryLevelSubject.next(this.MAX_BATTERY);
  }
}
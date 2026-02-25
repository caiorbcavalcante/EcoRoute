import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BatteryService {
  private readonly MAX_BATTERY = 100;
  private readonly CONSUMPTION_RATE = 0.1; // CASO FOR TESTAR CONSUMO DE ENERGIA MUDAR AQUI

  private chargingInterval?: any;

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

  recharge(onComplete?: () => void): void {
    // Se já houver um carregamento em curso, cancela para não duplicar a velocidade
    if (this.chargingInterval) {
      clearInterval(this.chargingInterval);
    }

    this.chargingInterval = setInterval(() => {
      const current = this.getBatteryLevel();

      if (current < this.MAX_BATTERY) {
        // aumenta a bateria gradualmente
        const nextValue = Math.min(current + 2, this.MAX_BATTERY);
        this.batteryLevelSubject.next(nextValue);
      } else {
        
        clearInterval(this.chargingInterval);
        this.chargingInterval = undefined;

        if (onComplete) {
          onComplete();
        }
      }
    }, 50); 
  }
}
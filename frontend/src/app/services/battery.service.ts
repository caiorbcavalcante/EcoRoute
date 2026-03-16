import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BatteryService {
  private readonly MAX_BATTERY = 100;
  private readonly CONSUMPTION_RATE = 0.2; // TROQUE AQUI CASO QUEIRA TESTAR CONSUMO

  private chargingInterval?: any;

  // Estado atual da bateria (inicia cheia)
  private batteryLevelSubject = new BehaviorSubject<number>(this.MAX_BATTERY);
  batteryLevel$ = this.batteryLevelSubject.asObservable();

  // Disparado quando a bateria chega a zero
  private batteryDepletedSubject = new Subject<void>();
  batteryDepleted$ = this.batteryDepletedSubject.asObservable();

  getBatteryLevel(): number {
    return this.batteryLevelSubject.value;
  }

  // Volta a bateria ao máximo
  resetBattery(): void {
    this.batteryLevelSubject.next(this.MAX_BATTERY);
  }

  // Reduz a bateria conforme a distância percorrida
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

  // Recarrega gradualmente até o máximo, opcionalmente chama callback ao final
  recharge(onComplete?: () => void): void {
    // Evita múltiplas recargas simultâneas
    if (this.chargingInterval) {
      clearInterval(this.chargingInterval);
    }

    this.chargingInterval = setInterval(() => {
      const current = this.getBatteryLevel();

      if (current < this.MAX_BATTERY) {
        const nextValue = Math.min(current + 2, this.MAX_BATTERY);
        this.batteryLevelSubject.next(nextValue);
      } else {
        clearInterval(this.chargingInterval);
        this.chargingInterval = undefined;

        if (onComplete) {
          onComplete();
        }
      }
    }, 50); // recarga rápida (50ms)
  }
}
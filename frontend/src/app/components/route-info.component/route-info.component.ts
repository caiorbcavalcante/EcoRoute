import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BatteryService } from '../../services/battery.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-route-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './route-info.component.html',
  styleUrls: ['./route-info.component.css']
})
export class RouteInfoComponent implements OnInit, OnDestroy {
  @Input() totalDistance: number = 0;
  @Input() deliveriesCount: number = 0;
  @Input() currentSegment?: number;
  @Input() totalSegments?: number;
  @Input() distanceToNext?: number; // distância até o próximo ponto
  @Input() remainingDistance?: number; // distância restante total

  energyConsumed: number = 0;
  remainingEnergy: number = 100;
  private batterySub?: Subscription;

  constructor(private batteryService: BatteryService) {}

  ngOnInit() {
    this.batterySub = interval(100).subscribe(() => {
      this.remainingEnergy = this.batteryService.getBatteryLevel();
      this.energyConsumed = 100 - this.remainingEnergy;
    });
  }

  ngOnDestroy() {
    this.batterySub?.unsubscribe();
  }
}
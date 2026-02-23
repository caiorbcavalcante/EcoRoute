import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BatteryService } from '../../services/battery.service';
import { Subscription } from 'rxjs';

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
  @Input() distanceToNext?: number;
  @Input() remainingDistance?: number; 

  energyConsumed: number = 0;
  remainingEnergy: number = 100;
  private batterySub?: Subscription;

  constructor(private batteryService: BatteryService) {}

  ngOnInit() {
    this.batterySub = this.batteryService.batteryLevel$.subscribe(level => {
      this.remainingEnergy = level;
      this.energyConsumed = 100 - level;
    });
  }

  ngOnDestroy() {
    this.batterySub?.unsubscribe();
  }
}